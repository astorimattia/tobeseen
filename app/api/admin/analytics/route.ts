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
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || key !== adminPassword) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = getRedisClient();
    try {
        if (!redis.isOpen) await redis.connect();

        const today = new Date().toISOString().slice(0, 10);

        // Fetch data for "Today"
        const [
            views,
            visitors,
            pages,
            countries,
            referrers
        ] = await Promise.all([
            redis.get(`analytics:views:${today}`),
            redis.pfCount(`analytics:visitors:${today}`),
            redis.zRangeWithScores(`analytics:pages:${today}`, 0, 4, { REV: true }), // Top 5
            redis.zRangeWithScores(`analytics:countries:${today}`, 0, 4, { REV: true }), // Top 5
            redis.zRangeWithScores(`analytics:referrers:${today}`, 0, 4, { REV: true }), // Top 5
        ]);

        return NextResponse.json({
            overview: {
                views: parseInt(views || '0'),
                visitors: visitors || 0,
            },
            data: {
                pages: pages.map(p => ({ name: p.value, value: p.score })),
                countries: countries.map(c => ({ name: c.value, value: c.score })),
                referrers: referrers.map(r => ({ name: r.value, value: r.score })),
            }
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        // Fallback for empty data
        return NextResponse.json({
            overview: { views: 0, visitors: 0 },
            data: { pages: [], countries: [], referrers: [] }
        });
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}
