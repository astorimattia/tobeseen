"use client";
import React from "react";
// import Nav from "./components/Nav";
import Hero from "./components/Hero";
import What from "./components/What";
import Material from "./components/Material";
import Team from "./components/Team";
import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* <Nav /> */}
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
