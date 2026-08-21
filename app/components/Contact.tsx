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
          rel="noopener"
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full max-w-md">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 w-full sm:max-w-xs md:max-w-sm rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input type="hidden" name="source" value="sacratos" />
            <button
              type="submit"
              className="w-full sm:w-auto font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer"
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
