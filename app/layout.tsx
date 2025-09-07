import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ImagePerformanceMonitor from "./components/ImagePerformanceMonitor";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sacratos - Stories of Raw Devotion",
  description: "Documentary photography and stories from the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand, we capture the chaos, beauty, and truth that mainstream media misses.",
  keywords: ["documentary", "photography", "hidden stories", "cultural events", "dangerous festivals", "world travel", "photojournalism", "real stories"],
  authors: [{ name: "Sacratos Team" }],
  creator: "Sacratos",
  publisher: "Sacratos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sacratos.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sacratos - Stories of Raw Devotion",
    description: "Documentary photography and stories from the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand, we capture the chaos, beauty, and truth that mainstream media misses.",
    url: "https://sacratos.com",
    siteName: "Sacratos",
    images: [
      {
        url: "https://sacratos.com/tultepec.webp",
        width: 1200,
        height: 630,
        alt: "Feria Internacional de la Pirotecnia - Bulls loaded with rockets thrown against thousands of people",
        type: "image/webp",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sacratos - Stories of Raw Devotion",
    description: "Documentary photography and stories from the world's most dangerous and hidden cultural events.",
    images: ["https://sacratos.com/tultepec.webp"],
    creator: "@sacratos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="Sacratos Team" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Social Media Meta Tags */}
        <meta property="og:site_name" content="Sacratos" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Feria Internacional de la Pirotecnia - Dangerous fireworks festival in Mexico" />
        
        {/* Twitter Additional Meta */}
        <meta name="twitter:site" content="@sacratos" />
        <meta name="twitter:creator" content="@sacratos" />
        
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "t6x1awmzr0");
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sacratos",
              "description": "Documentary photography and storytelling project capturing hidden cultural events and dangerous festivals around the world",
              "url": "https://sacratos.com",
              "logo": "https://sacratos.com/favicon.png",
              "sameAs": [
                "https://instagram.com/sacratos",
                "https://twitter.com/sacratos"
              ],
              "foundingDate": "2024",
              "areaServed": "Worldwide",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Documentary Photography",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "CreativeWork",
                      "name": "Feria Internacional de la Pirotecnia",
                      "description": "Documentary coverage of the dangerous fireworks festival in Tultepec, Mexico"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "CreativeWork",
                      "name": "Vegetarian Festival Thailand",
                      "description": "Spirit mediums and cultural rituals in Thailand"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ImagePerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
