"use client";

import React from "react";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Stories and community"
          title="Subscribe on Substack"
        />
        <div className="mt-4 md:text-center">
          <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Documentary photography and writing on extreme rituals and the people who keep them alive. Field dispatches from Mexico, India, Bolivia, Thailand, southern Italy, and more.
          </p>
        </div>
        <div className="mt-8 w-full max-w-xl mx-auto">
          <iframe
            src="https://extremerituals.substack.com/embed"
            width="100%"
            height="180"
            style={{ border: '1px solid #EEE', background: 'white', borderRadius: '8px' }}
            frameBorder="0"
            scrolling="no"
          ></iframe>
        </div>
        <div className="mt-6 text-center">
          <a
            href="https://extremerituals.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 underline"
          >
            View the Sacratos publication →
          </a>
        </div>
      </div>
    </section>
  );
}


