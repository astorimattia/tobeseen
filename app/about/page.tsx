import React from "react";
import Link from "next/link";
import Footer from "../components/Footer";

export const metadata = {
  title: "About - Sacratos",
  description: "Learn about Sacratos, an independent documentary photography project capturing the world's most dangerous and hidden cultural events.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link 
          href="/" 
          className="inline-block mb-8 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">About Sacratos</h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-xl text-zinc-300 leading-relaxed mb-8">
            Stories of Raw Devotion
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Do</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Sacratos is an independent documentary photography project that captures the world's most dangerous and hidden cultural events. 
            We document extreme rituals and festivals that mainstream media rarely covers—from exploding hammers in Mexico to spirit mediums 
            in Thailand, from the Well of Death in India to ritual combat in Bolivia.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Our work has reached over 115 million views across Instagram, Reddit, Unsplash, and other platforms. We've been featured by 
            Wikipedia, sponsored by Insta360, and recognized by All About Photo. But numbers don't tell the full story.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Our Approach</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We travel with minimal equipment—one backpack each, no production crew, no hotels. We embed within communities for days or weeks, 
            building trust before documenting. Our stories are found through word of mouth and local contacts, not internet research. We sleep 
            wherever we're welcomed: a couch, a tent, the back of a truck.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            This immersive approach allows us to capture raw, authentic moments that reveal the beauty, chaos, and truth of human devotion 
            in its most extreme forms. We don't stage scenes or recreate events. We document what happens, as it happens.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Team</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            <strong>Daniele Colucci</strong> is a photographer and videomaker who co-created Sacratos. His work focuses on immersive 
            documentary storytelling from inside the world's most intense cultural events.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            <strong>Mattia Astori</strong> is a photographer, producer, and the founder of Astori Ventures, a private investment firm. 
            He co-created Sacratos to document stories that challenge assumptions about culture, tradition, and devotion.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Coverage</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We've documented the Feria Internacional de la Pirotecnia in Tultepec, Mexico, where 200 rocket-loaded bulls are thrown against 
            thousands of people. The Vegetarian Festival in Phuket, Thailand, where spirit mediums pierce their bodies in trance states. 
            The exploding hammers of San Juan de la Vega, Mexico. Tinku de Macha in Bolivia, a three-day ritual combat festival at 4,000 
            meters altitude. The Maut Ka Kuan (Well of Death) in India. The Banni Festival, a sacred midnight battlefield in India. And more.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Read Our Stories</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Long-form essays and photo stories are published on our <a href="https://extremerituals.substack.com" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">Extreme Rituals Substack</a>.
          </p>

          <div className="mt-16 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Contact us at <a href="mailto:mattia@sacratos.com" className="text-zinc-400 hover:text-white underline underline-offset-4">mattia@sacratos.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
