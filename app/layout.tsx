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
    types: {
      "text/plain": "/llms.txt",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },
  openGraph: {
    title: "Sacratos - Stories of Raw Devotion",
    description: "Documentary photography and stories from the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand, we capture the chaos, beauty, and truth that mainstream media misses.",
    url: "https://sacratos.com",
    siteName: "Sacratos",
    images: [
      {
        url: "https://sacratos.com/digital/tultepec.webp",
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
    images: ["https://sacratos.com/digital/tultepec.webp"],
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
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://sacratos.com/#organization",
                  "name": "Sacratos",
                  "description": "Documentary photography and storytelling project capturing the world's most hidden and dangerous cultural events — from exploding hammers in Mexico to spirit mediums in Thailand, the Well of Death in India to ritual combat in Bolivia. 115M+ views across platforms. Featured by Wikipedia, Insta360, and All About Photo.",
                  "url": "https://sacratos.com",
                  "logo": "https://sacratos.com/favicon.webp",
                  "sameAs": [
                    "https://instagram.com/sacratos",
                    "https://twitter.com/sacratos"
                  ],
                  "foundingDate": "2024",
                  "areaServed": "Worldwide",
                  "knowsAbout": [
                    "documentary photography",
                    "photojournalism",
                    "cultural anthropology",
                    "dangerous festivals",
                    "hidden rituals",
                    "world travel",
                    "adventure documentary",
                    "immersive storytelling",
                    "Mexican fireworks festivals",
                    "Indian stunt culture",
                    "Thai spirit mediums",
                    "Bolivian Tinku",
                    "Vegetarian Festival Thailand",
                    "Feria de la Pirotecnia Tultepec",
                    "Maut Ka Kuan Well of Death",
                    "exploding hammers San Juan de la Vega"
                  ],
                  "founder": [
                    { "@id": "https://sacratos.com/#daniele" },
                    { "@id": "https://sacratos.com/#mattia" }
                  ]
                },
                {
                  "@type": "Person",
                  "@id": "https://sacratos.com/#daniele",
                  "name": "Daniele Colucci",
                  "url": "https://danielecolucci.com",
                  "jobTitle": "Co-Creator, Photographer, Videomaker",
                  "worksFor": { "@id": "https://sacratos.com/#organization" }
                },
                {
                  "@type": "Person",
                  "@id": "https://sacratos.com/#mattia",
                  "name": "Mattia Astori",
                  "url": "https://mattiaastori.com",
                  "jobTitle": "Co-Creator, Producer, Photographer",
                  "worksFor": { "@id": "https://sacratos.com/#organization" },
                  "description": "Co-creator of Sacratos and founder of Astori Ventures, a private investment firm."
                },
                {
                  "@type": "CreativeWork",
                  "name": "Feria Internacional de la Pirotecnia",
                  "description": "Documentary coverage of the dangerous fireworks festival in Tultepec, Mexico — 200 bulls loaded with rockets thrown against thousands of people",
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "Tultepec, Mexico" }
                },
                {
                  "@type": "CreativeWork",
                  "name": "Vegetarian Festival Thailand",
                  "description": "Documentary coverage of spirit mediums piercing their skin in rituals during the Nine Emperor Gods Festival in Thailand",
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "Thailand" }
                },
                {
                  "@type": "CreativeWork",
                  "name": "Exploding Hammers",
                  "description": "Documentary coverage of the tradition of slamming explosive-packed hammers against stone anvils in San Juan de la Vega, Mexico",
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "San Juan de la Vega, Mexico" }
                },
                {
                  "@type": "CreativeWork",
                  "name": "Tinku de Macha",
                  "description": "Documentary coverage of the three-day ritual combat festival at 4,000m altitude in Bolivia — dance, fight, mourn",
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "Macha, Bolivia" }
                },
                {
                  "@type": "CreativeWork",
                  "name": "Banni Festival",
                  "description": "Documentary coverage of the midnight battlefield festival in India where bloodshed is sacred offering",
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "India" }
                },
                {
                  "@type": "Article",
                  "name": "Riding the Well of Death: Soma Basu's Defiance of Gravity and Tradition",
                  "description": "The story of Soma Basu, a Bengali woman stunt rider in India's Maut Ka Kuan (Well of Death), who defied gender expectations to ride motorcycles on vertical wooden walls",
                  "author": { "name": "Ana Ben" },
                  "creator": { "@id": "https://sacratos.com/#organization" },
                  "locationCreated": { "@type": "Place", "name": "Jagdalpur, India" }
                }
              ]
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
