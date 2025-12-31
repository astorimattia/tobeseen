"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeading from "../components/SectionHeading";
import Footer from "../components/Footer";
import ImagePreloader from "../components/ImagePreloader";
import Contact from "../components/Contact";
import ExclusiveAccessModal from "../components/ExclusiveAccessModal";

export default function WorkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFallbacks, setImageFallbacks] = useState<Set<string>>(new Set());

const EVENTS = [
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
    documentaryDate: "2026",
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    story: "Spititual leaders pierce their skin with swords as they enter a trance. The festival is a nine-day celebration where participants believe they become vessels for the gods.",
    images: ["/digital/vegetarian.webp", "/digital/vegetarian2.webp", "/digital/vegetarian3.webp", "/digital/vegetarian4.webp", "/digital/vegetarian5.webp", "/digital/vegetarian6.webp", "/digital/vegetarian7.webp", "/digital/vegetarian8.webp", "/digital/vegetarian9.webp", "/digital/vegetarian10.webp", "/digital/vegetarian11.webp", "/digital/vegetarian12.webp", "/digital/vegetarian13.webp", "/digital/vegetarian14.webp", "/digital/vegetarian15.webp"],
    documentaryDate: "Late 2025",
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    story: "Hammers packed with explosives slam stone anvils, creating controlled chaos. The explosive force sends shrapnel flying through the air as participants test their luck and timing.",
    images: ["/digital/hammers.webp", "/digital/hammers2.webp", "/digital/hammers3.webp", "/digital/hammers4.webp", "/digital/hammers5.webp", "/digital/hammers6.webp", "/digital/hammers7.webp", "/digital/hammers8.webp", "/digital/hammers9.webp", "/digital/hammers10.webp", "/digital/hammers11.webp", "/digital/hammers12.webp", "/digital/hammers13.webp", "/digital/hammers14.webp", "/digital/hammers15.webp"],
    documentaryDate: "2026",
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
    documentaryDate: "2026",
  },
];

  // Preload first few images from each event for faster loading
  const preloadImages = [
    "/digital/tultepec.webp", "/digital/tultepec2.webp", "/digital/tultepec3.webp",
    "/digital/vegetarian.webp", "/digital/vegetarian2.webp", "/digital/vegetarian3.webp", 
    "/digital/hammers.webp", "/digital/hammers2.webp", "/digital/hammers3.webp",
    "/digital/tinku.webp", "/digital/tinku2.webp", "/digital/tinku3.webp"
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Preload critical images */}
      <ImagePreloader images={preloadImages} priority={true} />
      
      {/* Back navigation */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHeading
          title="A few windows into the chaos"
          kicker="Each story is a glimpse into traditions that defy logic and safety. Lived by locals, dangerous, chaotic, and unforgettable."
        />

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {EVENTS.map((event, index) => {
            const isComingSoon = event.documentaryDate === "Coming Soon";
            const CardContent = (
              <div
                key={event.id}
                className={`group block bg-zinc-900/50 rounded-2xl overflow-hidden transition-all duration-300 border border-white/10 ${isComingSoon ? "cursor-pointer" : "hover:bg-zinc-900/70 hover:border-white/20"}`}
                onClick={isComingSoon ? () => setIsModalOpen(true) : undefined}
              >
                {/* Event Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {imageFallbacks.has(event.id) ? (
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className={`object-cover w-full h-full ${isComingSoon ? "blur-md" : "group-hover:scale-105 transition-transform duration-500"}`}
                      style={{ position: 'absolute', inset: 0 }}
                      onError={() => {
                        if (!imageFallbacks.has(event.id)) {
                          setImageFallbacks(prev => new Set(prev).add(event.id));
                        }
                      }}
                    />
                  ) : (
                    <Image
                      src={event.images[0]}
                      alt={event.title}
                      fill
                      className={`object-cover ${isComingSoon ? "blur-md" : "group-hover:scale-105 transition-transform duration-500"}`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={85}
                      priority={index < 2}
                      onError={() => {
                        if (!imageFallbacks.has(event.id)) {
                          setImageFallbacks(prev => new Set(prev).add(event.id));
                        }
                      }}
                    />
                  )}
                  <div className={`absolute inset-0 ${isComingSoon ? 'bg-gradient-to-t from-[#FF9933]/60 via-[#FFFFFF]/60 to-[#138808]/60' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />
                  {isComingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl font-bold">
                      Coming Soon
                    </div>
                  )}

                </div>

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-white transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {event.story}
                  </p>
                  {!isComingSoon && event.documentaryDate && (
                    <p className="text-sm md:text-base text-zinc-500 italic mb-4">
                      🎬 Documentary coming {event.documentaryDate}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {!isComingSoon && (
                      <span className="text-xs text-zinc-500">
                        {event.images.length} photos
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 group-hover:text-white transition-colors">
                      <span>{isComingSoon ? 'Get exclusive access' : 'View event'}</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );

            return isComingSoon ? (
              CardContent
            ) : (
              <Link key={event.id} href={`/work/${event.id}`}>
                {CardContent}
              </Link>
            );
          })}
        </div>

      </section>

      {/* Subscribe CTA Section */}
      <Contact />
      <ExclusiveAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Footer />
    </main>
  );
}
