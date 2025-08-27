import React from "react";
import SectionHeading from "./SectionHeading";

export default function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <SectionHeading eyebrow="Team" title="Two people. One mission." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="group rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-800">
            <img src="/team/daniele.jpg" alt="Daniele Colucci headshot" className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Daniele Colucci</h3>
          <p className="text-zinc-400">Co‑Creator · Photographer · Videomaker</p>
          <p className="mt-2 text-zinc-300">Earns trust fast. Finds the door no one else sees. (Add a short, credibility‑boosting line here.)</p>
        </article>
        <article className="group rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-800">
            <img src="/team/mattia.jpg" alt="Mattia Astori headshot" className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">Mattia Astori</h3>
          <p className="text-zinc-400">Co‑Creator · Producer · Photographer</p>
          <p className="mt-2 text-zinc-300">Turns chaos into access and story. Logistics whisperer. (Tighten/replace copy as needed.)</p>
        </article>
      </div>
    </section>
  );
}


