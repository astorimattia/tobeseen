import { redis } from '@/lib/redis';
import { ensureRedisConnection } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Dual auth: check key param OR admin_token cookie
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if ((!adminPassword || key !== adminPassword) && (!token || token.value !== 'true')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await ensureRedisConnection();

        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        // Date Filtering
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        console.log(`[Subscribers API] Params: from=${from}, to=${to}`);

        let minScore = 0;
        let maxScore = Date.now();

        if (from && from !== 'all') {
            minScore = new Date(from).getTime();
        }
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            maxScore = toDate.getTime();
        }

        // Search & Sort variables
        const search = searchParams.get('search')?.toLowerCase();
        const sortKey = searchParams.get('sortKey') || 'date';
        const sortDir = searchParams.get('sortDir') || 'desc';

        type SubscriberDTO = {
            email: string;
            timestamp: number;
            date: string;
            country: string;
            city: string;
            [key: string]: string | number;
        };

        let formatted: SubscriberDTO[] = [];
        let total = 0;
        let totalPages = 0;

        const isAllTime = minScore === 0 && maxScore >= Date.now() - 86400000;
        const useOptimizedPath = !search && sortKey === 'date' && isAllTime;

        if (!useOptimizedPath) {
            // IN-MEMORY PATH (Search, Date Filter, or Non-Date Sort)
            console.log(`[Subscribers API] Using In-Memory Path (Search: ${!!search}, DateFilter: ${!isAllTime}, Sort: ${sortKey})`);

            const SEARCH_LIMIT = 2000;
            // ioredis uses zrevrange instead of zRangeWithScores with REV option
            const topMembers = await redis.zrevrangebyscore('subscribers', '+inf', '-inf', 'WITHSCORES', 'LIMIT', 0, SEARCH_LIMIT);

            // Parse ioredis result: [value, score, value, score, ...]
            const candidates: SubscriberDTO[] = [];
            for (let i = 0; i < topMembers.length; i += 2) {
                const email = topMembers[i];
                const score = Number(topMembers[i + 1]);
                const meta = await redis.hgetall(`subscriber:${email}`);
                candidates.push({
                    email,
                    timestamp: score,
                    date: new Date(score).toLocaleString(),
                    country: meta?.country || 'Unknown',
                    city: meta?.city || 'Unknown'
                });
            }

            // 1. Filter
            const filtered = candidates.filter(sub => {
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
            console.log(`[Subscribers API] Using Optimized Rank-Based Path (All Time)`);
            total = await redis.zcard('subscribers');
            totalPages = Math.ceil(total / limit);

            const start = (page - 1) * limit;
            const end = start + limit - 1;

            // ioredis: use zrevrange for newest-first (desc), zrange for oldest-first (asc)
            let members: string[];
            if (sortDir === 'desc') {
                members = await redis.zrevrange('subscribers', start, end, 'WITHSCORES');
            } else {
                members = await redis.zrange('subscribers', start, end, 'WITHSCORES');
            }

            console.log(`[Subscribers API] Fetched subscribers: ${members.length / 2}`);

            // Parse ioredis result: [value, score, value, score, ...]
            for (let i = 0; i < members.length; i += 2) {
                const email = members[i];
                const score = Number(members[i + 1]);
                const meta = await redis.hgetall(`subscriber:${email}`);

                formatted.push({
                    email,
                    timestamp: score,
                    date: new Date(score).toLocaleString(),
                    country: meta?.country || 'Unknown',
                    city: meta?.city || 'Unknown'
                });
            }
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
    }
}
