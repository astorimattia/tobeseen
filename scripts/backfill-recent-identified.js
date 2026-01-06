const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function backfillIdentified() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        console.log('Scanning for identities...');
        const keys = await redis.keys('analytics:identity:*');
        console.log(`Found ${keys.length} identities.`);

        const visitors = [];

        for (const key of keys) {
            const visitorId = key.split(':').pop();
            const meta = await redis.hGetAll(`analytics:visitor:${visitorId}`);
            if (meta && meta.lastSeen) {
                visitors.push({
                    id: visitorId,
                    lastSeen: new Date(meta.lastSeen).getTime() // To Sort
                });
            } else {
                // If no lastSeen, use 0 or skip? Use 0 to keep at end
                visitors.push({ id: visitorId, lastSeen: 0 });
            }
        }

        // Sort Descending (Newest First)
        visitors.sort((a, b) => b.lastSeen - a.lastSeen);

        const top200 = visitors.slice(0, 200);
        console.log(`Prepared ${top200.length} visitors to push.`);

        // Clear existing list to avoid duplicates/mess
        await redis.del('analytics:recent_identified_visitors');

        // Push to list
        // Note: RPUSH appends to end. We want List[0] to be Newest.
        // So if we RPUSH [Newest, 2nd, ...], List[0] is Newest.
        if (top200.length > 0) {
            const ids = top200.map(v => v.id);
            await redis.rPush('analytics:recent_identified_visitors', ids);
            console.log('Successfully backfilled analytics:recent_identified_visitors');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

backfillIdentified();
