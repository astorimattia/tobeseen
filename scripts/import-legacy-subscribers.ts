import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUBSCRIBERS_KEY = 'subscribers';
const CSV_FILE = path.join(process.cwd(), 'legacy_subscribers.csv');

async function importLegacySubscribers() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.error('❌ REDIS_URL not set');
        process.exit(1);
    }

    const redis = createClient({ url: redisUrl });

    try {
        console.log('🔄 Connecting to Redis...');
        await redis.connect();

        if (!fs.existsSync(CSV_FILE)) {
            console.error(`❌ CSV file not found: ${CSV_FILE}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`📄 Found ${records.length} records in CSV`);

        let added = 0;
        let skipped = 0;

        for (const record of records) {
            // CSV keys might be case sensitive or have whitespace depending on how it's pasted
            // Let's try to be flexible
            const r = record as Record<string, unknown>;
            const emailObj = Object.entries(r).find(([k]) => k.toLowerCase().includes('email'));
            const timeObj = Object.entries(r).find(([k]) => k.toLowerCase().includes('time') || k.toLowerCase().includes('date'));

            if (!emailObj || !timeObj) {
                console.warn('⚠️  Could not find Email or Timestamp column in record:', record);
                skipped++;
                continue;
            }

            const email = emailObj[1] as string;
            const timeStr = timeObj[1] as string;

            if (!email || !email.includes('@')) {
                console.warn(`⚠️  Invalid email: ${email}`);
                skipped++;
                continue;
            }

            // Parse timestamp
            // Format in image: 2025-12-26 10:09:12.556806+00
            const timestamp = new Date(timeStr).getTime();

            if (isNaN(timestamp)) {
                console.warn(`⚠️  Invalid timestamp for ${email}: ${timeStr}`);
                skipped++;
                continue;
            }

            // Check if exists
            const score = await redis.zScore(SUBSCRIBERS_KEY, email);
            if (score !== null) {
                console.log(`⏭️  Skipping existing: ${email}`);
                skipped++;
                continue;
            }

            // Add to Redis
            await redis.zAdd(SUBSCRIBERS_KEY, { score: timestamp, value: email });
            console.log(`✅ Added: ${email} (${new Date(timestamp).toLocaleString()})`);
            added++;
        }

        console.log('\n📈 Import Summary:');
        console.log(`   - Added: ${added}`);
        console.log(`   - Skipped: ${skipped}`);

    } catch (error) {
        console.error('❌ Import error:', error);
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}

importLegacySubscribers();
