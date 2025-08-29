import React from "react";
import SectionHeading from "./SectionHeading";
import WorldMapAnimation from "./WorldMapAnimation";

export default function What() {
  return (
    <section id="what" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
    {/* <WorldMapAnimation /> */}
      <SectionHeading
        eyebrow="What we do"
        title="Gritty, unfiltered journeys into rituals most people will never see."
        kicker="We venture into the chaos of forgotten festivals, capturing the raw pulse of humanity with just a backpack and unyielding curiosity. We film from our point of view, talk to the people at the center, and show what it feels like to be there—without putting you in danger."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="text-lg font-semibold">Off‑map hunts</h3>
          <p className="mt-2 text-zinc-300">We follow whispers—locals, rumors, radio chatter—to find the things you can’t Google.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="text-lg font-semibold">First‑person truth</h3>
          <p className="mt-2 text-zinc-300">No crew. No gloss. Just two backpacks and access earned on the ground.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <h3 className="text-lg font-semibold">Danger, managed</h3>
          <p className="mt-2 text-zinc-300">We work with locals, respect boundaries, and keep viewers safe while we get close.</p>
        </div>
      </div>
    <WorldMapAnimation />
    </section>
  );
}


