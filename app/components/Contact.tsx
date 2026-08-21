"use client";

import React from "react";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Extreme Rituals"
          title="Photo essays and field notes on Substack"
        />
        <div className="mt-4 md:text-center">
          <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Subscribe to Sacratos on Substack for photo essays and field notes from the edge. Deep dives into hidden rituals and extreme traditions worldwide by Mattia Astori and Daniele Colucci. Usually one or two posts a month, no fixed schedule.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <iframe
            src="https://extremerituals.substack.com/embed"
            width="100%"
            height="320"
            style={{ 
              border: '1px solid #333', 
              background: 'white', 
              borderRadius: '12px',
              maxWidth: '480px'
            }}
            frameBorder="0"
            scrolling="no"
            title="Subscribe to Sacratos on Substack"
          />
        </div>
      </div>
    </section>
  );
}


