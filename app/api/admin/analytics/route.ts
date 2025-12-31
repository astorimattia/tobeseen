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

        const viewKeys = dates.map(d => `analytics:views:${d}`);
        const visitorKeys = dates.map(d => `analytics:visitors:${d}`);
        const pageKeys = dates.map(d => `analytics:pages:${d}`);
        const countryKeys = dates.map(d => `analytics:countries:${d}`);
        const referrerKeys = dates.map(d => `analytics:referrers:${d}`);

        if (viewKeys.length > 0) {
            const viewsPerDay = await redis.mGet(viewKeys);
            totalViews = viewsPerDay.reduce((acc, v) => acc + (parseInt(v || '0')), 0);
        }

        const uniqueVisitors = await redis.pfCount(visitorKeys);

        // Chart Data (Views & Visitors per day)
        const chartData = [];
        if (dates.length > 0) {
            // We already got total views from `viewKeys`.
            // Now we need daily unique visitors.
            // Redis pfCount multiple keys merges them (Count of Union).
            // To get daily counts, we need individual pfCounts.

            const chartPipeline = redis.multi();
            viewKeys.forEach(k => chartPipeline.get(k));
            visitorKeys.forEach(k => chartPipeline.pfCount(k));

            const results = await chartPipeline.exec();

            // Results are flattened: [ViewDay1, ViewDay2..., VisitorDay1, VisitorDay2...]
            const mid = dates.length;
            const dailyViews = results.slice(0, mid);
            const dailyVisitors = results.slice(mid);

            for (let i = 0; i < dates.length; i++) {
                chartData.push({
                    date: dates[i],
                    views: parseInt((dailyViews[i] as unknown as string) || '0'),
                    visitors: (dailyVisitors[i] as unknown as number) || 0
                });
            }
        }

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
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
        };

        const [pages, countries, referrers] = await Promise.all([
            getTop(pageKeys),
            getTop(countryKeys),
            getTop(referrerKeys)
        ]);

        // 2. Recent Visitor Identities
        const recentIds = await redis.lRange('analytics:recent_visitors', 0, 99);
        const uniqueRecentIds = Array.from(new Set(recentIds)).slice(0, 50);

        const visitors = await Promise.all(uniqueRecentIds.map(async (vid) => {
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

        return NextResponse.json({
            overview: {
                views: totalViews,
                visitors: uniqueVisitors,
            },
            data: {
                chart: chartData,
                pages: pages.map(p => ({ name: p.value, value: p.score })),
                countries: countries.map(c => ({ name: c.value, value: c.score })),
                referrers: referrers.map(r => ({ name: r.value, value: r.score })),
                recentVisitors: visitors
            }
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({
            overview: { views: 0, visitors: 0 },

            data: { chart: [], pages: [], countries: [], referrers: [], recentVisitors: [] }
        });
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}
