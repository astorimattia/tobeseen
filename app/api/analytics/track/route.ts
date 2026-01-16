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
        const { path, country, city, referrer, visitorId, ip, userAgent } = body;

        // Basic validation
        if (!path) {
            return NextResponse.json({ error: 'Missing path' }, { status: 400 });
        }

        // 1. Ignore Admin Paths
        if (path.startsWith('/admin')) {
            return NextResponse.json({ success: true, ignored: true });
        }

        // 2. Ignore Localhost
        if (ip === '::1' || ip === '127.0.0.1') {
            return NextResponse.json({ success: true, ignored: true });
        }

        const redis = getRedisClient();
        if (!redis.isOpen) await redis.connect();

        // Decode location data to avoid %20
        const safeCountry = country ? decodeURIComponent(country) : null;
        const safeCity = city ? decodeURIComponent(city) : null;

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH

        // Check if visitor is identified
        let isIdentified = false;
        if (visitorId) {
            const identity = await redis.get(`analytics:identity:${visitorId}`);
            isIdentified = !!identity;
        }

        const pipeline = redis.multi();

        // 1. Total Page Views
        pipeline.incr(`analytics:views:${today}`);
        pipeline.incr(`analytics:views:${currentHour}`); // Add Hourly

        // 2. Unique Visitors (HyperLogLog)
        if (visitorId) {
            pipeline.pfAdd(`analytics:visitors:${today}`, visitorId);
            pipeline.pfAdd(`analytics:visitors:${currentHour}`, visitorId); // Add Hourly
        }

        // 3. Top Pages (Sorted Set)
        pipeline.zIncrBy(`analytics:pages:${today}`, 1, path);

        // 3b. Top Visitors (Sorted Set by View Count)
        if (visitorId) {
            pipeline.zIncrBy(`analytics:visitors:top:${today}`, 1, visitorId);

            // 3c. Pages per Visitor (Sorted Set) - Enables filtering "Top Pages" by Visitor
            pipeline.zIncrBy(`analytics:visitors:${visitorId}:pages:${today}`, 1, path);
        }

        // 4. Top Countries (Sorted Set)
        if (safeCountry) {
            pipeline.zIncrBy(`analytics:countries:${today}`, 1, safeCountry);

            // 4a. Top Cities per Country
            if (safeCity) {
                // Key: analytics:cities:{country}:{date}
                // We use daily aggregation for now
                pipeline.zIncrBy(`analytics:cities:${safeCountry}:${today}`, 1, safeCity);

                // 4b. Global Top Cities (for the "Top Cities" card when no country selected)
                pipeline.zIncrBy(`analytics:cities:all:${today}`, 1, safeCity);
            }

            // 4c. Top Pages per Country
            pipeline.zIncrBy(`analytics:pages:country:${safeCountry}:${today}`, 1, path);
        }

        // 5. Top Referrers (Sorted Set)
        if (referrer) {
            try {
                const domain = new URL(referrer).hostname;
                pipeline.zIncrBy(`analytics:referrers:${today}`, 1, domain);

                // 5b. Top Referrers per Country
                if (safeCountry) {
                    pipeline.zIncrBy(`analytics:referrers:country:${safeCountry}:${today}`, 1, domain);
                }
            } catch {
                // Invalid URL
            }
        }

        // 6. Visitor Metadata & Identity
        if (visitorId) {
            const metaKey = `analytics:visitor:${visitorId}`;
            pipeline.hSet(metaKey, {
                ip: ip || 'unknown',
                country: safeCountry || 'unknown',
                city: safeCity || 'unknown',
                referrer: referrer ? new URL(referrer).hostname : 'unknown',
                userAgent: userAgent || 'unknown',
                lastSeen: new Date().toISOString()
            });

            // Update Recent Identified Visitors List ONLY if identified
            if (isIdentified) {
                pipeline.lPush('analytics:recent_identified_visitors', visitorId);
            }

            // We still track "recent_visitors" (raw) if we want? The user said "only show identified...".
            // But "still count the unknown in all other places".
            // Update: User requested to hide "blank" entries (no email, no public IP, no location).
            const hasValidIp = ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'unknown';
            const hasLocation = safeCountry && safeCountry !== 'unknown';

            if (isIdentified || hasValidIp || hasLocation) {
                // Allow duplicates (visit log style) - store latest at top
                pipeline.lPush('analytics:recent_visitors', visitorId);

                // Add to country specific list if we have a valid country
                if (safeCountry && safeCountry !== 'unknown') {
                    const countryKey = `analytics:recent_visitors:country:${safeCountry}`;
                    pipeline.lPush(countryKey, visitorId);
                }
            }
        }

        // Set expiry for keys
        const HOURLY_EXPIRY = 60 * 60 * 48; // 48 hours for graph granularity

        // We only expire hourly keys. Daily keys are kept forever (or until eviction).
        pipeline.expire(`analytics:views:${currentHour}`, HOURLY_EXPIRY);
        pipeline.expire(`analytics:visitors:${currentHour}`, HOURLY_EXPIRY);

        // Expire city keys? They can grow. Let's keep them daily for now.
        // We probably don't need to explicitly expire daily keys if we want history.

        // Daily keys (views:today, etc) have NO expiration now.

        await pipeline.exec();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
    }
}
