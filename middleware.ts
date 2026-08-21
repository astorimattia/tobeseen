import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get('accept') || '';
  
  const response = NextResponse.next();
  
  // Add Vary header for routes that support content negotiation
  const supportsMarkdown = pathname === '/' || pathname.startsWith('/work');
  
  if (supportsMarkdown) {
    response.headers.set('Vary', 'Accept, Accept-Encoding');
    
    // If client explicitly requests text/markdown, serve markdown version
    if (acceptHeader.includes('text/markdown')) {
      return serveMarkdownVersion(pathname, request);
    }
  }
  
  // Add Vary header to static text files that might be served differently
  if (pathname === '/llms.txt' || pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    response.headers.set('Vary', 'Accept-Encoding');
  }
  
  return response;
}

function serveMarkdownVersion(pathname: string, request: NextRequest) {
  let markdownContent = '';
  
  if (pathname === '/') {
    markdownContent = `# Sacratos - Stories of Raw Devotion

Documentary photography capturing the world's most dangerous and hidden cultural events.

## About

Sacratos is an independent documentary photography project founded by Daniele Colucci and Mattia Astori. We document extreme rituals and festivals that mainstream media rarely covers.

## Featured Events

- **Feria Internacional de la Pirotecnia** (Tultepec, Mexico) - 200 rocket-loaded bulls thrown against thousands of people
- **Vegetarian Festival** (Phuket, Thailand) - Spirit mediums pierce their bodies in trance states
- **Exploding Hammers** (San Juan de la Vega, Mexico) - Explosive-packed sledgehammers slammed against stone anvils
- **Tinku de Macha** (Bolivia) - Three-day ritual combat festival at 4,000m altitude
- **Maut Ka Kuan** (India) - Well of Death motorcycle stunts on vertical walls
- **Banni Festival** (India) - Sacred midnight battlefield

## Recognition

115M+ views across platforms. Featured by Wikipedia, Insta360, and All About Photo.

## Links

- Website: https://sacratos.com
- Agent Instructions: https://sacratos.com/llms.txt
- Sitemap: https://sacratos.com/sitemap.xml
- Instagram: @sacratos
- Contact: mattia@sacratos.com
`;
  } else if (pathname.startsWith('/work')) {
    markdownContent = `# Sacratos Work

View our documentary photography at https://sacratos.com/work

For detailed project information, visit the website or see https://sacratos.com/llms.txt
`;
  }
  
  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/work/:path*',
    '/llms.txt',
    '/sitemap.xml',
    '/robots.txt',
  ],
};
