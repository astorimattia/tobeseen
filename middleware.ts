import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip RSC (React Server Components) and prefetch internal requests
  if (
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1'
  ) {
    return NextResponse.next();
  }

  // Fire and forget analytics tracking
  // We don't await this to avoid slowing down the user response
  trackVisit(request);

  return NextResponse.next();
}

async function trackVisit(request: NextRequest) {
  try {
    const url = request.nextUrl.clone();

    // Extract data
    const path = url.pathname;
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = request.headers.get('x-vercel-ip-city') || '';
    const referrer = request.headers.get('referer') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Collect query params for noise filtering (fbclid, gclid, etc.)
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { queryParams[key] = value; });

    // Persistent visitorId (IP + UserAgent) - No date, so it tracks "Who" over time
    // Using base64 to allow safe key usage, but it effectively identifies the user-device
    const visitorId = btoa(`${ip}-${userAgent}`).slice(0, 32);

    // Send to our internal API
    // Note: We use the full URL including origin because fetch in middleware needs absolute URL
    await fetch(`${url.origin}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        country,
        city,
        referrer,
        visitorId,
        ip,         // Pass raw IP for "Who they are"
        userAgent,  // Pass UA for "Who they are"
        queryParams // Pass query params for noise filtering
      }),
    });
  } catch (error) {
    // Fail silently, don't block the user
    console.error('Analytics middleware error:', error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (ALL Next.js internal paths)
     * - favicon.ico, assets, sw.js
     */
    '/((?!api|_next|favicon.ico|assets|sw.js).*)',
  ],
};
