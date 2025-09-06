import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work - Hidden Festivals and Extreme Rituals | Sacratos",
  description: "Explore our documentary coverage of the world's most dangerous and hidden cultural events. From fireworks bulls in Mexico to spirit mediums in Thailand, discover the stories of raw devotion.",
  keywords: ["documentary work", "hidden festivals", "extreme rituals", "cultural events", "dangerous traditions", "photojournalism", "world festivals"],
  openGraph: {
    title: "Work - Hidden Festivals and Extreme Rituals",
    description: "Documentary coverage of the world's most dangerous and hidden cultural events. A documentary is coming in 2026.",
    url: "/work",
    images: [
      {
        url: "/tultepec.webp",
        width: 1200,
        height: 630,
        alt: "Feria Internacional de la Pirotecnia - Dangerous fireworks festival",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work - Hidden Festivals and Extreme Rituals",
    description: "Documentary coverage of dangerous cultural events around the world.",
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
