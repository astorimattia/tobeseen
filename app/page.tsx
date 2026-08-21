import React from "react";
import Hero from "./components/Hero";
import Impact from "./components/Impact";
import What from "./components/What";
import Material from "./components/Material";
import Team from "./components/Team";
import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import ImagePreloader from "./components/ImagePreloader";

export const metadata = {
  title: "Sacratos - Stories of Raw Devotion",
  description: "Documentary photography capturing the world's most dangerous and hidden cultural events. From exploding hammers in Mexico to spirit mediums in Thailand.",
};

export default function Page() {
  const criticalImages = [
    "/digital/soccorso.webp",
    "/digital/tultepec.webp",
    "/digital/vegetarian.webp",
    "/digital/hammers.webp",
    "/digital/tinku.webp",
    "/daniele.png",
    "/mattia.png"
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* SEO-optimized static content for crawlers and agents */}
      <div className="sr-only">
        <h1>Sacratos - Documentary Photography of Extreme Cultural Events</h1>
        <h2>Stories of Raw Devotion</h2>
        <p>
          Sacratos is an independent documentary photography project capturing the world's most dangerous and hidden cultural events.
          Founded by Daniele Colucci and Mattia Astori, Sacratos documents extreme rituals and festivals that mainstream media rarely covers.
        </p>
        <h2>Featured Events</h2>
        <p>
          Our work includes coverage of the Feria Internacional de la Pirotecnia in Tultepec, Mexico, where 200 rocket-loaded bulls are thrown 
          against thousands of people. We've documented the Vegetarian Festival in Phuket, Thailand, where spirit mediums pierce their bodies 
          in trance states. In San Juan de la Vega, Mexico, we captured the tradition of exploding hammers, where participants slam explosive-packed 
          sledgehammers against stone anvils. In Bolivia, we filmed Tinku de Macha, a three-day ritual combat festival at 4,000 meters altitude. 
          In India, we documented the Maut Ka Kuan (Well of Death) motorcycle stunts and the Banni Festival, a sacred midnight battlefield.
        </p>
        <h2>Our Approach</h2>
        <p>
          We travel with minimal equipment—one backpack each, no production crew. We embed within communities for days or weeks, building trust 
          before documenting. Our stories are found through word of mouth and local contacts, not internet research. We sleep wherever we're welcomed: 
          a couch, a tent, the back of a truck. This immersive approach allows us to capture raw, authentic moments that reveal the beauty, chaos, 
          and truth of human devotion in its most extreme forms.
        </p>
        <h2>Recognition</h2>
        <p>
          Our work has reached 115 million views across Instagram, Reddit, Unsplash, and other platforms. We've been featured by Wikipedia, 
          sponsored by Insta360, and recognized by All About Photo. Sacratos represents a new form of cultural journalism—independent, 
          immersive, and uncompromising.
        </p>
      </div>

      {/* Preload critical images */}
      <ImagePreloader images={criticalImages} priority={true} />

      <Hero />
      <Impact />
      <What />
      <Material />
      <Team />
      <Contact />
      <Faq />
      <Footer />
    </main>
  );
}
