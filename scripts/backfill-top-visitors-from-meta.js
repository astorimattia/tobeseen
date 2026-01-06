
const { createClient } = require('redis');
require('dotenv').config({ path: '.env.local' });

async function backfill() {
    const client = createClient({
        url: process.env.REDIS_URL
    });

    await client.connect();
    console.log('Connected to Redis');

    // Scan for all visitor metadata keys
    // Key format: analytics:visitor:{visitorId}
    const keys = await client.keys('analytics:visitor:*');
    console.log(`Found ${keys.length} visitor metadata keys`);

    let updatedCount = 0;

    // Group visitors by date to batch updates
    const updatesByDate = {}; // { 'YYYY-MM-DD': [visitorId1, visitorId2] }

    for (const key of keys) {
        // Extract visitor ID
        // analytics:visitor:ID...
        // Be careful if ID contains colons.
        // The prefix is 'analytics:visitor:', length 18.
        const visitorId = key.substring('analytics:visitor:'.length);

        // Fetch lastSeen
        const lastSeen = await client.hGet(key, 'lastSeen');
        if (!lastSeen) continue;

        try {
            const date = lastSeen.substring(0, 10); // YYYY-MM-DD
            if (!updatesByDate[date]) {
                updatesByDate[date] = [];
            }
            updatesByDate[date].push(visitorId);
        } catch (e) {
            console.error(`Invalid date for ${visitorId}: ${lastSeen}`);
        }
    }

    // Apply updates
    for (const [date, visitorIds] of Object.entries(updatesByDate)) {
        const topKey = `analytics:visitors:top:${date}`;

        // We will increment by 1. If key exists, it adds to score.
        // If backfilling historical data where key doesn't exist, it creates it with score 1.

        const pipeline = client.multi();
        visitorIds.forEach(id => {
            pipeline.zIncrBy(topKey, 1, id);
        });

        await pipeline.exec();
        console.log(`Updated ${date}: Added ${visitorIds.length} visitors`);
        updatedCount += visitorIds.length;
    }

    console.log(`Backfill complete. Processed ${updatedCount} visitor records.`);
    await client.disconnect();
}

backfill().catch(console.error);
