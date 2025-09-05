import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventPage from "../../components/EventPage";
import ImagePreloader from "../../components/ImagePreloader";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";

const EVENTS = [
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    story: "Every year, 200 man made bulls loaded with fireworks are thrown into crowds. The streets become a battlefield with fire and explosion, it's a tradition that tests the limits of human courage and the power of fire.",
    images: ["/tultepec.webp", "/tultepec2.webp", "/tultepec3.webp", "/tultepec4.webp", "/tultepec5.webp", "/tultepec6.webp", "/tultepec7.webp", "/tultepec8.webp", "/tultepec9.webp", "/tultepec10.webp", "/tultepec11.webp", "/tultepec12.webp", "/tultepec13.webp", "/tultepec14.webp", "/tultepec15.webp"],
    documentaryDate: "2026",
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    story: "Spititual leaders pierce their skin with swords as they enter a trance. The festival is a nine-day celebration where participants believe they become vessels for the gods.",
    images: ["/vegetarian.webp", "/vegetarian2.webp", "/vegetarian3.webp", "/vegetarian4.webp", "/vegetarian5.webp", "/vegetarian6.webp", "/vegetarian7.webp", "/vegetarian8.webp", "/vegetarian9.webp", "/vegetarian10.webp", "/vegetarian11.webp", "/vegetarian12.webp", "/vegetarian13.webp", "/vegetarian14.webp", "/vegetarian15.webp"],
    documentaryDate: "Late 2025",
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    story: "Hammers packed with explosives slam stone anvils, creating controlled chaos. The explosive force sends shrapnel flying through the air as participants test their luck and timing.",
    images: ["/hammers.webp", "/hammers2.webp", "/hammers3.webp", "/hammers4.webp", "/hammers5.webp", "/hammers6.webp", "/hammers7.webp", "/hammers8.webp", "/hammers9.webp", "/hammers10.webp", "/hammers11.webp", "/hammers12.webp", "/hammers13.webp", "/hammers14.webp", "/hammers15.webp"],
    documentaryDate: "2026",
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    story: "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, participants fight until they draw blood, believing that the spilled blood ensures a good harvest.",
    images: ["/tinku.webp", "/tinku2.webp", "/tinku3.webp", "/tinku4.webp", "/tinku5.webp", "/tinku6.webp", "/tinku7.webp", "/tinku8.webp", "/tinku9.webp", "/tinku10.webp", "/tinku11.webp", "/tinku12.webp", "/tinku13.webp", "/tinku14.webp", "/tinku15.webp"],
    documentaryDate: "2026",
  },
];

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    eventId: event.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = EVENTS.find((e) => e.id === eventId);
  
  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} - Hidden Festivals and Extreme Rituals | Sacratos`,
    description: event.story,
    keywords: ["documentary work", "hidden festivals", "extreme rituals", "cultural events", "dangerous traditions", "photojournalism", event.title.toLowerCase()],
    openGraph: {
      title: event.title,
      description: event.story,
      url: `/work/${event.id}`,
      images: [
        {
          url: event.images[0],
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.story,
    },
  };
}

export default async function EventPageRoute({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = EVENTS.find((e) => e.id === eventId);
  
  if (!event) {
    notFound();
  }

  const currentIndex = EVENTS.findIndex((e) => e.id === eventId);
  const nextEvent = EVENTS[(currentIndex + 1) % EVENTS.length];
  const prevEvent = EVENTS[currentIndex === 0 ? EVENTS.length - 1 : currentIndex - 1];

  // Preload current event images and adjacent event images
  const preloadImages = [
    ...event.images.slice(0, 6), // First 6 images of current event
    ...nextEvent.images.slice(0, 3), // First 3 images of next event
    ...prevEvent.images.slice(0, 3), // First 3 images of previous event
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Preload critical images */}
      <ImagePreloader images={preloadImages} priority={true} />
      
      {/* Back navigation */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            ← Back to all events
          </Link>
        </div>
      </div>

      <EventPage
        event={event}
        currentIndex={currentIndex}
        totalEvents={EVENTS.length}
        nextEventId={nextEvent.id}
        prevEventId={prevEvent.id}
      />

      {/* Subscribe CTA Section */}
      <Contact />

      <Footer />
    </main>
  );
}
