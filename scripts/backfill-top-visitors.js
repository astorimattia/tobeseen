
const { createClient } = require('redis');
require('dotenv').config({ path: '.env.local' });

async function backfill() {
    const client = createClient({
        url: process.env.REDIS_URL
    });

    await client.connect();
    console.log('Connected to Redis');

    const visitorKeys = await client.keys('analytics:visitors:202*');
    console.log(`Found ${visitorKeys.length} potential visitor keys`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const key of visitorKeys) {
        const type = await client.type(key);
        console.log(`Processing ${key} (Type: ${type})`);

        if (type !== 'set') {
            console.log(`Skipping ${key} - Not a set`);
            continue;
        }

        // key format: analytics:visitors:YYYY-MM-DD
        const parts = key.split(':');
        if (parts.length !== 3) {
            console.log(`Skipping ${key} - Unexpected format`);
            continue;
        }
        const date = parts[2];
        const topKey = `analytics:visitors:top:${date}`;

        // Check if top key already exists (don't overwrite today's real data)
        const exists = await client.exists(topKey);
        // Only skip if it's strictly today? 
        // Or if it has substantial data?
        // Let's assume if it exists, it's better than backfill, UNLESS it's empty?
        // If backfill is 1, and real data is > 1 range, we prefer real data.

        // Actually, if it exists, we might want to MERGE?
        // But for safety, let's just skip existing ones for now.
        if (exists) {
            console.log(`Skipping ${date} - Top Visitors key already exists`);
            skippedCount++;
            continue;
        }

        const visitors = await client.sMembers(key);
        if (visitors.length === 0) continue;

        console.log(`Backfilling ${date} with ${visitors.length} visitors`);

        const pipeline = client.multi();
        visitors.forEach(visitorId => {
            pipeline.zAdd(topKey, { score: 1, value: visitorId });
        });

        await pipeline.exec();
        updatedCount++;
    }

    console.log(`Backfill complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    await client.disconnect();
}

backfill().catch(console.error);
