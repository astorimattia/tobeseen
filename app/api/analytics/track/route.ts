
import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, country, city, referrer, visitorId, ip, userAgent, queryParams, firstTouch } = body;

    // Basic validation
    if (!path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    // 1. Ignore Admin Paths
    if (path.startsWith('/admin')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // 2. Ignore Localhost and Personal IPs
    if (ip === '::1' || ip === '127.0.0.1') {
      return NextResponse.json({ success: true, ignored: true });
    }

    // 3. Ignore Bot Scans and Common Crawl Paths
    const isBotPath =
      path.includes('.php') ||
      path.includes('.txt') ||
      path.includes('.env') ||
      path.includes('.git') ||
      path.includes('.xml') ||
      path.includes('.js') ||
      path.includes('.css') ||
      // Font files
      path.includes('.otf') ||
      path.includes('.ttf') ||
      path.includes('.woff') ||
      path.includes('.woff2') ||
      // Image files
      path.includes('.webp') ||
      path.includes('.jpg') ||
      path.includes('.jpeg') ||
      path.includes('.png') ||
      path.includes('.gif') ||
      path.includes('.svg') ||
      path.includes('.ico') ||
      // Asset directories
      path.startsWith('/assets/') ||
      path.includes('feed') ||
      path.startsWith('/wp-') ||
      path.startsWith('/media/') ||
      path.startsWith('/api/') ||
      path.includes('txets');

    if (isBotPath) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Decode location data to avoid %20
    let safeCountry = country ? decodeURIComponent(country) : null;
    let safeCity = city ? decodeURIComponent(city) : null;
    let safeOrg: string | null = null;

    // Resolve location from IP if missing or unknown (server-side geolocation)
    const isCountryInvalid = !safeCountry || safeCountry.toLowerCase() === 'unknown';
    const isCityInvalid = !safeCity || safeCity.toLowerCase() === 'unknown';
    const isIpValid = ip && ip.toLowerCase() !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1';

    if ((isCountryInvalid || isCityInvalid) && isIpValid) {
      try {
        // Try ip-api.com first
        const res = await fetch(`http://ip-api.com/json/${ip}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            safeCountry = data.country;
            safeCity = data.city;
            safeOrg = data.org || data.isp || data.as;
          }
        }

        // Fallback to ipwho.is if still unknown
        if (!safeCountry || !safeCity) {
          const res2 = await fetch(`http://ipwho.is/${ip}`);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.success) {
              safeCountry = data2.country;
              safeCity = data2.city;
              safeOrg = data2.connection?.org || data2.connection?.isp || data2.connection?.asn?.toString();
            }
          }
        }
      } catch (e) {
        console.error('IP Geolocation failed:', e);
      }
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH

    // Two-tier deduplication:
    // Tier 1 (10s) — global per-visitor: blocks any burst of requests within 10s regardless of path
    // Tier 2 (30s) — per-visitor+path: prevents the same page being counted twice in 30s
    if (visitorId) {
      const globalDedupeKey = `analytics:dedup:${visitorId}`;
      const isNewVisitor = await redis.set(globalDedupeKey, '1', 'EX', 10, 'NX');
      if (!isNewVisitor) {
        return NextResponse.json({ success: true, deduped: true });
      }

      const pathDedupeKey = `analytics:dedup:${visitorId}:${path}`;
      const isNewPath = await redis.set(pathDedupeKey, '1', 'EX', 30, 'NX');
      if (!isNewPath) {
        return NextResponse.json({ success: true, deduped: true });
      }
    }

    // Check if visitor is identified
    let isIdentified = false;
    if (visitorId) {
      const identity = await redis.get(`analytics:identity:${visitorId}`);
      isIdentified = !!identity;
    }

    const pipeline = redis.multi();

    // 1. Total Page Views
    pipeline.incr(`analytics:views:${today}`);
    pipeline.incr(`analytics:views:${currentHour}`);

    // 2. Unique Visitors (HyperLogLog)
    if (visitorId) {
      pipeline.pfadd(`analytics:visitors:${today}`, visitorId);
      pipeline.pfadd(`analytics:visitors:${currentHour}`, visitorId);
    }

    // 3. Top Pages (Sorted Set)
    pipeline.zincrby(`analytics:pages:${today}`, 1, path);

    // 3b. Top Visitors (Sorted Set by View Count)
    if (visitorId) {
      pipeline.zincrby(`analytics:visitors:top:${today}`, 1, visitorId);
      pipeline.zincrby(`analytics:visitors:${visitorId}:pages:${today}`, 1, path);
    }

    // 4. Top Countries (Sorted Set)
    if (safeCountry && safeCountry !== 'unknown') {
      pipeline.zincrby(`analytics:countries:${today}`, 1, safeCountry);

      // 4a. Top Cities per Country
      if (safeCity && safeCity !== 'unknown') {
        pipeline.zincrby(`analytics:cities:${safeCountry}:${today}`, 1, safeCity);
        pipeline.zincrby(`analytics:cities:all:${today}`, 1, safeCity);
      }

      // 4c. Top Pages per Country
      pipeline.zincrby(`analytics:pages:country:${safeCountry}:${today}`, 1, path);
    }

    // 5. Top Referrers (Sorted Set) — with self-referral filtering
    let safeReferrer = 'Direct';
    if (referrer) {
      try {
        const domain = new URL(referrer).hostname;
        // Filter out self-referrals and localhost
        if (!domain.includes('tobeseen') && !domain.includes('localhost')) {
          safeReferrer = domain;
          pipeline.zincrby(`analytics:referrers:${today}`, 1, domain);
          if (safeCountry && safeCountry !== 'unknown') {
            pipeline.zincrby(`analytics:referrers:country:${safeCountry}:${today}`, 1, domain);
          }
        }
      } catch { }
    }

    // 6. Visitor Metadata & Identity
    if (visitorId) {
      const metaKey = `analytics:visitor:${visitorId}`;

      const visitorMeta: Record<string, string> = {
        ip: ip || 'unknown',
        country: safeCountry || 'unknown',
        city: safeCity || 'unknown',
        referrer: safeReferrer,
        userAgent: userAgent || 'unknown',
        org: safeOrg || 'unknown',
      };

      // Merge query parameters — skip platform tracking IDs and analytics noise
      const NOISE_PARAMS = new Set(['fbclid', 'gclid', 'msclkid', 'dclid', '_ga', '_gid', '_gl', 'igshid', 'mc_eid', 'ref']);
      const PLATFORM_CLICK_IDS: Record<string, string> = {
        fbclid: 'facebook',
        igshid: 'instagram',
        gclid: 'google_ads',
        msclkid: 'microsoft_ads',
        dclid: 'google_display',
      };

      let inferredSource: string | null = null;
      if (queryParams && typeof queryParams === 'object') {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (!value || typeof value !== 'string') return;
          if (NOISE_PARAMS.has(key)) {
            if (PLATFORM_CLICK_IDS[key] && !inferredSource) {
              inferredSource = PLATFORM_CLICK_IDS[key];
            }
            return;
          }
          visitorMeta[`q_${key}`] = value;
        });
      }

      // Store first-touch attribution (only written once, on first visit)
      const enrichedFirstTouch = firstTouch && inferredSource && !firstTouch.source || firstTouch?.source === 'direct'
        ? { ...firstTouch, source: inferredSource!, medium: firstTouch?.medium === 'none' ? 'social' : (firstTouch?.medium || 'social') }
        : firstTouch;

      if (enrichedFirstTouch && typeof enrichedFirstTouch === 'object') {
        Object.entries(enrichedFirstTouch).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            visitorMeta[`ft_${key}`] = value;
          }
        });
      }

      pipeline.hset(metaKey, visitorMeta);

      // Update Recent Identified Visitors List ONLY if identified
      if (isIdentified) {
        pipeline.lpush('analytics:recent_identified_visitors', visitorId);
      }

      // Filter blank entries — only push if visitor has valid data
      const hasValidIp = ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'unknown';
      const hasLocation = safeCountry && safeCountry !== 'unknown';

      if (isIdentified || hasValidIp || hasLocation) {
        // Third-tier list dedup (20s window) — prevents duplicate entries from serverless cold-start races
        const listDedupeKey = `analytics:list-dedup:${visitorId}`;
        const canPushToList = await redis.set(listDedupeKey, '1', 'EX', 20, 'NX');

        if (canPushToList) {
          const visitEntry = `${visitorId}|${Date.now()}`;
          pipeline.lpush('analytics:recent_visitors', visitEntry);
          pipeline.ltrim('analytics:recent_visitors', 0, 5000);

          // Country-specific list
          if (safeCountry && safeCountry !== 'unknown') {
            const countryKey = `analytics:recent_visitors:country:${safeCountry}`;
            pipeline.lpush(countryKey, visitEntry);
            pipeline.ltrim(countryKey, 0, 1000);
          }
        }
      }
    }

    // Set expiry for hourly keys
    const HOURLY_EXPIRY = 60 * 60 * 48; // 48 hours
    pipeline.expire(`analytics:views:${currentHour}`, HOURLY_EXPIRY);
    pipeline.expire(`analytics:visitors:${currentHour}`, HOURLY_EXPIRY);

    await pipeline.exec();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
