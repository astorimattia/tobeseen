import { redis } from './redis'

export type AnalyticsOptions = {
  key?: string
  from?: string
  to?: string
  visitorPage?: number
  visitorLimit?: number
  country?: string | null
  visitorId?: string | null
  timeZone?: string
  granularity?: 'day' | 'hour'
  search?: string
}

export async function getAnalyticsData(options: AnalyticsOptions = {}) {
  const {
    from: fromParam,
    to: toParam,
    visitorPage = 1,
    visitorLimit = 10,
    country: countryFilter = null,
    visitorId: visitorFilter = null,
    timeZone = 'UTC',
    granularity = 'day',
    search
  } = options

  // Date Range Logic
  const now = new Date();
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone }));

  let startYmd = fromParam;
  let endYmd = toParam;

  if (!startYmd && fromParam !== 'all') {
    const y = nowInTz.getFullYear();
    const m = String(nowInTz.getMonth() + 1).padStart(2, '0');
    const d = String(nowInTz.getDate()).padStart(2, '0');
    startYmd = `${y}-${m}-${d}`;
  }

  if (!endYmd && fromParam !== 'all') {
    const y = nowInTz.getFullYear();
    const m = String(nowInTz.getMonth() + 1).padStart(2, '0');
    const d = String(nowInTz.getDate()).padStart(2, '0');
    endYmd = `${y}-${m}-${d}`;
  }

  // Calculate Days Range
  const dates: string[] = [];
  if (fromParam === 'all') {
    const allViewKeys = await redis.keys('analytics:views:20*');
    let earliestDate = new Date();

    if (allViewKeys.length > 0) {
      const dateStrings = allViewKeys
        .map(k => k.split(':').pop())
        .filter(d => d && d.length === 10)
        .sort();

      if (dateStrings.length > 0) {
        earliestDate = new Date(`${dateStrings[0]}T00:00:00`);
      } else {
        earliestDate.setDate(earliestDate.getDate() - 30);
      }
    } else {
      earliestDate.setDate(earliestDate.getDate() - 30);
    }

    const current = new Date(earliestDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }
  } else {
    const s = new Date(startYmd!);
    s.setHours(0, 0, 0, 0);

    const eParts = endYmd!.split('-');
    const e = new Date(parseInt(eParts[0]), parseInt(eParts[1]) - 1, parseInt(eParts[2]), 23, 59, 59);

    while (s <= e) {
      const y = s.getFullYear();
      const m = String(s.getMonth() + 1).padStart(2, '0');
      const d = String(s.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      s.setDate(s.getDate() + 1);
    }
  }

  let totalViews = 0;
  let targetKeys: { view: string, visitor: string, label: string }[] = [];

  if (granularity === 'hour' && startYmd && endYmd) {
    const searchStart = new Date(startYmd);
    searchStart.setDate(searchStart.getDate() - 1);
    const searchEnd = new Date(endYmd);
    searchEnd.setDate(searchEnd.getDate() + 2);

    const current = new Date(searchStart);
    const validKeys: typeof targetKeys = [];

    while (current < searchEnd) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false,
        hourCycle: 'h23'
      }).formatToParts(current);

      const p: Record<string, string> = {};
      parts.forEach(({ type, value }) => p[type] = value);
      const localYmd = `${p.year}-${p.month}-${p.day}`;

      if (localYmd >= startYmd && localYmd <= endYmd) {
        const utcY = current.getUTCFullYear();
        const utcM = String(current.getUTCMonth() + 1).padStart(2, '0');
        const utcD = String(current.getUTCDate()).padStart(2, '0');
        const utcH = String(current.getUTCHours()).padStart(2, '0');

        const utcKeySuffix = `${utcY}-${utcM}-${utcD}T${utcH}`;

        validKeys.push({
          view: `analytics:views:${utcKeySuffix}`,
          visitor: `analytics:visitors:${utcKeySuffix}`,
          label: current.toISOString()
        });
      }
      current.setTime(current.getTime() + 3600 * 1000);
    }
    targetKeys = validKeys;
  } else {
    targetKeys = dates.map(d => ({
      view: `analytics:views:${d}`,
      visitor: `analytics:visitors:${d}`,
      label: d
    }));
  }

  const viewKeys = targetKeys.map(k => k.view);
  const visitorKeys = targetKeys.map(k => k.visitor);

  // Overview Totals (Daily Sums)
  const dailyViewKeys = dates.map(d => `analytics:views:${d}`);
  if (dailyViewKeys.length > 0) {
    const viewsPerDay = await redis.mget(dailyViewKeys);
    totalViews = viewsPerDay.reduce((acc: number, v: string | null) => acc + (parseInt(v || '0')), 0);
  }

  const dailyVisitorKeys = dates.map(d => `analytics:visitors:${d}`);
  const uniqueVisitors = await redis.pfcount(dailyVisitorKeys);

  // Chart Data (with subscriber counts)
  const chartData = [];
  if (targetKeys.length > 0) {
    const chartPipeline = redis.multi();
    viewKeys.forEach(k => chartPipeline.get(k));
    visitorKeys.forEach(k => chartPipeline.pfcount(k));

    // Fetch subscriber counts for each bucket
    const subscriberCountsPromise = Promise.all(targetKeys.map(async (k) => {
      let startTime: number, endTime: number;

      if (k.label.includes('T') || k.label.includes(':')) {
        const dateStr = k.view.split(':').pop();
        startTime = new Date(`${dateStr}:00:00.000Z`).getTime();
        endTime = new Date(`${dateStr}:59:59.999Z`).getTime();
      } else {
        const dateStr = k.label;
        startTime = new Date(`${dateStr}T00:00:00.000Z`).getTime();
        endTime = new Date(`${dateStr}T23:59:59.999Z`).getTime();
      }

      return await redis.zcount('subscribers', startTime, endTime);
    }));

    const [results, subscriberCounts] = await Promise.all([
      chartPipeline.exec(),
      subscriberCountsPromise
    ]);

    const mid = targetKeys.length;
    const viewCounts = results ? results.slice(0, mid).map(r => r[1]) : [];
    const visitorCounts = results ? results.slice(mid).map(r => r[1]) : [];

    for (let i = 0; i < targetKeys.length; i++) {
      chartData.push({
        date: targetKeys[i].label,
        views: parseInt((viewCounts[i] as unknown as string) || '0'),
        visitors: (visitorCounts[i] as unknown as number) || 0,
        subscribers: subscriberCounts[i] || 0
      });
    }
  }

  // Helper for Top Lists — with case normalization
  const getTop = async (keys: string[]) => {
    if (keys.length === 0) return [];
    const pipeline = redis.multi();
    keys.forEach(k => pipeline.zrevrange(k, 0, -1, 'WITHSCORES'));
    const results = await pipeline.exec();

    const agg = new Map<string, { original: string; score: number }>();
    results?.forEach((res) => {
      const dayList = res[1] as string[];
      if (Array.isArray(dayList)) {
        for (let i = 0; i < dayList.length; i += 2) {
          const val = dayList[i];
          const lowerVal = val.trim().toLowerCase();
          const score = Number(dayList[i + 1]);
          const current = agg.get(lowerVal) || { original: val.trim(), score: 0 };

          agg.set(lowerVal, {
            original: current.score > score ? current.original : val.trim(),
            score: current.score + score
          });
        }
      }
    });

    return Array.from(agg.values())
      .map(({ original: value, score }) => ({ value, score }))
      .filter(item => {
        const val = item.value.toLowerCase();
        if (val === 'unknown') return false;
        if (val.startsWith('/admin')) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  };

  const pageKeys = visitorFilter
    ? dates.map(d => `analytics:visitors:${visitorFilter}:pages:${d}`)
    : countryFilter
      ? dates.map(d => `analytics:pages:country:${countryFilter}:${d}`)
      : dates.map(d => `analytics:pages:${d}`);

  const countryKeys = dates.map(d => `analytics:countries:${d}`);

  const referrerKeys = countryFilter
    ? dates.map(d => `analytics:referrers:country:${countryFilter}:${d}`)
    : dates.map(d => `analytics:referrers:${d}`);

  const cityKeys = countryFilter
    ? dates.map(d => `analytics:cities:${countryFilter}:${d}`)
    : dates.map(d => `analytics:cities:all:${d}`);

  const visitorTopKeys = dates.map(d => `analytics:visitors:top:${d}`);

  const [pages, countries, referrers, cities, topVisitors] = await Promise.all([
    getTop(pageKeys),
    getTop(countryKeys),
    visitorFilter ? Promise.resolve([]) : getTop(referrerKeys),
    getTop(cityKeys),
    getTop(visitorTopKeys)
  ]);

  let finalReferrers = referrers;
  if (visitorFilter) {
    const meta = await redis.hgetall(`analytics:visitor:${visitorFilter}`);
    if (meta && meta.referrer && meta.referrer !== 'unknown') {
      finalReferrers = [{ value: meta.referrer, score: 1 }];
    }
  }

  // Helper to extract query/UTM params from visitor meta (keys prefixed with q_)
  const extractQueryParams = (meta: Record<string, string>): Record<string, string> => {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (key.startsWith('q_') && value && value !== 'unknown') {
        params[key.slice(2)] = value;
      }
    }
    return params;
  };

  // Helper to extract first-touch attribution from visitor meta (keys prefixed with ft_)
  const extractFirstTouch = (meta: Record<string, string>): Record<string, string> | null => {
    const ft: Record<string, string> = {};
    for (const [key, value] of Object.entries(meta)) {
      if (key.startsWith('ft_') && value) {
        ft[key.slice(3)] = value;
      }
    }
    return Object.keys(ft).length > 0 ? ft : null;
  };

  // Get Top Visitor Details
  const enrichedTopVisitors = await Promise.all(topVisitors.map(async (v) => {
    const vid = v.value;
    const [meta, email] = await Promise.all([
      redis.hgetall(`analytics:visitor:${vid}`),
      redis.get(`analytics:identity:${vid}`)
    ]);
    return {
      id: vid,
      value: v.score,
      email: email || null,
      ip: meta.ip || null,
      country: meta.country || null,
      city: meta.city || null,
      referrer: meta.referrer || null,
      org: meta.org || null,
      queryParams: extractQueryParams(meta),
      firstTouch: extractFirstTouch(meta),
    };
  }));

  // Filter out localhost and private IPs
  const isLocalhost = (ip: string | null) => {
    if (!ip) return false;
    return ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === 'localhost' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') ||
      ip.startsWith('172.21.') ||
      ip.startsWith('172.22.') ||
      ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') ||
      ip.startsWith('172.25.') ||
      ip.startsWith('172.26.') ||
      ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') ||
      ip.startsWith('172.29.') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.');
  };

  let filteredTopVisitors = enrichedTopVisitors.filter(v => !isLocalhost(v.ip));
  if (countryFilter) {
    filteredTopVisitors = filteredTopVisitors.filter(v => v.country === countryFilter);
  }

  // Recent Visitor Identities & Pagination logic
  let recentVisitorsKey = 'analytics:recent_visitors';
  if (countryFilter) {
    recentVisitorsKey = `analytics:recent_visitors:country:${countryFilter}`;
  }

  // Parse list entries — new format is "visitorId|epochMs", old format is just "visitorId"
  const parseEntry = (entry: string): { vid: string; visitTime: string | null } => {
    const pipeIdx = entry.lastIndexOf('|');
    if (pipeIdx !== -1) {
      const ts = entry.slice(pipeIdx + 1);
      const ms = parseInt(ts, 10);
      return { vid: entry.slice(0, pipeIdx), visitTime: isNaN(ms) ? null : new Date(ms).toISOString() };
    }
    return { vid: entry, visitTime: null };
  };

  let recentIds: string[] = [];
  let totalFilteredVisitors = 0;
  let filteredVisitors: Record<string, unknown>[] = [];

  if (search) {
    recentIds = await redis.lrange(recentVisitorsKey, 0, 5000);

    const allVisitors = await Promise.all(recentIds.map(async (entry) => {
      const { vid, visitTime } = parseEntry(entry);
      const [meta, email] = await Promise.all([
        redis.hgetall(`analytics:visitor:${vid}`),
        redis.get(`analytics:identity:${vid}`)
      ]);
      // Use the per-entry visit timestamp if available (new format with |epochMs).
      // Fall back to meta.lastSeen only for old-format entries (no embedded timestamp).
      return {
        id: vid,
        email: email || null,
        ip: meta.ip || null,
        country: meta.country || null,
        city: meta.city || null,
        referrer: meta.referrer || null,
        userAgent: meta.userAgent || null,
        org: meta.org || null,
        lastSeen: visitTime ?? meta.lastSeen ?? null,
        queryParams: extractQueryParams(meta),
        firstTouch: extractFirstTouch(meta),
      };
    }));

    // Filter out localhost
    let searchFiltered = allVisitors.filter(v => !isLocalhost(v.ip));

    // Apply search query — resolve country display names for matching
    const s = search.toLowerCase();
    searchFiltered = searchFiltered.filter(v => {
      let countryName = '';
      if (v.country) {
        try {
          const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
          countryName = regionNames.of(v.country) || v.country;
        } catch {
          countryName = v.country;
        }
      }

      return (
        (v.ip && v.ip.toLowerCase().includes(s)) ||
        (v.email && v.email.toLowerCase().includes(s)) ||
        (v.city && decodeURIComponent(v.city).toLowerCase().includes(s)) ||
        (v.country && v.country.toLowerCase().includes(s)) ||
        (countryName && countryName.toLowerCase().includes(s)) ||
        (v.org && v.org.toLowerCase().includes(s)) ||
        (v.referrer && v.referrer.toLowerCase().includes(s))
      );
    });

    totalFilteredVisitors = searchFiltered.length;

    const start = (visitorPage - 1) * visitorLimit;
    filteredVisitors = searchFiltered.slice(start, start + visitorLimit);

  } else {
    const total = await redis.llen(recentVisitorsKey);
    totalFilteredVisitors = total;
    const start = (visitorPage - 1) * visitorLimit;
    const end = start + visitorLimit - 1;
    recentIds = await redis.lrange(recentVisitorsKey, start, end);

    const visitors = await Promise.all(recentIds.map(async (entry) => {
      const { vid, visitTime } = parseEntry(entry);
      const [meta, email] = await Promise.all([
        redis.hgetall(`analytics:visitor:${vid}`),
        redis.get(`analytics:identity:${vid}`)
      ]);
      return {
        id: vid,
        email: email || null,
        ip: meta.ip || null,
        country: meta.country || null,
        city: meta.city || null,
        referrer: meta.referrer || null,
        userAgent: meta.userAgent || null,
        org: meta.org || null,
        lastSeen: visitTime ?? meta.lastSeen ?? null,
        queryParams: extractQueryParams(meta),
        firstTouch: extractFirstTouch(meta),
      };
    }));

    // Filter out localhost from recent visitors
    filteredVisitors = visitors.filter(v => !isLocalhost(v.ip));
  }

  return {
    overview: {
      views: totalViews,
      visitors: uniqueVisitors,
    },
    data: {
      chart: chartData,
      pages: pages.map(p => ({ name: p.value, value: p.score })),
      countries: countries.map(c => ({ name: c.value, value: c.score })),
      cities: cities.map(c => ({ name: c.value, value: c.score })),
      referrers: finalReferrers.map(r => ({ name: r.value, value: r.score })),
      topVisitors: filteredTopVisitors.slice(0, 50),
      recentVisitors: filteredVisitors,
      pagination: {
        page: visitorPage,
        limit: visitorLimit,
        total: totalFilteredVisitors,
        totalPages: Math.ceil(totalFilteredVisitors / visitorLimit)
      }
    }
  }
}
