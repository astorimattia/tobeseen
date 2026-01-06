const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function inspectHourly() {
    console.log('Connecting to Redis...');
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        const today = new Date().toISOString().slice(0, 10);
        console.log(`Checking keys for date: ${today}`);

        const keys = await redis.keys(`analytics:views:${today}T*`);
        console.log(`Found ${keys.length} hourly keys.`);

        if (keys.length > 0) {
            keys.sort();
            for (const key of keys) {
                const val = await redis.get(key);
                console.log(`${key}: ${val}`);
            }
        }

        // Also check daily total
        const dailyKey = `analytics:views:${today}`;
        const dailyTotal = await redis.get(dailyKey);
        console.log(`Daily Total (${dailyKey}): ${dailyTotal}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await redis.quit();
    }
}

inspectHourly();
