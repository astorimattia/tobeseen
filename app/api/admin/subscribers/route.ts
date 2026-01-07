import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// Initialize Redis client securely (avoids creating multiple connections in dev)
const getRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL is not set');
    }
    return createClient({ url: redisUrl });
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || key !== adminPassword) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = getRedisClient();

    try {
        if (!redis.isOpen) await redis.connect();

        // Fetch all subscribers with scores (timestamps)
        // ZRANGE key min max WITHSCORES (0 -1 means all)
        // We want them latest first, so we use ZREVRANGE
        // Note: node-redis functions for zRevRangeWithScores might differ slightly by version, 
        // usually zRangeWithScores with REV option is preferred in newer ones, but let's stick to standard zRange and reverse in JS or use zRange with options if needed.
        // Actually, let's just use zRangeWithScores and reverse the array in JS for simplicity and compatibility.

        // Pagination parameters
        // const { searchParams } = new URL(req.url); // Removed duplicate
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        // Date Filtering
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        console.log(`[Subscribers API] Params: from=${from}, to=${to}, key=${key}`);

        let minScore = 0;
        let maxScore = Date.now(); // Default to now

        // Logic matches analytics/route.ts parse logic roughly
        if (from && from !== 'all') {
            minScore = new Date(from).getTime();
        }
        if (to) {
            // 'to' is usually YYYY-MM-DD. We want end of that day? 
            // Or just treat as raw date. 
            // In analytics we did simple slicing. usage: `start.setDate(...)`.
            // Let's assume passed dates are roughly midnight UTC or similar.
            // If to is "today", we technically want up to now.
            // Let's rely on standard JS Date parsing.
            // If inputs are YYYY-MM-DD:
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            maxScore = toDate.getTime();
        }

        // Search & Sort variables
        const search = searchParams.get('search')?.toLowerCase();
        const sortKey = searchParams.get('sortKey') || 'date';
        const sortDir = searchParams.get('sortDir') || 'desc';

        // Define types to avoid 'any'
        type SubscriberDTO = {
            email: string;
            timestamp: number;
            date: string;
            country: string;
            city: string;
            [key: string]: string | number; // Allow dynamic access for sort
        };

        let formatted: SubscriberDTO[] = [];
        let total = 0;
        let totalPages = 0;
        // subscribers from redis are raw ZRANGE results {value, score} or detailed objects? 
        // Logic uses diverse sources.
        // Rank-based returns {value, score}[] (node-redis ZRANGE with WITHSCORES)
        // In-Memory map returns SubscriberDTO[]
        // Let's use a union or just `any` with eslint-disable if needed, but the user wants NO warnings.
        // The previous error was "Unexpected any".

        // Let's type subscribers as `any[]` but with eslint-disable if I can't easily union them.
        // Actually, in both paths `subscribers` variable holds the result of ZRANGE (Array of objects with value/score) 
        // OR it holds the `filtered` candidates which are DTOs.
        // This variable is reused for two different types of objects.
        // 1. Redis ZRange items
        // 2. Filtered Candidate objects
        // This is bad practice. I should separate them or use `unknown[]`.

        let subscribers: { value: string; score: number }[] = [];

        // If searching OR sorting by email/city/country OR using Date Filter, we must fetch-all-and-sort (or fetch-top-N)
        // Default "All Time Date" sort is efficiently handled by Redis Rank if no search is present.

        // Check if we can use the Optimized All Time Rank-Based path
        // converting maxScore check to be robust (e.g. if maxScore is effectively "now")
        const isAllTime = minScore === 0 && maxScore >= Date.now() - 86400000; // Allow 24h buffer for "now"
        const useOptimizedPath = !search && sortKey === 'date' && isAllTime;

        if (!useOptimizedPath) {
            // IN-MEMORY PATH (Search, Date Filter, or Non-Date Sort)
            console.log(`[Subscribers API] Using In-Memory Path (Search: ${!!search}, DateFilter: ${!isAllTime}, Sort: ${sortKey})`);

            const SEARCH_LIMIT = 2000;
            // Fetch top candidates (latest first default)
            const topMembers = await redis.zRangeWithScores('subscribers', 0, SEARCH_LIMIT - 1, { REV: true });

            // Hydrate metadata
            const candidates = await Promise.all(topMembers.map(async (sub) => {
                const email = sub.value;
                const meta = await redis.hGetAll(`subscriber:${email}`);
                return {
                    email,
                    timestamp: sub.score,
                    date: new Date(sub.score).toLocaleString(),
                    country: meta?.country || 'Unknown',
                    city: meta?.city || 'Unknown'
                } as SubscriberDTO;
            }));

            // 1. Filter
            let filtered = candidates.filter(sub => {
                // Date Filter
                if (sub.timestamp < minScore || sub.timestamp > maxScore) return false;

                if (!search) return true;
                const s = search;
                let countryName = '';
                if (sub.country && sub.country !== 'Unknown') {
                    try {
                        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                        countryName = regionNames.of(sub.country) || sub.country;
                    } catch {
                        countryName = sub.country;
                    }
                }

                return (
                    sub.email.toLowerCase().includes(s) ||
                    (sub.city && sub.city.toLowerCase().includes(s)) ||
                    (countryName && countryName.toLowerCase().includes(s)) ||
                    (sub.country && sub.country.toLowerCase().includes(s))
                );
            });

            // 2. Sort
            filtered.sort((a, b) => {
                let valA, valB;
                if (sortKey === 'date') {
                    valA = a.timestamp;
                    valB = b.timestamp;
                } else {
                    valA = (a[sortKey] || '').toString().toLowerCase();
                    valB = (b[sortKey] || '').toString().toLowerCase();
                }

                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });

            total = filtered.length;
            totalPages = Math.ceil(total / limit);

            // 3. Paginate
            const start = (page - 1) * limit;
            const end = start + limit;
            formatted = filtered.slice(start, end);

        } else {
            // OPTIMIZED PATH (All Time, Date Sort, No Search)
            // Use Rank-based pagination (fastest for full lists)
            console.log(`[Subscribers API] Using Optimized Rank-Based Path (All Time)`);
            total = await redis.zCard('subscribers');
            totalPages = Math.ceil(total / limit);

            const start = (page - 1) * limit;
            const end = start + limit - 1;

            // REV true = Newest First (Desc), REV false = Oldest First (Asc)
            subscribers = await redis.zRangeWithScores('subscribers', start, end, { REV: sortDir === 'desc' });

            console.log(`[Subscribers API] Fetched subscribers: ${subscribers.length}`);

            // Format (Standard Path)
            formatted = await Promise.all(subscribers.map(async (sub) => {
                const email = sub.value;
                const meta = await redis.hGetAll(`subscriber:${email}`);

                return {
                    email,
                    timestamp: sub.score,
                    date: new Date(sub.score).toLocaleString(),
                    country: meta?.country || 'Unknown',
                    city: meta?.city || 'Unknown'
                };
            }));
        }

        return NextResponse.json({
            subscribers: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Redis error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
        if (redis.isOpen) await redis.quit();
    }
}
