"use client";

import React from "react";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Extreme Rituals"
          title="Photo essays and field notes"
          kicker="Deep dives into hidden rituals and extreme traditions worldwide by Mattia Astori and Daniele Colucci. Usually one or two posts a month, no fixed schedule."
        />
        
        <form
          action="https://extremerituals.substack.com/api/v1/free?nojs=true"
          method="post"
          target="_blank"
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
          <p className="text-xs text-zinc-500">via Substack</p>
        </form>
      </div>
    </section>
  );
}

