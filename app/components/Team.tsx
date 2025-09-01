import React from "react";
import Image from "next/image";
import SectionHeading from "./SectionHeading";

export default function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <SectionHeading title="Two people, one mission." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="group rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-800 relative">
            <Image src="/daniele.png" alt="Daniele Colucci headshot" fill className="object-cover group-hover:scale-[1.02] transition" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">
            <a 
              href="https://danielecolucci.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 hover:text-zinc-300 transition-colors"
            >
              Daniele Colucci
              <svg className="w-4 h-4 opacity-60 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </h3>
          <p className="text-zinc-400">Co‑Creator · Photographer · Videomaker</p>
        </article>
        <article className="group rounded-2xl border border-white/10 bg-zinc-900/30 p-5">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-800 relative">
            <Image src="/mattia.png" alt="Mattia Astori headshot" fill className="object-cover group-hover:scale-[1.02] transition" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">
            <a 
              href="https://mattiaastori.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 hover:text-zinc-300 transition-colors"
            >
              Mattia Astori
              <svg className="w-4 h-4 opacity-60 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </h3>
          <p className="text-zinc-400">Co‑Creator · Producer · Photographer</p>
        </article>
      </div>
    </section>
  );
}


