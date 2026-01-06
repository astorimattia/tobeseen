const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function backfillCities() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        console.log('Scanning for visitor keys to backfill cities...');
        let cursor = 0;
        let count = 0;

        do {
            const reply = await redis.scan(cursor.toString(), { MATCH: 'analytics:visitor:*', COUNT: 1000 });
            cursor = reply.cursor;
            const keys = reply.keys;

            for (const key of keys) {
                const meta = await redis.hGetAll(key);

                // We need country, city, and a date
                const country = meta.country;
                const city = meta.city;
                const lastSeen = meta.lastSeen;

                if (country && country !== 'unknown' && city && city !== 'unknown' && lastSeen) {
                    // Parse date YYYY-MM-DD
                    const date = new Date(lastSeen).toISOString().slice(0, 10);

                    // Increment city count for that country/date
                    // Key: analytics:cities:{country}:{date}
                    const cityKey = `analytics:cities:${country}:${date}`;

                    // Use decodeURIComponent if needed? 
                    // The track API does decodeURIComponent(city).
                    // In visitor meta, it might be stored encoded or decoded depending on when it was saved.
                    // The `track` API stores it as `safeCity` (decoded).
                    // So we assume meta.city is already decoded if it came from the new track API.
                    // If it came from OLD track API (before my changes), it might be encoded.
                    // Safe to apply decodeURIComponent just in case, it handles already decoded strings fine usually (unless they have % signs).
                    // Actually, if it's already "New York", decodeURI("New%20York") -> "New York".

                    const safeCity = decodeURIComponent(city);

                    // Pipeline or just await? Await is safer for script not to overload if huge.
                    await redis.zIncrBy(cityKey, 1, safeCity);

                    // 4b. Global Top Cities
                    const globalCityKey = `analytics:cities:all:${date}`;
                    await redis.zIncrBy(globalCityKey, 1, safeCity);

                    count++;
                }
            }
        } while (Number(cursor) !== 0);

        console.log(`Backfilled city data for ${count} visitor records.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

backfillCities();
