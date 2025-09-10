"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeading from "../components/SectionHeading";
import Footer from "../components/Footer";
import ImagePreloader from "../components/ImagePreloader";
import Contact from "../components/Contact";
import ExclusiveAccessModal from "../components/ExclusiveAccessModal";

const EVENTS = [
  {
    id: "bastar-dussera",
    title: "Bastar Dusserha, India",
    story: "One of the longest festivals in the world (75 days), Bastar Dusserha is a unique celebration of Goddess Danteshwari, involving rituals, processions, and tribal traditions.",
    images: ["/tultepec.webp"],
    documentaryDate: "Coming Soon",
  },
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

export default function WorkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Preload first few images from each event for faster loading
  const preloadImages = [
    "/tultepec.webp", "/tultepec2.webp", "/tultepec3.webp",
    "/vegetarian.webp", "/vegetarian2.webp", "/vegetarian3.webp", 
    "/hammers.webp", "/hammers2.webp", "/hammers3.webp",
    "/tinku.webp", "/tinku2.webp", "/tinku3.webp"
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
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition"
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
                className={`group block bg-zinc-900/50 rounded-2xl overflow-hidden transition-all duration-300 border border-white/10 ${isComingSoon ? "cursor-pointer" : "hover:bg-zinc-900/70 hover:border-white/20"}`}
                onClick={isComingSoon ? () => setIsModalOpen(true) : undefined}
              >
                {/* Event Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className={`object-cover ${isComingSoon ? "blur-md" : "group-hover:scale-105 transition-transform duration-500"}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={85}
                    priority={index < 2}
                  />
                  <div className={`absolute inset-0 ${isComingSoon ? 'bg-gradient-to-t from-[#FF9933]/60 via-[#FFFFFF]/60 to-[#138808]/60' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />
                  {isComingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xl font-bold">
                      Coming Soon
                    </div>
                  )}

                  {/* Event number */}
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full w-6 h-6 md:w-10 md:h-10 flex items-center justify-center text-3xs md:text-xs font-bold">
                    {index + 1}
                  </div>
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
