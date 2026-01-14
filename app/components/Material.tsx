import React from "react";
import Link from "next/link";
import Carousel, { GalleryItem } from "./Carousel";

const GALLERY: GalleryItem[] = [
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    subtitle:
      "200 bulls loaded with rockets are thrown against thousands of people, 53 wounded.",
    image: "/digital/tultepec.webp",
  },
  {
    id: "banni",
    title: "Banni Festival, India",
    subtitle:
      "A midnight battlefield where bloodshed is considered a sacred offering.",
    image: "/digital/banni.webp",
  },
  {
    id: "mautkakuan",
    title: "Maut Ka Kuan, India",
    subtitle:
      "Riding motorcycles on vertical wooden walls in the 'Well of Death'.",
    image: "/digital/mautkakuan.webp",
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    subtitle:
      "Spirit mediums pierce their skin to get rid of evil.",
    image: "/digital/vegetarian.webp",
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    subtitle:
      "Hammers packed with explosives slam stone anvils.",
    image: "/digital/hammers.webp",
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    subtitle:
      "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, the blood seals a harvest year.",
    image: "/digital/tinku.webp",
  },
];

export default function Material() {
  return (
    <section id="material" className="relative">
      <div className="relative w-full">
        <Carousel items={GALLERY} />

        {/* View All CTA */}
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-800 to-black py-16 px-4 overflow-hidden">
          {/* Subtle background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Content container with subtle border */}
            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 text-center">
              {/* Decorative top border */}
              <p className="text-zinc-300 text-base md:text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
                Discover the full collection of our work and the stories behind each project
              </p>

              <div className="flex justify-center">
                <Link
                  href="/work#stories"
                  className="group relative inline-flex items-center justify-center px-6 py-3 bg-white text-black font-heading text-sm font-medium rounded-xl hover:bg-zinc-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  <span className="relative z-10">
                    <span className="sm:hidden">Browse all work</span>
                    <span className="hidden sm:inline">Browse all work & stories</span>
                  </span>
                  <svg
                    className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


