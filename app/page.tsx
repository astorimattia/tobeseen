"use client";
import React from "react";
import Hero from "./components/Hero";
import What from "./components/What";
import Material from "./components/Material";
import Team from "./components/Team";
import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import ImagePreloader from "./components/ImagePreloader";

export default function Page() {
  // Critical images to preload for main page
  const criticalImages = [
    "/digital/tultepec.webp",
    "/digital/vegetarian.webp", 
    "/digital/hammers.webp",
    "/digital/tinku.webp",
    "/daniele.png",
    "/mattia.png"
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Preload critical images */}
      <ImagePreloader images={criticalImages} priority={true} />
      
      <Hero />
      <What />
      <Material />
      <Team />
      <Contact />
      <Faq />
      <Footer />
    </main>
  );
}
