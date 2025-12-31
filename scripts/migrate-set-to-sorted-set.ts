import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUBSCRIBERS_KEY = 'subscribers';
const TEMP_SET_KEY = 'subscribers_temp_set';

async function migrateToSortedSet() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('❌ REDIS_URL not set');
    process.exit(1);
  }

  const redis = createClient({ url: redisUrl });

  try {
    console.log('🔄 Connecting to Redis...');
    await redis.connect();
    
    // Check if key exists and what type it is
    const type = await redis.type(SUBSCRIBERS_KEY);
    console.log(`ℹ️  Current key type: ${type}`);

    if (type === 'zset') {
      console.log('✅ Key is already a Sorted Set. Migration not needed.');
      return;
    }

    if (type === 'none') {
      console.log('⚠️  Key does not exist. Nothing to migrate.');
      return;
    }

    if (type !== 'set') {
      console.error(`❌ Unexpected key type: ${type}. Expected "set" or "zset".`);
      process.exit(1);
    }

    console.log('📦 Starting migration from Set to Sorted Set...');

    // 1. Rename existing set to temp key
    await redis.rename(SUBSCRIBERS_KEY, TEMP_SET_KEY);
    console.log(`   Renamed ${SUBSCRIBERS_KEY} to ${TEMP_SET_KEY}`);

    // 2. Get all members
    const members = await redis.sMembers(TEMP_SET_KEY);
    console.log(`   Found ${members.length} subscribers to migrate`);

    // 3. Add to new Sorted Set with current timestamp
    // We'll use the same timestamp for existing users since we don't know the real one
    const timestamp = Date.now();
    let added = 0;

    for (const email of members) {
      await redis.zAdd(SUBSCRIBERS_KEY, { score: timestamp, value: email });
      added++;
    }

    console.log(`   Added ${added} subscribers to new Sorted Set`);

    // 4. Verify and clean up
    const newCount = await redis.zCard(SUBSCRIBERS_KEY);
    if (newCount === members.length) {
      await redis.del(TEMP_SET_KEY);
      console.log(`   Deleted temp key ${TEMP_SET_KEY}`);
      console.log('✅ Migration successful!');
    } else {
      console.error('❌ Mismatch in counts. Temp key NOT deleted. Please investigate.');
      console.error(`   Original: ${members.length}, New: ${newCount}`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    if (redis.isOpen) await redis.quit();
  }
}

migrateToSortedSet();
