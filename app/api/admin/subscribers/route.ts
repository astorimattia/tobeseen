import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// Initialize Redis client securely (avoids creating multiple connections in dev)
const getRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL is not set');
    }
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

        // Fetch all subscribers with scores (timestamps)
        // ZRANGE key min max WITHSCORES (0 -1 means all)
        // We want them latest first, so we use ZREVRANGE
        // Note: node-redis functions for zRevRangeWithScores might differ slightly by version, 
        // usually zRangeWithScores with REV option is preferred in newer ones, but let's stick to standard zRange and reverse in JS or use zRange with options if needed.
        // Actually, let's just use zRangeWithScores and reverse the array in JS for simplicity and compatibility.

        // Pagination parameters
        const { searchParams } = new URL(req.url); // Re-obtained for clarity, though accessible above
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        // Get total count
        const total = await redis.zCard('subscribers');
        const totalPages = Math.ceil(total / limit);

        // Fetch paginated subscribers with scores (timestamps)
        // REV: true for latest first
        const subscribers = await redis.zRangeWithScores('subscribers', start, end, { REV: true });

        // Format for frontend: [{ email, date, country, city }, ...]
        const formatted = await Promise.all(subscribers.map(async (sub) => {
            const email = sub.value;
            // Fetch metadata
            const meta = await redis.hGetAll(`subscriber:${email}`);

            return {
                email,
                timestamp: sub.score,
                date: new Date(sub.score).toLocaleString(),
                country: meta?.country || 'Unknown',
                city: meta?.city || 'Unknown'
            };
        }));

        return NextResponse.json({
            subscribers: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}
