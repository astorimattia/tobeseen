import React from "react";
import SectionHeading from "./SectionHeading";
import Carousel, { GalleryItem } from "./Carousel";

const GALLERY: GalleryItem[] = [
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    subtitle:
      "200 bulls loaded with rockets are thrown against thousands of people, 53 wounded.",
    image: "/tultepec.webp",
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    subtitle:
      "Spirit mediums pierce their skin to get rid of evil.",
    image: "/vegetarian.webp",
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    subtitle:
      "Hammers packed with explosives slam stone anvils.",
    image: "/hammers.webp",
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    subtitle:
      "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, the blood seals a harvest year.",
    image: "/tinku.webp",
  },
];

export default function Material() {
  return (
    <section id="material" className="mx-auto max-w-6xl px-4 py-8 md:py-16">
      <SectionHeading eyebrow="latest work" title="a few windows into the chaos." kicker="More coming soon." />
      <div className="mt-8 md:mt-12">
        <Carousel items={GALLERY} />
      </div>
    </section>
  );
}


