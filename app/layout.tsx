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
  title: "Off Map Stories - Some Things Deserve to Be Seen",
  description: "Documentary photography and stories from the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand, we capture the chaos, beauty, and truth that mainstream media misses.",
  keywords: ["documentary", "photography", "hidden stories", "cultural events", "dangerous festivals", "world travel", "photojournalism", "real stories"],
  authors: [{ name: "Off Map Team" }],
  creator: "Off Map",
  publisher: "Off Map",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://placeholder-domain.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "To Be Seen - Hidden Stories That Deserve to Be Seen",
    description: "Documentary photography and stories from the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand, we capture the chaos, beauty, and truth that mainstream media misses.",
    url: "https://placeholder-domain.com",
    siteName: "To Be Seen",
    images: [
      {
        url: "/tultepec.webp",
        width: 1200,
        height: 630,
        alt: "Feria Internacional de la Pirotecnia - Bulls loaded with rockets thrown against thousands of people",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "To Be Seen - Hidden Stories That Deserve to Be Seen",
    description: "Documentary photography and stories from the world's most dangerous and hidden cultural events.",
    images: ["/tultepec.webp"],
    creator: "@tobeseen",
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="To Be Seen Team" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Social Media Meta Tags */}
        <meta property="og:site_name" content="To Be Seen" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Feria Internacional de la Pirotecnia - Dangerous fireworks festival in Mexico" />
        
        {/* Twitter Additional Meta */}
        <meta name="twitter:site" content="@tobeseen" />
        <meta name="twitter:creator" content="@tobeseen" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "To Be Seen",
              "description": "Documentary photography and storytelling project capturing hidden cultural events and dangerous festivals around the world",
              "url": "https://placeholder-domain.com",
              "logo": "https://placeholder-domain.com/favicon.ico",
              "sameAs": [
                "https://instagram.com/tobeseen",
                "https://twitter.com/tobeseen"
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
