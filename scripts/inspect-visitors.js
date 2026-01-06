
const { createClient } = require('redis');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
    const client = createClient({
        url: process.env.REDIS_URL
    });

    await client.connect();

    console.log('Connected to Redis');

    // Get all visitor keys (sets)
    const visitorKeys = await client.keys('analytics:visitors:202*');
    console.log(`Found ${visitorKeys.length} visitor (set) keys`);

    // Get all top visitor keys (sorted sets)
    const topVisitorKeys = await client.keys('analytics:visitors:top:202*');
    console.log(`Found ${topVisitorKeys.length} top visitor (zset) keys`);

    // Sample comparison
    const sampleDates = ['2025-12-31', '2026-01-01', '2026-01-05', '2026-01-06'];

    for (const date of sampleDates) {
        const setKey = `analytics:visitors:${date}`;
        const zsetKey = `analytics:visitors:top:${date}`;

        const setExists = await client.exists(setKey);
        const zsetExists = await client.exists(zsetKey);

        if (setExists) {
            const count = await client.sCard(setKey);
            console.log(`Date ${date}: Visitors Set Size = ${count}`);
        } else {
            console.log(`Date ${date}: Visitors Set NOT FOUND`);
        }

        if (zsetExists) {
            const count = await client.zCard(zsetKey);
            console.log(`Date ${date}: Top Visitors ZSet Size = ${count}`);
        } else {
            console.log(`Date ${date}: Top Visitors ZSet NOT FOUND`);
        }
    }

    await client.disconnect();
}

inspect().catch(console.error);
