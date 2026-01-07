import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const getRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL is not set');
    return createClient({ url: redisUrl });
};

interface ZRangeItem {
    value: string;
    score: number;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const fromParam = searchParams.get('from'); // YYYY-MM-DD or 'all'
    const toParam = searchParams.get('to');     // YYYY-MM-DD
    const visitorPageStr = searchParams.get('visitorPage') || '1';
    const visitorLimitStr = searchParams.get('visitorLimit') || '10';
    const countryFilter = searchParams.get('country'); // Enable drill down
    const visitorFilter = searchParams.get('visitorId'); // Enable drill down by visitor

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
        const dates: string[] = [];
        const end = toParam ? new Date(toParam) : new Date();
        const start = fromParam === 'all'
            ? new Date('2024-01-01')
            : (fromParam ? new Date(fromParam) : new Date());

        const current = new Date(start);
        current.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(0, 0, 0, 0);

        while (current <= end) {
            dates.push(current.toISOString().slice(0, 10));
            current.setDate(current.getDate() + 1);
        }

        // 1. Aggregation
        let totalViews = 0;

        // Determine granular keys if single day
        // If from===to, user likely wants "today" or a specific day.
        // We check if dates.length === 1.
        const isSingleDay = dates.length === 1;

        let targetKeys: { view: string, visitor: string, label: string }[] = [];

        if (isSingleDay) {
            // Hourly granularity
            // dates[0] is YYYY-MM-DD
            const dateStr = dates[0];
            for (let i = 0; i < 24; i++) {
                // Hour: 00..23
                const hourStr = i.toString().padStart(2, '0');
                // Key format: analytics:views:YYYY-MM-DDTHH
                const keySuffix = `${dateStr}T${hourStr}`;
                targetKeys.push({
                    view: `analytics:views:${keySuffix}`,
                    visitor: `analytics:visitors:${keySuffix}`,
                    label: `${hourStr}:00`
                });
            }
        } else {
            // Daily granularity
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
                    const datePart = k.view.split(':').pop(); // 2024-01-01T12
                    const startDate = new Date(`${datePart}:00:00Z`); // Treat as UTC for storage consistency? 
                    // Actually, dates used in range loop are local/ISO string slices...
                    // Let's stick to the construction logic:
                    // Dates were generated as current.toISOString().slice(0, 10);
                    // Single day loop: const keySuffix = `${dateStr}T${hourStr}`;

                    // Reconstruct proper date object
                    const dateStr = k.view.split(':').pop(); // YYYY-MM-DDTHH
                    const s = new Date(dateStr + ':00:00Z'); // Assume UTC to match server time logic usually
                    // Wait, `dates.push(current.toISOString().slice(0, 10));` uses UTC.
                    // So our "Days" are UTC days.

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
            : dates.map(d => `analytics:pages:${d}`);

        const countryKeys = dates.map(d => `analytics:countries:${d}`);
        const referrerKeys = dates.map(d => `analytics:referrers:${d}`);
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
            getTop(referrerKeys),
            getTop(cityKeys),
            getTop(visitorTopKeys)
        ]);

        // Enrich Top Visitors with Metadata
        const enrichedTopVisitors = await Promise.all(topVisitors
            .filter(v => v.score > 1)
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
                    city: meta.city || null
                };
            }));

        // 2. Recent Visitor Identities
        // Switch back to ALL Recent Visitors as requested
        const recentVisitorsKey = 'analytics:recent_visitors';
        const visitorStart = (visitorPage - 1) * visitorLimit;
        const visitorEnd = visitorStart + visitorLimit - 1;

        const totalVisitors = await redis.lLen(recentVisitorsKey);
        const recentIds = await redis.lRange(recentVisitorsKey, visitorStart, visitorEnd);

        const visitors = await Promise.all(recentIds.map(async (vid) => {
            const [meta, email] = await Promise.all([
                redis.hGetAll(`analytics:visitor:${vid}`),
                redis.get(`analytics:identity:${vid}`)
            ]);
            return {
                id: vid,
                ...meta,
                email: email || null
            };
        }));

        const visitorPagination = {
            page: visitorPage,
            limit: visitorLimit,
            total: totalVisitors,
            totalPages: Math.ceil(totalVisitors / visitorLimit)
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
                referrers: referrers.map(r => ({ name: r.value, value: r.score })),
                topVisitors: enrichedTopVisitors,
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
