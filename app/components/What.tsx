import React from "react";
import SectionHeading from "./SectionHeading";
import WorldMapAnimation from "./WorldMapAnimation";

export default function What() {
  return (
    <section id="what" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <SectionHeading
        // eyebrow="What we do"
        title="the world is full of stories that will blow your mind."
        kicker="We travel to places that don’t show up on maps or Instagram feeds. We're after the kinds of moments you can’t Google, the ones whispered about by locals or hidden in plain sight, full of noise, chaos, beauty, and danger."
      />
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div> */}
    <WorldMapAnimation />
    <SectionHeading
        // eyebrow="What we do"
        title="this isn’t a polished travel show."
        kicker="We don’t book hotels. We don’t come with a crew. We carry one backpack and follow the trail of stories, sleeping wherever we’re welcomed, someone’s couch, a tent, the back of a truck. Our trips are built on word of mouth. Locals point us to someone who knows someone. That’s how we find the things no one talks about. And that’s how we keep our work real."
      />
    </section>
  );
}


