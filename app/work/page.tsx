import React from "react";
import Link from "next/link";
import SectionHeading from "../components/SectionHeading";
import EventShowcase from "../components/EventShowcase";

const EVENTS = [
  {
    id: "tultepec",
    title: "Feria Internacional de la Pirotecnia, Mexico",
    story: "Every year, 200 bulls loaded with fireworks are released into crowds. The streets become a chaotic battlefield where fire and flesh collide. Spectators run for their lives as rockets explode around them, creating a spectacle that's both terrifying and mesmerizing. This isn't entertainment - it's a tradition that tests the limits of human courage and the power of fire.",
    images: ["/tultepec.webp"], // Add more images as they become available
    comingSoon: true,
  },
  {
    id: "vegetarian",
    title: "Vegetarian Festival, Thailand",
    story: "Mediums pierce their cheeks with swords as they enter a trance. The festival is a nine-day celebration where participants believe they become vessels for the gods. The piercing rituals are meant to demonstrate the power of faith over pain, as participants walk through the streets with various objects protruding from their bodies. It's a display of spiritual devotion that challenges our understanding of human endurance.",
    images: ["/vegetarian.webp"], // Add more images as they become available
    comingSoon: true,
  },
  {
    id: "hammers",
    title: "Exploding Hammers, Mexico",
    story: "Hammers packed with explosives slam stone anvils, creating controlled chaos in the name of tradition. The explosive force sends shrapnel flying through the air as participants test their luck and timing. This dangerous ritual combines craftsmanship with pyrotechnics, creating a spectacle that's as much about skill as it is about survival.",
    images: ["/hammers.webp"], // Add more images as they become available
    comingSoon: true,
  },
  {
    id: "tinku",
    title: "Tinku de Macha, Bolivia",
    story: "Day 1: Dance. Day 2: Fight. Day 3: Mourn. At 4,000m, the blood seals a harvest year. This ancient ritual involves ritual combat where participants fight until they draw blood, believing that the spilled blood ensures a good harvest. The thin air at high altitude makes every movement a struggle, adding to the intensity of the ritual combat.",
    images: ["/tinku.webp"], // Add more images as they become available
    comingSoon: true,
  },
];

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-black text-white">
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

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="The Work"
          title="Hidden festivals and extreme rituals"
          kicker="Each story is a glimpse into traditions that defy logic and safety. These aren't tourist events — they're lived by locals, dangerous, chaotic, and unforgettable. A documentary is coming in 2026."
        />

        <div className="space-y-16 mt-12">
          {EVENTS.map((event) => (
            <EventShowcase key={event.id} {...event} />
          ))}
        </div>
      </section>
    </main>
  );
}
