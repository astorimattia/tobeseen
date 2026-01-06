const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function debugRedis() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        const today = new Date().toISOString().slice(0, 10);
        console.log(`Checking keys for today: ${today}`);

        console.log('\n--- 1. Recent Identified Visitors ---');
        const recentVisitors = await redis.lRange('analytics:recent_identified_visitors', 0, -1);
        console.log('Count:', await redis.lLen('analytics:recent_identified_visitors'));
        console.log('Sample:', recentVisitors.slice(0, 5));

        console.log('\n--- 2. Hourly Views (Traffic) ---');
        const keys = await redis.keys(`analytics:views:${today}T*`);
        console.log(`Found ${keys.length} hourly view keys.`);
        if (keys.length > 0) {
            for (const k of keys.slice(0, 5)) {
                const val = await redis.get(k);
                console.log(`${k}: ${val}`);
            }
        } else {
            // Check daily key
            const daily = await redis.get(`analytics:views:${today}`);
            console.log(`Daily key analytics:views:${today}: ${daily}`);
        }

        console.log('\n--- 3. Top Countries ---');
        const countryKey = `analytics:countries:${today}`;
        const countries = await redis.zRangeWithScores(countryKey, 0, -1);
        console.log('Top Countries:', countries);

        console.log('\n--- 4. City Keys (Drill-down) ---');
        // Scan for any city keys
        const cityKeys = await redis.keys('analytics:cities:*');
        console.log(`Found ${cityKeys.length} city keys total.`);
        if (cityKeys.length > 0) {
            console.log('Sample city keys:', cityKeys.slice(0, 5));
            // Check one
            const sampleKey = cityKeys[0];
            const cities = await redis.zRangeWithScores(sampleKey, 0, -1);
            console.log(`Cities in ${sampleKey}:`, cities);
        }

        console.log('\n--- 5. Key Format Verification ---');
        if (countries.length > 0) {
            const countryCode = countries[0].value;
            const expectedCityKey = `analytics:cities:${countryCode}:${today}`;
            console.log(`Expected city key for top country (${countryCode}): ${expectedCityKey}`);
            const exists = await redis.exists(expectedCityKey);
            console.log(`Does it exist? ${exists ? 'YES' : 'NO'}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

debugRedis();
