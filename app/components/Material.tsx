import React from "react";
import SectionHeading from "./SectionHeading";
import Carousel, { GalleryItem } from "./Carousel";

const GALLERY: GalleryItem[] = [
  {
    id: "tultepec",
    title: "Tultepec – Feria Internacional de la Pirotecnia, Mexico",
    subtitle:
      "200 rocket‑loaded bulls charge crowds. Explosions everywhere. 85 deaths tied to pyrotechnics since 2016, yet the ritual thrives.",
    image: "/gallery/tultepec.jpg",
  },
  {
    id: "ma-song",
    title: "Ma Song – Vegetarian Festival, Thailand",
    subtitle:
      "Spirit mediums pierce their skin to banish evil. A practice traced to 1825 during fever outbreaks.",
    image: "/gallery/masong.jpg",
  },
  {
    id: "exploding-hammers",
    title: "Exploding Hammers, Mexico",
    subtitle:
      "Hammers packed with explosives slam stone anvils. Roots in 17th‑century legend. 58 injured in 2025.",
    image: "/gallery/exploding-hammers.jpg",
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    subtitle:
      "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, the blood seals a harvest year.",
    image: "/gallery/tinku.jpg",
  },
];

export default function Material() {
  return (
    <section id="material" className="mx-auto max-w-6xl px-4 pb-8 md:pb-16">
      <SectionHeading eyebrow="Material" title="A few windows into the chaos." kicker="More coming soon." />
      <Carousel items={GALLERY} />
    </section>
  );
}


