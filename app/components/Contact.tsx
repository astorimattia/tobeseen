import React from "react";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Contact"
          title="Have a story tip or collaboration idea?"
        />
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
          <a
            href="mailto:mattiastori@gmail.com?subject=Story%20Tip%20/ %20Collaboration%20–%20Off‑Map%20Stories"
            className="rounded-xl bg-white text-black px-6 py-3 text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Email mattiastori@gmail.com
          </a>
          <span className="text-sm text-zinc-400">
            or DM if you have our number.
          </span>
        </div>
      </div>
    </section>
  );
}


