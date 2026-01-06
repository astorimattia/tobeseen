import { createClient } from 'redis';
import 'dotenv/config';

// Hardcoded token from user
const CLARITY_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiI0MjQxOTM0ZS0xMWRlLTQ5ODItYTNhNC00MDJlODBlYzVjZGMiLCJzdWIiOiIyOTY0NzU0MjU2NTA4NTQwIiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc2NzIxNDAxMiwiZXhwIjo0OTIwODE0MDEyLCJpYXQiOjE3NjcyMTQwMTIsImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ.HXQA3qMjy6LCtsDSp_GW5Qe_ZKSK3OzVMYTsvIqkNne9M6422MFiB3mnSLS8jScwNiN5pvZF0TceYdKQSsG9CGyrUEZzUr3Sb1I4bB-AZCLPDD_6kYv2ckasMudmmFj_DqynOuh7P_pmjq9BLQFHBCPjcft6SdOVf2JwBJH9oje1BuHW0YOPF3JOlrYV7qlpls3hUnspE2-nV7Ms2QWcRaaWjc02KqUSFNFvzUTDCxUmu3qHnX-ZSSKY2F7STSsu37I7OdJeimP9YymXWJlONvobrNknN5DrezC7QwtpWU-YGgIK9rIBe895uWJQInTkKlJhH7W7EfB3a6zg8YwVAQ";
const REDIS_URL = process.env.REDIS_URL;
const ENDPOINT = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchClarity(date: string, dimension?: string) {
    const params = new URLSearchParams();
    params.set('startTime', `${date}T00:00:00Z`);
    params.set('endTime', `${date}T23:59:59Z`);
    params.set('metric', 'SessionCount');
    if (dimension) params.set('dimension1', dimension);

    try {
        const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${CLARITY_TOKEN}` }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function run() {
    if (!REDIS_URL) throw new Error('REDIS_URL required');
    const redis = createClient({ url: REDIS_URL });
    await redis.connect();

    // Iterate last 90 days
    const today = new Date();

    for (let i = 1; i <= 90; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayKey = d.toISOString().slice(0, 10);

        console.log(`Processing ${dayKey}...`);

        // 1. Overview (Views/Visitors)
        const overview = await fetchClarity(dayKey);

        if (overview && overview[0]?.information?.[0]) {
            const info = overview[0].information[0];
            const sessions = parseInt(info.sessionsCount || '0');
            const pages = parseInt(info.pagesViews || '0');

            // Heuristic: Views = Sessions + Pages (Turns)
            const totalViews = sessions + pages;

            await redis.set(`analytics:views:${dayKey}`, totalViews.toString());

            // Visitors (HLL)
            await redis.del(`analytics:visitors:${dayKey}`);
            if (sessions > 0) {
                const pipeline = redis.multi();
                const batchSize = 100;
                for (let j = 0; j < sessions; j += batchSize) {
                    const chunk = [];
                    for (let k = 0; k < batchSize && (j + k) < sessions; k++) {
                        chunk.push(`legacy_user_${dayKey}_${j + k}`);
                    }
                    pipeline.pfAdd(`analytics:visitors:${dayKey}`, chunk);
                }
                await pipeline.exec();
            }
        }

        await sleep(200);

        // 2. Top Pages
        const pagesData = await fetchClarity(dayKey, 'Url');
        if (pagesData && pagesData[0]?.information) {
            await redis.del(`analytics:pages:${dayKey}`);
            const pipeline = redis.multi();
            for (const item of pagesData[0].information) {
                const url = item.Url;
                // Clean URL (remove query params for nicer display if needed, but keeping exact match is safer for now)
                const count = parseInt(item.sessionsCount || '0');
                if (url && count > 0) {
                    pipeline.zIncrBy(`analytics:pages:${dayKey}`, count, url);
                }
            }
            await pipeline.exec();
        }

        await sleep(200);

        // 3. Top Countries
        const countryData = await fetchClarity(dayKey, 'Country');
        if (countryData && countryData[0]?.information) {
            await redis.del(`analytics:countries:${dayKey}`);
            const pipeline = redis.multi();
            for (const item of countryData[0].information) {
                const country = item.Country;
                const count = parseInt(item.sessionsCount || '0');
                if (country && count > 0) {
                    pipeline.zIncrBy(`analytics:countries:${dayKey}`, count, country);
                }
            }
            await pipeline.exec();
        }

        await sleep(200);

        // 4. Sources
        const sourceData = await fetchClarity(dayKey, 'Source');
        if (sourceData && sourceData[0]?.information) {
            await redis.del(`analytics:referrers:${dayKey}`);
            const pipeline = redis.multi();
            for (const item of sourceData[0].information) {
                const source = item.Source;
                const count = parseInt(item.sessionsCount || '0');
                if (source && count > 0) {
                    pipeline.zIncrBy(`analytics:referrers:${dayKey}`, count, source);
                }
            }
            await pipeline.exec();
        }
    }

    await redis.quit();
    console.log('✅ Import Finished');
}

run().catch(console.error);
