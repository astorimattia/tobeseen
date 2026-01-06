const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function countAllVisitors() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        console.log('Scanning for visitor keys...');
        // Node Redis v4: cursor is iterator, scan returns object.
        // We initially pass 0.
        let cursor = 0;
        let totalKeys = 0;
        const validVisitors = [];

        do {
            // Using a loop structure that updates cursor
            const reply = await redis.scan(cursor, { MATCH: 'analytics:visitor:*', COUNT: 1000 });
            cursor = reply.cursor; // This is a number
            const keys = reply.keys;
            totalKeys += keys.length;

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
        } while (cursor !== 0);

        console.log(`Total visitor keys found: ${totalKeys}`);
        console.log(`Valid (non-blank) visitors found: ${validVisitors.length}`);

        validVisitors.sort((a, b) => b.lastSeen - a.lastSeen);

        const currentListLen = await redis.lLen('analytics:recent_visitors');
        console.log(`Current 'Recent Visitors' list length: ${currentListLen}`);

        if (validVisitors.length > currentListLen) {
            console.log(`Potential to backfill ${validVisitors.length} visitors.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

countAllVisitors();
