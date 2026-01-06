const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function backfillAllVisitors() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        console.log('Scanning for visitor keys...');
        let cursor = 0;
        const validVisitors = [];

        do {
            // Explicitly convert cursor to string for node-redis v4
            const reply = await redis.scan(cursor.toString(), { MATCH: 'analytics:visitor:*', COUNT: 1000 });
            cursor = reply.cursor; // Returns number or string depending on version, keep as is for next toString()
            const keys = reply.keys;

            for (const key of keys) {
                const visitorId = key.split(':').pop();
                const meta = await redis.hGetAll(key);

                const email = await redis.get(`analytics:identity:${visitorId}`);
                const hasEmail = !!email;
                const ip = meta.ip;
                const hasValidIp = ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'unknown';
                const hasLocation = meta.country && meta.country !== 'unknown';

                if (hasEmail || hasValidIp || hasLocation) {
                    validVisitors.push({
                        id: visitorId,
                        lastSeen: meta.lastSeen ? new Date(meta.lastSeen).getTime() : 0
                    });
                }
            }
        } while (Number(cursor) !== 0);

        console.log(`Found ${validVisitors.length} valid visitors.`);

        // Sort descending
        validVisitors.sort((a, b) => b.lastSeen - a.lastSeen);

        const listKey = 'analytics:recent_visitors';

        // Cap at 500
        const toPush = validVisitors.slice(0, 500).map(v => v.id);

        if (toPush.length > 0) {
            await redis.del(listKey);
            await redis.rPush(listKey, toPush);
            console.log(`Successfully backfilled ${toPush.length} visitors.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

backfillAllVisitors();
