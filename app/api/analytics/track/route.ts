import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// Initialize Redis client
const getRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL is not set');
    }
    return createClient({ url: redisUrl });
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { path, country, referrer, visitorId, ip, userAgent } = body;

        // Basic validation
        if (!path) {
            return NextResponse.json({ error: 'Missing path' }, { status: 400 });
        }

        const redis = getRedisClient();
        if (!redis.isOpen) await redis.connect();

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const pipeline = redis.multi();

        // 1. Total Page Views
        pipeline.incr(`analytics:views:${today}`);

        // 2. Unique Visitors (HyperLogLog)
        if (visitorId) {
            pipeline.pfAdd(`analytics:visitors:${today}`, visitorId);
        }

        // 3. Top Pages (Sorted Set)
        pipeline.zIncrBy(`analytics:pages:${today}`, 1, path);

        // 4. Top Countries (Sorted Set)
        if (country) {
            pipeline.zIncrBy(`analytics:countries:${today}`, 1, country);
        }

        // 5. Top Referrers (Sorted Set)
        if (referrer) {
            try {
                const domain = new URL(referrer).hostname;
                pipeline.zIncrBy(`analytics:referrers:${today}`, 1, domain);
            } catch {
                // Invalid URL
            }
        }

        // 6. Visitor Metadata & Identity
        if (visitorId) {
            const metaKey = `analytics:visitor:${visitorId}`;
            pipeline.hSet(metaKey, {
                ip: ip || 'unknown',
                country: country || 'unknown',
                userAgent: userAgent || 'unknown',
                lastSeen: new Date().toISOString()
            });
            // Update Recent Visitors List (Keep specific unique list if desired, but LIFO list is easier)
            // We'll use LREM to remove if exists then LPUSH to move to top, or just LPUSH and distinct on read.
            // LREM is expensive. Let's just LPUSH and cap. Read side will dedupe.
            pipeline.lPush('analytics:recent_visitors', visitorId);
            pipeline.lTrim('analytics:recent_visitors', 0, 199); // Keep last 200

            // expire meta after 90 days
            pipeline.expire(metaKey, 60 * 60 * 24 * 90);
        }

        // Set expiry for keys
        const EXPIRY = 60 * 60 * 24 * 90; // 90 days
        pipeline.expire(`analytics:views:${today}`, EXPIRY);
        pipeline.expire(`analytics:visitors:${today}`, EXPIRY);
        pipeline.expire(`analytics:pages:${today}`, EXPIRY);
        pipeline.expire(`analytics:countries:${today}`, EXPIRY);
        pipeline.expire(`analytics:referrers:${today}`, EXPIRY);

        await pipeline.exec();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
    }
}
