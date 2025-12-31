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

        const subscribers = await redis.zRangeWithScores('subscribers', 0, -1);

        // Format for frontend: [{ email, date }, ...]
        // Reverse to show newest first
        const formatted = subscribers.reverse().map(sub => ({
            email: sub.value,
            timestamp: sub.score,
            date: new Date(sub.score).toLocaleString()
        }));

        return NextResponse.json({ count: formatted.length, subscribers: formatted });

    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}
