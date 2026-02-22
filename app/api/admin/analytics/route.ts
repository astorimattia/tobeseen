
import { NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/analytics';
import { ensureRedisConnection } from '@/lib/redis';

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
    console.log('Analytics API: Ensuring Redis connection...');
    await ensureRedisConnection();
    console.log('Analytics API: Redis connection verified');

    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    const visitorPage = parseInt(searchParams.get('visitorPage') || '1');
    const visitorLimit = parseInt(searchParams.get('visitorLimit') || '10');
    const country = searchParams.get('country') || undefined;
    const visitorId = searchParams.get('visitorId') || undefined;
    const timeZone = searchParams.get('timeZone') || 'UTC';
    const granularity = searchParams.get('granularity') as 'day' | 'hour' || 'day';
    const search = searchParams.get('search') || undefined;

    console.log('Analytics API: Fetching data with params:', {
      from, to, visitorPage, visitorLimit, country, visitorId, timeZone, granularity
    });

    const data = await getAnalyticsData({
      from,
      to,
      visitorPage,
      visitorLimit,
      country,
      visitorId,
      timeZone,
      granularity,
      search
    });

    console.log('Analytics API: Data fetched successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      redisUrl: process.env.REDIS_URL ? 'Set' : 'Not set',
      adminPassword: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set'
    });

    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
