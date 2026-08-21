import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventPage from "../../components/EventPage";
import ImagePreloader from "../../components/ImagePreloader";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";

const EVENTS = [
  {
    id: "soccorsovideo",
    title: "Festa del Soccorso, Italy",
    year: "2026",
    story: "In San Severo, fujenti run under exploding batteries strung across the street while the Black Madonna moves through town. People who left come back that weekend, shirts already full of last year's holes.",
    images: [],
    vimeoId: "1214414319",
    videoUrl: "https://vimeo.com/1214414319?share=copy&fl=sv&fe=ci",
  },
  {
    id: "soccorso",
    title: "Festa del Soccorso, Italy",
    year: "2026",
    story: "In San Severo, fujenti run under exploding batteries strung across the street while the Black Madonna moves through town. People who left come back that weekend, shirts already full of last year's holes.",
    images: ["/digital/soccorso13.webp", "/digital/soccorso14.webp", "/digital/soccorso15.webp", "/digital/soccorso16.webp", "/digital/soccorso17.webp", "/digital/soccorso18.webp", "/digital/soccorso19.webp", "/digital/soccorso20.webp", "/digital/soccorso21.webp", "/digital/soccorso22.webp", "/digital/soccorso23.webp", "/digital/soccorso24.webp", "/digital/soccorso25.webp", "/digital/soccorso26.webp", "/digital/soccorso27.webp", "/digital/soccorso28.webp", "/digital/soccorso29.webp", "/digital/soccorso30.webp", "/digital/soccorso31.webp", "/digital/soccorso32.webp", "/digital/soccorso33.webp", "/digital/soccorso34.webp", "/digital/soccorso35.webp", "/digital/soccorso36.webp", "/digital/soccorso37.webp", "/digital/soccorso38.webp", "/digital/soccorso39.webp", "/digital/soccorso40.webp"],
    analogImages: [
      "/analog/sansevero-analog.webp", "/analog/sansevero-analog2.webp", "/analog/sansevero-analog3.webp",
      "/analog/sansevero-analog4.webp", "/analog/sansevero-analog5.webp", "/analog/sansevero-analog6.webp",
      "/analog/sansevero-analog7.webp", "/analog/sansevero-analog8.webp", "/analog/sansevero-analog9.webp",
      "/analog/sansevero-analog10.webp", "/analog/sansevero-analog11.webp"
    ],
    stories: [
      {
        url: "https://extremerituals.substack.com/p/c-vdim-au-fnel",
        title: "C' vdim au' fnel",
        author: "Mattia Astori",
        external: true,
      },
      {
        url: "https://extremerituals.substack.com/p/explosive-devotion-the-fujenti-and",
        title: "Explosive Devotion: The Fujenti and the Black Madonna",
        author: "Daniele Colucci, Ana Ben, and Sacratos",
        external: true,
      },
    ],
  },
  {
    id: "banni",
    title: "Banni Festival, India",
    year: "2025",
    story: "In a 'mock' fight that leaves hundreds injured every year, thousands of devotees clash with long bamboo sticks to secure the idol of their god. It's a midnight battlefield where bloodshed is considered a sacred offering.",
    images: ["/digital/banni.webp", "/digital/banni2.webp", "/digital/banni3.webp", "/digital/banni4.webp", "/digital/banni5.webp", "/digital/banni6.webp", "/digital/banni7.webp", "/digital/banni8.webp", "/digital/banni9.webp", "/digital/banni10.webp", "/digital/banni11.webp", "/digital/banni12.webp", "/digital/banni13.webp", "/digital/banni14.webp", "/digital/banni15.webp"],
    analogImages: [
      "/analog/banni-analog.webp", "/analog/banni-analog2.webp", "/analog/banni-analog3.webp",
      "/analog/banni-analog4.webp", "/analog/banni-analog5.webp", "/analog/banni-analog6.webp",
      "/analog/banni-analog7.webp", "/analog/banni-analog8.webp", "/analog/banni-analog9.webp",
      "/analog/banni-analog10.webp", "/analog/banni-analog11.webp", "/analog/banni-analog12.webp",
      "/analog/banni-analog13.webp", "/analog/banni-analog14.webp", "/analog/banni-analog15.webp"
    ],
    stories: [
      {
        url: "https://extremerituals.substack.com/p/echoes-of-demons-the-violent-devotion",
        title: "Echoes of Demons: The Violent Devotion of Devaragattu",
        author: "Daniele Colucci, Ana Ben, and Sacratos",
        external: true,
      },
    ],
  },
  {
    id: "mautkakuan",
    title: "Maut Ka Kuan, India",
    year: "2025",
    story: "Daredevils defy gravity riding motorcycles and cars on vertical wooden walls. In the 'Well of Death', the roar of engines and the smell of exhaust fill the air as riders perform death-defying stunts held only by centrifugal force.",
    images: ["/digital/mautkakuan.webp", "/digital/mautkakuan2.webp", "/digital/mautkakuan3.webp", "/digital/mautkakuan4.webp", "/digital/mautkakuan5.webp", "/digital/mautkakuan6.webp", "/digital/mautkakuan7.webp", "/digital/mautkakuan8.webp", "/digital/mautkakuan9.webp", "/digital/mautkakuan10.webp", "/digital/mautkakuan11.webp", "/digital/mautkakuan12.webp", "/digital/mautkakuan13.webp", "/digital/mautkakuan14.webp", "/digital/mautkakuan15.webp"],
    analogImages: [
      "/optimized/analog/mautkakuan-analog_lg.webp",
      "/optimized/analog/mautkakuan-analog2_lg.webp",
      "/optimized/analog/mautkakuan-analog3_lg.webp",
      "/optimized/analog/mautkakuan-analog4_lg.webp",
      "/optimized/analog/mautkakuan-analog5_lg.webp",
      "/optimized/analog/mautkakuan-analog6_lg.webp",
      "/optimized/analog/mautkakuan-analog7_lg.webp",
      "/optimized/analog/mautkakuan-analog8_lg.webp",
      "/optimized/analog/mautkakuan-analog9_lg.webp",
      "/optimized/analog/mautkakuan-analog10_lg.webp",
      "/optimized/analog/mautkakuan-analog11_lg.webp",
      "/optimized/analog/mautkakuan-analog12_lg.webp",
      "/optimized/analog/mautkakuan-analog13_lg.webp",
      "/optimized/analog/mautkakuan-analog14_lg.webp",
      "/optimized/analog/mautkakuan-analog15_lg.webp",
    ],
    stories: [
      {
        url: "https://extremerituals.substack.com/p/riding-the-well-of-death-soma-basus",
        title: "Riding the Well of Death: Soma Basu's Defiance of Gravity and Tradition",
        author: "Daniele Colucci, Ana Ben, and Sacratos",
        external: true,
      },
    ],
  },
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    year: "2025",
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
    year: "2024",
    story: "Spititual leaders pierce their skin with swords as they enter a trance. The festival is a nine-day celebration where participants believe they become vessels for the gods.",
    images: ["/digital/vegetarian.webp", "/digital/vegetarian2.webp", "/digital/vegetarian3.webp", "/digital/vegetarian4.webp", "/digital/vegetarian5.webp", "/digital/vegetarian6.webp", "/digital/vegetarian7.webp", "/digital/vegetarian8.webp", "/digital/vegetarian9.webp", "/digital/vegetarian10.webp", "/digital/vegetarian11.webp", "/digital/vegetarian12.webp", "/digital/vegetarian13.webp", "/digital/vegetarian14.webp", "/digital/vegetarian15.webp"],
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    year: "2025",
    story: "In San Juan de la Vega, six families uphold a centuries-old vow after a silver merchant's prayer saved him from bandits on the Camino Real. They honor San Juanito with explosives, but when the state banned the rite for the first time, the town had other plans.",
    images: ["/digital/hammers.webp", "/digital/hammers2.webp", "/digital/hammers3.webp", "/digital/hammers4.webp", "/digital/hammers5.webp", "/digital/hammers6.webp", "/digital/hammers7.webp", "/digital/hammers8.webp", "/digital/hammers9.webp", "/digital/hammers10.webp", "/digital/hammers11.webp", "/digital/hammers12.webp", "/digital/hammers13.webp", "/digital/hammers14.webp", "/digital/hammers15.webp", "/digital/hammers16.webp", "/digital/hammers17.webp", "/digital/hammers18.webp", "/digital/hammers19.webp", "/digital/hammers20.webp", "/digital/hammers21.webp", "/digital/hammers22.webp", "/digital/hammers23.webp", "/digital/hammers24.webp", "/digital/hammers25.webp", "/digital/hammers26.webp", "/digital/hammers27.webp", "/digital/hammers28.webp", "/digital/hammers29.webp", "/digital/hammers30.webp", "/digital/hammers31.webp", "/digital/hammers32.webp", "/digital/hammers33.webp", "/digital/hammers34.webp", "/digital/hammers35.webp"],
    analogImages: [
      "/analog/hammers-analog.webp", "/analog/hammers-analog2.webp", "/analog/hammers-analog3.webp",
      "/analog/hammers-analog4.webp", "/analog/hammers-analog5.webp", "/analog/hammers-analog6.webp",
      "/analog/hammers-analog7.webp", "/analog/hammers-analog8.webp", "/analog/hammers-analog9.webp",
      "/analog/hammers-analog10.webp", "/analog/hammers-analog11.webp", "/analog/hammers-analog12.webp",
      "/analog/hammers-analog13.webp"
    ],
    stories: [
      {
        url: "https://extremerituals.substack.com/p/si-san-juanito-permite",
        title: "Si San Juanito Permite",
        author: "Mattia Astori & Daniele Colucci",
        external: true,
      },
    ],
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    year: "2025",
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

import AutoFullscreenVimeo from "../../components/AutoFullscreenVimeo";

export default async function EventPageRoute({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = EVENTS.find((e) => e.id === eventId);

  if (!event) {
    notFound();
  }

  // Standalone isolated page for unlisted documentary video
  if (eventId === 'soccorsovideo') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="w-full max-w-4xl space-y-8 text-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {event.title}
            </h1>
            <p className="text-zinc-300 text-base md:text-lg font-semibold tracking-widest mt-2">
              2026
            </p>
          </div>

          <AutoFullscreenVimeo
            vimeoId={event.vimeoId || '1214414319'}
            title={event.title}
          />
        </div>
      </main>
    );
  }

  const PUBLIC_EVENTS = EVENTS.filter((e) => e.id !== 'soccorsovideo');
  const currentIndex = PUBLIC_EVENTS.findIndex((e) => e.id === eventId);
  const nextEvent = PUBLIC_EVENTS[currentIndex >= 0 ? (currentIndex + 1) % PUBLIC_EVENTS.length : 0];
  const prevEvent = PUBLIC_EVENTS[currentIndex >= 0 ? (currentIndex === 0 ? PUBLIC_EVENTS.length - 1 : currentIndex - 1) : 0];

  // Preload only the hero image
  const preloadImages = [
    event.images[0], // Hero image only
  ].filter(Boolean);

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
