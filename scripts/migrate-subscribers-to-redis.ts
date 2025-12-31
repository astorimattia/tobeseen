import { createClient } from 'redis';
import fs from 'fs/promises';
import path from 'path';

const SUBSCRIBERS_KEY = 'subscribers';
const SUBSCRIBERS_FILE = path.join(process.cwd(), 'subscribers.txt');

async function migrateSubscribers() {
  const redis = createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
  });

  try {
    console.log('🔄 Starting migration from subscribers.txt to Redis...');

    // Read existing subscribers from file
    let existingEmails: string[] = [];
    try {
      const fileContent = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
      existingEmails = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '' && line.includes('@'));
      
      console.log(`📄 Found ${existingEmails.length} subscribers in file`);
    } catch (error) {
      console.log('⚠️  No subscribers.txt file found or error reading it:', error);
      console.log('✅ Migration complete (no existing subscribers to migrate)');
      return;
    }

    if (existingEmails.length === 0) {
      console.log('✅ No subscribers to migrate');
      return;
    }

    // Connect to Redis
    try {
      await redis.connect();
      console.log('✅ Redis connection successful');
    } catch (error) {
      console.error('❌ Redis connection failed. Make sure you have:');
      console.error('   1. Set REDIS_URL environment variable');
      console.error('   2. Redis server is accessible');
      throw error;
    }

    // Get existing subscribers from Redis
    const existingRedisSubscribers = await redis.sMembers(SUBSCRIBERS_KEY);
    const existingSet = new Set(existingRedisSubscribers);
    console.log(`📊 Found ${existingSet.size} existing subscribers in Redis`);

    // Add new subscribers (skip duplicates)
    let added = 0;
    let skipped = 0;

    for (const email of existingEmails) {
      if (existingSet.has(email)) {
        console.log(`⏭️  Skipping duplicate: ${email}`);
        skipped++;
      } else {
        await redis.sAdd(SUBSCRIBERS_KEY, email);
        console.log(`✅ Added: ${email}`);
        added++;
      }
    }

    // Verify migration
    const finalCount = await redis.sCard(SUBSCRIBERS_KEY);
    console.log('\n📈 Migration Summary:');
    console.log(`   - Emails in file: ${existingEmails.length}`);
    console.log(`   - Added to Redis: ${added}`);
    console.log(`   - Skipped (duplicates): ${skipped}`);
    console.log(`   - Total subscribers in Redis: ${finalCount}`);
    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close Redis connection
    if (redis.isOpen) {
      await redis.quit();
    }
  }
}

// Run migration
migrateSubscribers();

