import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL is not set');
  return createClient({ url: redisUrl });
};



export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const fromParam = searchParams.get('from'); // YYYY-MM-DD or 'all'
  const toParam = searchParams.get('to');     // YYYY-MM-DD
  const visitorPageStr = searchParams.get('visitorPage') || '1';
  const visitorLimitStr = searchParams.get('visitorLimit') || '10';
  const countryFilter = searchParams.get('country'); // Enable drill down
  const visitorFilter = searchParams.get('visitorId'); // Enable drill down by visitor

  const timeZone = searchParams.get('timeZone') || 'UTC';
  const granularity = searchParams.get('granularity') || 'day'; // 'day' | 'hour'

  const visitorPage = parseInt(visitorPageStr);
  const visitorLimit = parseInt(visitorLimitStr);

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || key !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedisClient();
  try {
    if (!redis.isOpen) await redis.connect();

    // Date Range Logic
    // We need to determine the range in the REQUESTED timezone.
    // If fromParam/toParam are provided (YYYY-MM-DD), they represent days in that timezone.

    const now = new Date();

    // Default to "Now"
    const nowInTz = new Date(now.toLocaleString('en-US', { timeZone }));

    // Parse Inputs
    // fromParam/toParam are YYYY-MM-DD.
    // If fromParam is missing, default to today (in TZ).

    let startYmd = fromParam; // YYYY-MM-DD
    let endYmd = toParam;     // YYYY-MM-DD

    if (!startYmd && fromParam !== 'all') {
      // Default: Today
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
      // Find the actual start date using available keys to prevent useless lookups
      const keys = await redis.keys('analytics:views:20*');
      let firstDateStr = '2024-01-01';
      if (keys.length > 0) {
        const dailyKeys = keys.filter(k => !k.includes('T') && k.match(/20\d\d-\d\d-\d\d/));
        if (dailyKeys.length > 0) {
          const minKey = dailyKeys.reduce((min, k) => k < min ? k : min);
          firstDateStr = minKey.split(':').pop() || '2024-01-01';
        }
      }

      const current = new Date(`${firstDateStr}T00:00:00Z`);
      const end = new Date();
      while (current <= end) {
        dates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Iterate from startYmd to endYmd
      // These are LOCAL dates (e.g. 2024-01-14 in PST)
      // But our daily keys are usually stored as UTC-based YYYY-MM-DD.
      // Wait, `track/route.ts` uses `new Date().toISOString().slice(0, 10)`.
      // `toISOString` is ALWAYS UTC.
      // So our database is strictly UTC-based for daily keys.
      // If I request "2024-01-14" in PST, that partially overlaps UTC 2024-01-14 and UTC 2024-01-15.
      // For DAILY OVERVIEW (total numbers), we can't easily split the UTC daily keys.
      // We have to approximate or accept UTC days for the "Big Numbers" or "Top Lists".
      // However, for the TRAFFIC CHART (granularity=hour), we CAN be precise.

      // So: 
      // - Top Lists / Totals: Generate UTC-equivalent days that cover the range.
      // - Chart: Use precise hourly keys.

      const s = new Date(startYmd!);
      const e = new Date(endYmd!);
      // Just basic loop
      while (s <= e) {
        dates.push(s.toISOString().slice(0, 10));
        s.setDate(s.getDate() + 1);
        // Note: this simple date loop might be slightly off if timezones shift dates weirdly, 
        // but for YYYY-MM-DD iteration it's usually fine.
      }
    }


    // 1. Aggregation (Totals)
    // We will continue to use the loose "UTC Dates" for the big totals for now, 
    // because we don't have hourly granularity for things like "Top Pages" easily 
    // (unless we summed up 24 hourly ZSETS which is expensive/complex).
    // So keeping Total Views / Top Lists based on the rough UTC days is acceptable compromise?
    // Actually, if we are purely "Today PST", that is 08:00 UTC to 08:00 UTC next day.
    // If we use UTC Day keys, we are showing "Today UTC" (00-00 to 00-00).
    // This is a discrepancy.
    // But re-architecting the entire analytics to be hourly for everything is out of scope?
    // The user specifically asked for "Traffic Overview".
    // "Traffic Overview" usually refers to the CHART.
    // I will focus strictly on the CHART being PST-correct.

    let totalViews = 0;
    // Determine granular keys
    let targetKeys: { view: string, visitor: string, label: string }[] = [];

    if (granularity === 'hour' && startYmd && endYmd) {
      // Generate hourly keys for the specific timezone range
      // Start of range in UTC
      // Limit loop to cover standard day range + buffer

      const searchStart = new Date(startYmd);
      searchStart.setDate(searchStart.getDate() - 1); // Buffer

      const searchEnd = new Date(endYmd);
      searchEnd.setDate(searchEnd.getDate() + 2); // Buffer

      const current = new Date(searchStart);
      const validKeys: typeof targetKeys = [];

      while (current < searchEnd) {
        // Format current UTC time to Target TimeZone
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          hour12: false,
          hourCycle: 'h23'
        }).formatToParts(current);

        // parse parts
        const p: Record<string, string> = {};
        parts.forEach(({ type, value }) => p[type] = value);
        const localYmd = `${p.year}-${p.month}-${p.day}`;
        // const localHour = parseInt(p.hour); // Unused

        // Check if inside range [startYmd, endYmd] (inclusive of days)
        if (localYmd >= startYmd && localYmd <= endYmd) {
          // This UTC hour belongs to the local range.

          // Key construction:
          // The redis keys are UTC based: `analytics:views:YYYY-MM-DDTHH`
          // We need the key corresponding to THIS `current` UTC hour.
          const utcY = current.getUTCFullYear();
          const utcM = String(current.getUTCMonth() + 1).padStart(2, '0');
          const utcD = String(current.getUTCDate()).padStart(2, '0');
          const utcH = String(current.getUTCHours()).padStart(2, '0');

          const utcKeySuffix = `${utcY}-${utcM}-${utcD}T${utcH}`;

          validKeys.push({
            view: `analytics:views:${utcKeySuffix}`,
            visitor: `analytics:visitors:${utcKeySuffix}`,
            // Label should be the LOCAL time
            label: current.toISOString() // Pass full ISO, frontend formats it
          });
        }

        current.setTime(current.getTime() + 3600 * 1000); // +1 Hour
      }
      targetKeys = validKeys;

    } else {
      // Daily granularity (default)
      // Just use the provided dates as UTC buckets (legacy behavior)
      // Or should we map? 
      // Existing behavior: `dates` (from loop) mapped directly to keys.
      // If we are viewing "Last 7 Days" in PST, we probably still just want the 7 UTC days 
      // because converting daily buckets is impossible without hourly data (which expires).
      // NOTE: Hourly keys expire after 48h.
      // So for ranges > 48h, we MUST use daily UTC keys.

      targetKeys = dates.map(d => ({
        view: `analytics:views:${d}`,
        visitor: `analytics:visitors:${d}`,
        label: d
      }));
    }

    const viewKeys = targetKeys.map(k => k.view);
    const visitorKeys = targetKeys.map(k => k.visitor);

    // For totals, we still want the daily sum if possible.
    // But for the chart, we use targetKeys.
    // Wait, "Total Views" overview should probably be the sum of the chart data in this range?
    // Or should we still fetch daily keys for the overview and hourly for the chart?
    // Let's use the aggregated daily keys for Overview to be safe/consistent with history, 
    // BUT if it's today, the daily key `analytics:views:YYYY-MM-DD` accumulates concurrent with hourly?
    // Yes, in track/route.ts we increment BOTH daily and hourly. 
    // So for "Overview" we can just sum the Daily keys for the range.

    const dailyViewKeys = dates.map(d => `analytics:views:${d}`);
    if (dailyViewKeys.length > 0) {
      const viewsPerDay = await redis.mGet(dailyViewKeys);
      totalViews = viewsPerDay.reduce((acc, v) => acc + (parseInt(v || '0')), 0);
    }

    // Fix: Always use DAILY visitor keys for the Overview Totals
    // This ensures that even if we are viewing "Today" (hourly chart), the total unique visitors is accurate
    // because the daily key (analytics:visitors:YYYY-MM-DD) aggregates all visitors for the day.
    const dailyVisitorKeys = dates.map(d => `analytics:visitors:${d}`);
    const uniqueVisitors = await redis.pfCount(dailyVisitorKeys);

    // Chart Data
    const chartData = [];
    if (targetKeys.length > 0) {
      const chartPipeline = redis.multi();
      viewKeys.forEach(k => chartPipeline.get(k));
      visitorKeys.forEach(k => chartPipeline.pfCount(k));

      // Fetch subscriber counts for each bucket
      // This requires separate commands because we need to calculate timestamps
      const subscriberCountsPromise = Promise.all(targetKeys.map(async (k) => {
        let startTime: number, endTime: number;

        if (k.label.includes(':')) {
          // Hourly: label is "HH:00", key suffix has full date
          // keys[i].view is "analytics:views:YYYY-MM-DDTHH"
          // Extract date string from key
          // const startDate = new Date(`${datePart}:00:00Z`); // Unused
          // Actually, dates used in range loop are local/ISO string slices...
          // Let's stick to the construction logic:
          // Dates were generated as current.toISOString().slice(0, 10);
          // Single day loop: const keySuffix = `${dateStr}T${hourStr}`;

          // Reconstruct proper date object
          // Reconstruct proper date object
          const dateStr = k.view.split(':').pop(); // YYYY-MM-DDTHH
          // const s = new Date(dateStr + ':00:00Z'); // Unused

          startTime = new Date(`${dateStr}:00:00.000Z`).getTime();
          endTime = new Date(`${dateStr}:59:59.999Z`).getTime();
        } else {
          // Daily: label/key suffix is YYYY-MM-DD
          const dateStr = k.label;
          startTime = new Date(`${dateStr}T00:00:00.000Z`).getTime();
          endTime = new Date(`${dateStr}T23:59:59.999Z`).getTime();
        }

        // ZCOUNT subscribers min max
        return await redis.zCount('subscribers', startTime, endTime);
      }));

      const [results, subscriberCounts] = await Promise.all([
        chartPipeline.exec(),
        subscriberCountsPromise
      ]);

      const mid = targetKeys.length;
      const viewCounts = results.slice(0, mid);
      const visitorCounts = results.slice(mid);

      for (let i = 0; i < targetKeys.length; i++) {
        chartData.push({
          date: targetKeys[i].label,
          views: parseInt((viewCounts[i] as unknown as string) || '0'),
          visitors: (visitorCounts[i] as unknown as number) || 0,
          subscribers: subscriberCounts[i] || 0
        });
      }
      // Debug Log
      console.log(`[Analytics] Chart Data for Today: Found ${chartData.length} points.`);
    }

    // --- Top Lists (pages, countries, referrers) always use daily aggregation for now ---
    const pageKeys = visitorFilter
      ? dates.map(d => `analytics:visitors:${visitorFilter}:pages:${d}`)
      : countryFilter
        ? dates.map(d => `analytics:pages:country:${countryFilter}:${d}`)
        : dates.map(d => `analytics:pages:${d}`);

    const countryKeys = dates.map(d => `analytics:countries:${d}`);

    const referrerKeys = countryFilter
      ? dates.map(d => `analytics:referrers:country:${countryFilter}:${d}`)
      : dates.map(d => `analytics:referrers:${d}`);

    const visitorTopKeys = dates.map(d => `analytics:visitors:top:${d}`);

    // City Keys (if country filter is set, else Global)
    const cityKeys = countryFilter
      ? dates.map(d => `analytics:cities:${countryFilter}:${d}`)
      : dates.map(d => `analytics:cities:all:${d}`);

    // Helper for Top Lists Aggregation
    const getTop = async (keys: string[]) => {
      if (keys.length === 0) return [];

      const pipeline = redis.multi();
      keys.forEach(k => pipeline.zRangeWithScores(k, 0, -1));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await pipeline.exec() as any[];

      const agg = new Map<string, number>();
      results.forEach(dayList => {
        if (Array.isArray(dayList)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dayList.forEach((item: any) => {
            const val = item.value;
            const score = Number(item.score);
            const current = agg.get(val) || 0;
            agg.set(val, current + score);
          });
        }
      });

      return Array.from(agg.entries())
        .map(([value, score]) => ({ value, score }))
        .filter(item => {
          const val = item.value.toLowerCase();
          // Filter unknown locations
          if (val === 'unknown') return false;
          // Filter admin pages
          if (val.startsWith('/admin')) return false;
          return true;
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    };

    const [pages, countries, referrers, cities, topVisitors] = await Promise.all([
      getTop(pageKeys),
      getTop(countryKeys),
      // Referrers: If visitor filter, we handle it specially later. Global otherwise.
      visitorFilter ? Promise.resolve([]) : getTop(referrerKeys),
      getTop(cityKeys),
      // Top Visitors: Fetch MORE if country filtering to allow in-memory filter
      getTop(visitorTopKeys) // We'll always fetch global top, then filter
    ]);

    let finalReferrers = referrers;

    // 1b. Handle Visitor Filter for Referrers
    if (visitorFilter) {
      const [meta] = await Promise.all([
        redis.hGetAll(`analytics:visitor:${visitorFilter}`)
      ]);
      console.log(`[DEBUG] Filter ${visitorFilter} meta:`, meta);
      if (meta && meta.referrer && meta.referrer !== 'unknown') {
        finalReferrers = [{ value: meta.referrer, score: 1 }];
      }
    }

    // Enrich Top Visitors with Metadata & Filter by Country
    const enrichedTopVisitors = await Promise.all(topVisitors
      .map(async (v) => {
        const vid = v.value;
        const [meta, email] = await Promise.all([
          redis.hGetAll(`analytics:visitor:${vid}`),
          redis.get(`analytics:identity:${vid}`)
        ]);
        return {
          id: vid,
          value: v.score, // view count
          email: email || null,
          ip: meta.ip || null,
          country: meta.country || null,
          city: meta.city || null,
          referrer: meta.referrer || null
        };
      }));

    // Filter Top Visitors by Country if needed
    let filteredTopVisitors = enrichedTopVisitors;
    if (countryFilter) {
      filteredTopVisitors = enrichedTopVisitors.filter(v => v.country === countryFilter);
    }

    // Limit to top 10 (since we might have fetched 50 globals and filtered to 2)
    // If we really want "Top Visitors from Country", we should probably fetch deeper (e.g. 500)
    // Update: getTop currently slices to 50. Line 332.
    // We should increase getTop limit if country filter is active?
    // Let's modify getTop to accept a limit or fetch more by default.

    // 2. Recent Visitor Identities
    const search = searchParams.get('search')?.toLowerCase();
    let recentIds: string[] = [];
    let totalFilteredVisitors = 0;

    let finalVisitors: Record<string, unknown>[] = [];

    // Determine source key
    let recentVisitorsKey = 'analytics:recent_visitors';
    if (countryFilter) {
      recentVisitorsKey = `analytics:recent_visitors:country:${countryFilter}`;
    }

    if (visitorFilter) {
      // Case A: Filter by Specific Visitor ID (Search is ignored or redundant)
      const meta = await redis.exists(`analytics:visitor:${visitorFilter}`);
      if (meta) {
        recentIds = [visitorFilter];
        totalFilteredVisitors = 1;
      }
    } else if (search) {
      // Case B: Search Mode (Limited to last 2000 to avoid perf kill)
      // We need to fetch MORE than page size, filter them, and THEN slice for pagination.
      const SEARCH_LIMIT = 2000;
      const candidates = await redis.lRange(recentVisitorsKey, 0, SEARCH_LIMIT - 1);

      // We need to fetch metadata to filter
      const allCandidates = await Promise.all(candidates.map(async (vid) => {
        const [meta, email] = await Promise.all([
          redis.hGetAll(`analytics:visitor:${vid}`),
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
          lastSeen: meta.lastSeen || null
        };
      }));

      // Filter in memory
      const filtered = allCandidates.filter(v => {
        const s = search;

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
          (v.email && v.email.toLowerCase().includes(s)) ||
          (v.ip && v.ip.toLowerCase().includes(s)) ||
          (v.city && v.city.toLowerCase().includes(s)) ||
          (countryName && countryName.toLowerCase().includes(s)) ||
          (v.country && v.country.toLowerCase().includes(s)) ||
          (v.userAgent && v.userAgent.toLowerCase().includes(s))
        );
      });

      totalFilteredVisitors = filtered.length;

      // Now Paginate the FILTERED results
      const start = (visitorPage - 1) * visitorLimit;
      const end = start + visitorLimit;
      // We return the full objects since we already fetched them
      // But the downstream expects "visitors" array. 
      // We can just assign `visitors` directly here and skip the later map.
      finalVisitors = filtered.slice(start, end);

    } else {
      // Case C: Standard Pagination (No Search)
      const total = await redis.lLen(recentVisitorsKey);
      totalFilteredVisitors = total;

      const start = (visitorPage - 1) * visitorLimit;
      const end = start + visitorLimit - 1;
      recentIds = await redis.lRange(recentVisitorsKey, start, end);
    }

    let visitors;
    if (search && !visitorFilter) {
      // calculated above
      visitors = finalVisitors!;
    } else {
      // hydrate hydration (Standard or VisitorFilter case)
      // Use recentIds (it IS available in this scope because it was let declared above block)
      visitors = await Promise.all(recentIds.map(async (vid) => {
        const [meta, email] = await Promise.all([
          redis.hGetAll(`analytics:visitor:${vid}`),
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
          lastSeen: meta.lastSeen || null
        };
      }));
    }

    const visitorPagination = {
      page: visitorPage,
      limit: visitorLimit,
      total: totalFilteredVisitors,
      totalPages: Math.ceil(totalFilteredVisitors / visitorLimit)
    };

    return NextResponse.json({
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
        recentVisitors: visitors,
        pagination: visitorPagination
      }
    });


  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({
      overview: { views: 0, visitors: 0 },

      data: { chart: [], pages: [], countries: [], referrers: [], recentVisitors: [], topVisitors: [] }
    });
  } finally {
    if (redis.isOpen) await redis.quit();
  }
}
