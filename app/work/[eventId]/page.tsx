import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventPage from "../../components/EventPage";
import ImagePreloader from "../../components/ImagePreloader";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";

const EVENTS = [
  {
    id: "banni",
    title: "Banni Festival, India",
    story: "In a 'mock' fight that leaves hundreds injured every year, thousands of devotees clash with long bamboo sticks to secure the idol of their god. It's a midnight battlefield where bloodshed is considered a sacred offering.",
    images: ["/digital/banni.webp", "/digital/banni2.webp", "/digital/banni3.webp", "/digital/banni4.webp", "/digital/banni5.webp", "/digital/banni6.webp", "/digital/banni7.webp", "/digital/banni8.webp", "/digital/banni9.webp", "/digital/banni10.webp", "/digital/banni11.webp", "/digital/banni12.webp", "/digital/banni13.webp", "/digital/banni14.webp", "/digital/banni15.webp"],
  },
  {
    id: "mautkakuan",
    title: "Maut Ka Kuan, India",
    story: "Daredevils defy gravity riding motorcycles and cars on vertical wooden walls. In the 'Well of Death', the roar of engines and the smell of exhaust fill the air as riders perform death-defying stunts held only by centrifugal force.",
    images: ["/digital/mautkakuan.webp", "/digital/mautkakuan2.webp", "/digital/mautkakuan3.webp", "/digital/mautkakuan4.webp", "/digital/mautkakuan5.webp", "/digital/mautkakuan6.webp", "/digital/mautkakuan7.webp", "/digital/mautkakuan8.webp", "/digital/mautkakuan9.webp", "/digital/mautkakuan10.webp", "/digital/mautkakuan11.webp", "/digital/mautkakuan12.webp", "/digital/mautkakuan13.webp", "/digital/mautkakuan14.webp", "/digital/mautkakuan15.webp"],
  },
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    story: "Every year, 200 man made bulls loaded with fireworks are thrown into crowds. The streets become a battlefield with fire and explosion, it's a tradition that tests the limits of human courage and the power of fire.",
    images: ["/digital/tultepec.webp", "/digital/tultepec2.webp", "/digital/tultepec3.webp", "/digital/tultepec4.webp", "/digital/tultepec5.webp", "/digital/tultepec6.webp", "/digital/tultepec7.webp", "/digital/tultepec8.webp", "/digital/tultepec9.webp", "/digital/tultepec10.webp", "/digital/tultepec11.webp", "/digital/tultepec12.webp", "/digital/tultepec13.webp", "/digital/tultepec14.webp", "/digital/tultepec15.webp"],
    analogImages: [
      "/analog/tultepec-analog.webp", "/analog/tultepec-analog2.webp", "/analog/tultepec-analog3.webp",
      "/analog/tultepec-analog4.webp", "/analog/tultepec-analog5.webp", "/analog/tultepec-analog6.webp",
      "/analog/tultepec-analog7.webp", "/analog/tultepec-analog8.webp", "/analog/tultepec-analog9.webp",
      "/analog/tultepec-analog10.webp", "/analog/tultepec-analog11.webp", "/analog/tultepec-analog12.webp",
      "/analog/tultepec-analog13.webp", "/analog/tultepec-analog14.webp", "/analog/tultepec-analog15.webp",
      "/analog/tultepec-analog16.webp", "/analog/tultepec-analog17.webp", "/analog/tultepec-analog18.webp",
      "/analog/tultepec-analog19.webp"
    ],
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    story: "Spititual leaders pierce their skin with swords as they enter a trance. The festival is a nine-day celebration where participants believe they become vessels for the gods.",
    images: ["/digital/vegetarian.webp", "/digital/vegetarian2.webp", "/digital/vegetarian3.webp", "/digital/vegetarian4.webp", "/digital/vegetarian5.webp", "/digital/vegetarian6.webp", "/digital/vegetarian7.webp", "/digital/vegetarian8.webp", "/digital/vegetarian9.webp", "/digital/vegetarian10.webp", "/digital/vegetarian11.webp", "/digital/vegetarian12.webp", "/digital/vegetarian13.webp", "/digital/vegetarian14.webp", "/digital/vegetarian15.webp"],
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    story: "Hammers packed with explosives slam stone anvils, creating controlled chaos. The explosive force sends shrapnel flying through the air as participants test their luck and timing.",
    images: ["/digital/hammers.webp", "/digital/hammers2.webp", "/digital/hammers3.webp", "/digital/hammers4.webp", "/digital/hammers5.webp", "/digital/hammers6.webp", "/digital/hammers7.webp", "/digital/hammers8.webp", "/digital/hammers9.webp", "/digital/hammers10.webp", "/digital/hammers11.webp", "/digital/hammers12.webp", "/digital/hammers13.webp", "/digital/hammers14.webp", "/digital/hammers15.webp"],
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    story: "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, participants fight until they draw blood, believing that the spilled blood ensures a good harvest.",
    images: ["/digital/tinku.webp", "/digital/tinku2.webp", "/digital/tinku3.webp", "/digital/tinku4.webp", "/digital/tinku5.webp", "/digital/tinku6.webp", "/digital/tinku7.webp", "/digital/tinku8.webp", "/digital/tinku9.webp", "/digital/tinku10.webp", "/digital/tinku11.webp", "/digital/tinku12.webp", "/digital/tinku13.webp", "/digital/tinku14.webp", "/digital/tinku15.webp"],
    analogImages: [
      "/analog/tinku-analog.webp", "/analog/tinku-analog2.webp", "/analog/tinku-analog3.webp",
      "/analog/tinku-analog4.webp", "/analog/tinku-analog5.webp", "/analog/tinku-analog6.webp",
      "/analog/tinku-analog7.webp", "/analog/tinku-analog8.webp", "/analog/tinku-analog9.webp",
      "/analog/tinku-analog10.webp", "/analog/tinku-analog11.webp", "/analog/tinku-analog12.webp",
      "/analog/tinku-analog13.webp", "/analog/tinku-analog14.webp", "/analog/tinku-analog15.webp",
      "/analog/tinku-analog16.webp"
    ],
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
