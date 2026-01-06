const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('REDIS_URL is not set');
    process.exit(1);
}

const redis = createClient({ url: redisUrl });

async function migrate() {
    await redis.connect();
    console.log('Connected to Redis...');

    // 1. Get all subscribers
    const subscribers = await redis.zRangeWithScores('subscribers', 0, -1);
    const subEmails = new Set(subscribers.map(s => s.value));
    console.log(`Found ${subEmails.size} subscribers.`);

    // 2. Scan analytics:identity:* to map emails to locations
    // This is inefficient but necessary since we don't have a reverse index
    // We will build a map of { email: { country, city } }

    const emailLocationMap = new Map();
    let cursor = '0';
    let scanned = 0;

    console.log('Scanning visitor identities...');

    do {
        // Safe check for cursor
        const result = await redis.scan(cursor, { MATCH: 'analytics:identity:*', COUNT: 1000 });

        // Update cursor for next iteration, ensure string for checking
        cursor = result.cursor.toString();

        const keys = result.keys;
        scanned += keys.length;

        if (keys.length > 0) {
            // Get emails for these visitors
            const emails = await redis.mGet(keys);

            // For any email that is in our subscriber list, we need the location
            // The location is in analytics:visitor:{visitorId}
            // Key is analytics:identity:{visitorId}

            const relevantKeys = [];

            keys.forEach((key, idx) => {
                const email = emails[idx];
                if (email && subEmails.has(email)) {
                    // This visitor is a subscriber
                    const visitorId = key.split(':')[2];
                    relevantKeys.push({ visitorId, email });
                }
            });

            if (relevantKeys.length > 0) {
                const pipeline = redis.multi();
                relevantKeys.forEach(k => pipeline.hGetAll(`analytics:visitor:${k.visitorId}`));
                const metas = await pipeline.exec();

                relevantKeys.forEach((k, idx) => {
                    const meta = metas[idx];
                    if (meta && (meta.country !== 'Unknown' || meta.city !== 'Unknown')) {
                        // We found a location!
                        // If we already have one for this email, we might overwrite, 
                        // but typically latest is best. Or first?
                        // Let's keep the first valid one we find, or overwrite if better?
                        if (!emailLocationMap.has(k.email)) {
                            emailLocationMap.set(k.email, { country: meta.country, city: meta.city });
                        }
                    }
                });
            }
        }

        if (scanned % 1000 === 0) console.log(`Scanned ${scanned} identities...`);

    } while (cursor !== '0');

    console.log(`Found locations for ${emailLocationMap.size} subscribers.`);

    // 3. Update subscriber:{email} hashes
    if (emailLocationMap.size > 0) {
        let updated = 0;
        for (const [email, loc] of emailLocationMap.entries()) {
            // Check if already has data to avoid overwriting good data?
            // User requested backfill, so let's assume missing.
            // We'll use HSET correctly.

            // Only update if we actually have data
            if (loc.country || loc.city) {
                await redis.hSet(`subscriber:${email}`, {
                    country: loc.country || 'Unknown',
                    city: loc.city || 'Unknown'
                });
                updated++;
                console.log(`Updated ${email}: ${loc.city}, ${loc.country}`);
            }
        }
        console.log(`Backfill complete. Updated ${updated} subscribers.`);
    } else {
        console.log('No matching visitor data found for subscribers.');
    }

    await redis.quit();
}

migrate().catch(console.error);
