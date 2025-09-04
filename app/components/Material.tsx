import React from "react";
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
    image: "/vegetarian8.webp",
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    subtitle:
      "Hammers packed with explosives slam stone anvils.",
    image: "/hammers2.webp",
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
    <section id="material" className="relative">
      <div className="relative w-full">
        <Carousel items={GALLERY} />
      </div>
    </section>
  );
}


