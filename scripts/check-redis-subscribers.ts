import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local if it exists
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUBSCRIBERS_KEY = 'subscribers';

async function checkRedisSubscribers() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error('❌ REDIS_URL environment variable is not set');
    console.error('   Please set REDIS_URL in your .env.local file or environment variables');
    process.exit(1);
  }

  const redis = createClient({ url: redisUrl });

  try {
    console.log('🔄 Connecting to Redis...');
    await redis.connect();
    console.log('✅ Connected to Redis successfully\n');

    // Get all subscribers with scores (timestamps)
    const subscribers = await redis.zRangeWithScores(SUBSCRIBERS_KEY, 0, -1);
    const count = await redis.zCard(SUBSCRIBERS_KEY);

    console.log('📊 Redis Database Status:');
    console.log(`   Key: ${SUBSCRIBERS_KEY}`);
    console.log(`   Total subscribers: ${count}\n`);

    if (subscribers.length === 0) {
      console.log('   No subscribers found in the database.');
    } else {
      console.log('📧 Subscribers:');
      subscribers.forEach((item, index) => {
        const date = new Date(item.score).toLocaleString();
        console.log(`   ${index + 1}. ${item.value} (Synthesized: ${date})`);
      });
    }

    // Additional Redis info
    console.log('\n🔍 Additional Redis Info:');
    const info = await redis.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    if (versionMatch) {
      console.log(`   Redis version: ${versionMatch[1]}`);
    }

  } catch (error) {
    console.error('❌ Error accessing Redis:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    process.exit(1);
  } finally {
    if (redis.isOpen) {
      await redis.quit();
      console.log('\n✅ Connection closed');
    }
  }
}

// Run the check
checkRedisSubscribers();

