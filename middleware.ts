import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Skip static files, images, api routes, and favicon
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.includes('.') // usually files like .ico, .png, etc.
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
        const referrer = request.headers.get('referer') || '';
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

        // Create a privacy-friendly visitor hash (simple day-based hash)
        // In production, consider a more robust hashing if collision is a concern, but this is fine for basic stats
        const today = new Date().toISOString().slice(0, 10);
        const visitorId = btoa(`${ip}-${userAgent}-${today}`).slice(0, 32);

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
                referrer,
                visitorId
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
