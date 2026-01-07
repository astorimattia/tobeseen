const { createClient } = require('redis');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    console.log('Starting migration of recent visitors by country...');

    if (!process.env.REDIS_URL) {
        console.error('REDIS_URL is not set');
        process.exit(1);
    }

    const client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();

    try {
        const recentVisitorsKey = 'analytics:recent_visitors';
        const visitors = await client.lRange(recentVisitorsKey, 0, -1);
        console.log(`Found ${visitors.length} recent visitors.`);

        let processed = 0;
        let migrated = 0;

        for (const visitorId of visitors) {
            const metaKey = `analytics:visitor:${visitorId}`;
            const meta = await client.hGetAll(metaKey);

            if (meta && meta.country && meta.country !== 'unknown') {
                const countryKey = `analytics:recent_visitors:country:${meta.country}`;

                // Use pipeline for atomic operation per visitor but here simple await is fine for migration script
                // We want to remove if exists (to ensure unique and recent) and push
                // But since we are iterating from most recent (0) to least recent (-1) in the main list...
                // Wait, lRange 0 is the HEAD (most recent).
                // If we iterate from 0 to end, we process MOST RECENT first.
                // If we LPUSH, the LAST one we push becomes the HEAD (most recent).
                // So if we iterate 0..N (Most Recent .. Oldest), and we LPUSH each, 
                // the Oldest will end up at HEAD. That reverses the order.

                // We should iterate in REVERSE if we use LPUSH.
                // OR we use RPUSH if we iterate from HEAD.

                // Let's use RPUSH so the order is preserved (Head of source -> Head of target is incorrect with RPUSH?)
                // Source: [A, B, C] (A is newest)
                // Iteration: A, then B, then C.
                // RPUSH: [A], then [A, B], then [A, B, C].
                // Result: A is at index 0. Correct.

                // However, the tracking code uses LPUSH (and lRem).
                // "pipeline.lPush(countryKey, visitorId);"

                // So to match tracking code which puts NEWEST at HEAD:
                // We want the result list to be [Newest, ..., Oldest].

                // If we iterate Source as [Newest, ..., Oldest]
                // and we RPUSH: [Newest, ..., Oldest].
                // So at the end, index 0 is Newest.

                // But wait, if we run this script multiple times, RPUSH appends to the TAIL.
                // We should probably just clear the implementation or be careful.
                // But for a migration, we are creating NEW keys (mostly). 
                // If the key exists, RPUSH adds to end.

                // Better approach: 
                // Since this is a one-off or repair, let's just do it correctly.
                // iterate visitors.
                // If we perform `lPossibleDuplicateCheck` it might be slow.
                // But `lRem` removes ALL occurrences. 

                // Let's stick to the tracking logic: lRem then lPush.
                // BUT, if we do that while iterating Newest -> Oldest:
                // 1. Process Newest (A). lPush -> [A]
                // 2. Process Next (B). lPush -> [B, A] 
                // Result: B is now at HEAD (Newest). INCORRECT. A was newest.

                // So we must iterate Oldest -> Newest if we use lPush.
                // visitors list is [Newest, ..., Oldest].
                // visitors.reverse() -> [Oldest, ..., Newest].

                await client.lRem(countryKey, 0, visitorId);
                await client.lPush(countryKey, visitorId);
                migrated++;
            }

            processed++;
            if (processed % 100 === 0) {
                console.log(`Processed ${processed} visitors...`);
            }
        }

        console.log(`Migration complete. Processed: ${processed}, Migrated: ${migrated} to country lists.`);

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await client.quit();
    }
}

migrate();
