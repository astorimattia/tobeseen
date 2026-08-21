"use client";

import React from "react";

export default function Contact() {
  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Extreme Rituals
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Photo essays and field notes by Mattia Astori and Daniele Colucci. Usually one or two a month, no fixed schedule.
        </p>
        <form
          action="https://extremerituals.substack.com/api/v1/free?nojs=true"
          method="post"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full"
        >
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="flex-1 w-full sm:max-w-xs rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
          <input type="hidden" name="source" value="sacratos" />
          <button
            type="submit"
            className="w-full sm:w-auto rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200"
          >
            Subscribe
          </button>
        </form>
        <p className="text-zinc-500 text-xs mt-3">on Substack</p>
      </div>
    </section>
  );
}


