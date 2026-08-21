"use client";

import React from "react";
import SectionHeading from "./SectionHeading";
import { useState } from "react";

export default function Contact() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = () => {
    setIsSubscribed(true);
  };

  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Get exclusive access"
          title="Be the first to explore new work"
        />
        <div className="mt-4 md:text-center">
          <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Unlock behind the scenes content, early previews of upcoming projects, and deep dives into hidden rituals and extreme traditions worldwide. Join our community and stay ahead of the curve.
          </p>
        </div>
        {isSubscribed ? (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-white p-6 rounded-xl bg-green-600/20 border border-green-500/50">
            <p className="text-xl font-semibold mb-2">Thank you for subscribing!</p>
            <p className="text-zinc-300">You&apos;ll get photo essays and field notes on rituals that are vanishing — usually one or two a month, no fixed schedule.</p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            action="https://extremerituals.substack.com/api/v1/free?nojs=true"
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 mt-8 w-full max-w-xl mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="flex-1 w-full sm:max-w-xs md:max-w-sm rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
            <input type="hidden" name="source" value="sacratos" />
            <button
              type="submit"
              className="w-full sm:w-auto font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}


