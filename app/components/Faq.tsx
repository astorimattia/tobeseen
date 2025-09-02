import React from "react";
import SectionHeading from "./SectionHeading";

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 pb-24">
      <SectionHeading eyebrow="FAQ" title="For a bit more context" />
      <div className="space-y-3">
        <details className="group rounded-xl bg-zinc-900/30 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium">
            <span>Why are you doing this?</span>
            <span className="transition group-open:rotate-180" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </summary>
          <p className="mt-3 text-zinc-300">
          To capture humanity where it’s most raw and ambiguous. Not to give answers, but to raise questions. Real stories come from people’s mouths, and we want to let them speak. Our hope is that you walk away wondering why, just as a devotee explains why they do what they do. Photos show the spark. Stories reveal the soul.
          </p>
        </details>

        <details className="group rounded-xl bg-zinc-900/30 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium">
            <span>Why only photos for now?</span>
            <span className="transition group-open:rotate-180" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </summary>
          <p className="mt-3 text-zinc-300">This started as a photo project. Trip after trip, our followers asked to see more, pushing us to evolve it into a fuller story, documentaries we are now making. Photos remain the fast lane to share the journey as we build the long form.</p>
        </details>

        <details className="group rounded-xl bg-zinc-900/30 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium">
            <span>Partnerships / funding</span>
            <span className="transition group-open:rotate-180" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </summary>
          <p className="mt-3 text-zinc-300">Get in touch to discuss partnerships, commissions, or platforms. We’re open to smart collaboration.</p>
        </details>
      </div>
    </section>
  );
}


