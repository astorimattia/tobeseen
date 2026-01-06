const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function inspect() {
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    try {
        const ids = await redis.lRange('analytics:recent_visitors', 0, 9);
        for (const id of ids) {
            const meta = await redis.hGetAll(`analytics:visitor:${id}`);
            const email = await redis.get(`analytics:identity:${id}`);
            console.log(`ID: ${id}`, { meta, email });
        }
    } finally {
        await redis.quit();
    }
}
inspect();
