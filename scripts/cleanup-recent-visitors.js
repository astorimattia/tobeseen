const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function cleanupVisitors() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        const listKey = 'analytics:recent_visitors';
        const length = await redis.lLen(listKey);
        console.log(`Current list length: ${length}`);

        const allIds = await redis.lRange(listKey, 0, -1);
        const uniqueIds = new Set();
        const validIds = [];

        // Determine which IDs to KEEP
        for (const id of allIds) {
            // Deduplication: Only keep first occurrence (most recent)
            if (uniqueIds.has(id)) {
                // Skip (will be dropped when we rewrite list)
                continue;
            }

            // Check metadata
            const [meta, email] = await Promise.all([
                redis.hGetAll(`analytics:visitor:${id}`),
                redis.get(`analytics:identity:${id}`)
            ]);

            // Filter logic
            const hasEmail = !!email;
            // Note: Check for '::1' and 'unknown' explicitly
            const ip = meta.ip;
            const hasValidIp = ip && ip !== '::1' && ip !== '127.0.0.1' && ip !== 'unknown';
            const hasLocation = meta.country && meta.country !== 'unknown';

            if (hasEmail || hasValidIp || hasLocation) {
                uniqueIds.add(id);
                validIds.push(id);
            } else {
                console.log(`Dropping blank visitor: ${id} IP:${ip}`);
            }
        }

        console.log(`Found ${validIds.length} valid unique visitors out of ${length} entries.`);

        // Rewrite the list
        // DEL then RPUSH (since validIds are ordered newest-first from lRange 0..-1)
        if (validIds.length > 0) {
            await redis.del(listKey);
            await redis.rPush(listKey, validIds);
            console.log('List cleaned and rewritten.');
        } else {
            console.log('No valid visitors found. Clearing list.');
            await redis.del(listKey);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

cleanupVisitors();
