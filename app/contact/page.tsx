import React from "react";
import Link from "next/link";
import Footer from "../components/Footer";

export const metadata = {
  title: "Contact - Sacratos",
  description: "Get in touch with Sacratos for inquiries about documentary photography, licensing, collaborations, or press.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link 
          href="/" 
          className="inline-block mb-8 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Contact</h1>
        
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-xl text-zinc-300 leading-relaxed mb-8">
            Get in touch with us about documentary photography, licensing, collaborations, or press inquiries.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Email</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            For all inquiries, please contact us at <a href="mailto:mattia@sacratos.com" className="text-white underline underline-offset-4">mattia@sacratos.com</a>
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We typically respond within 2-3 business days. For urgent media inquiries, please indicate this in your subject line.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Do</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Sacratos specializes in immersive documentary photography of extreme and hidden cultural events worldwide. We work on long-term 
            projects that require deep community trust and firsthand access to events that mainstream media rarely covers.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Licensing & Usage</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            If you're interested in licensing our photography for editorial, academic, or commercial use, please reach out with details 
            about your project. We're happy to discuss usage rights, attribution requirements, and pricing.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            All our work is copyrighted and requires proper licensing for use. Unauthorized use is prohibited. When referencing our work, 
            please attribute to "Sacratos" or "Daniele Colucci and Mattia Astori for Sacratos."
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Collaborations</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            We occasionally collaborate with publications, museums, cultural organizations, and fellow documentarians on projects that 
            align with our mission. If you have a project proposal, send us an email with details about your organization, the scope 
            of the collaboration, and timeline.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Press & Media</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            For press inquiries, interviews, or media coverage, contact us directly. We're based in Europe and available for interviews 
            via video call or email. High-resolution press images can be provided upon request.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Our work has been featured by Wikipedia, Insta360, and All About Photo, and has reached over 115 million views across platforms.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Connect</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            Follow our work on <a href="https://instagram.com/sacratos" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">Instagram @sacratos</a> and <a href="https://twitter.com/sacratos" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">Twitter @sacratos</a>. Read our long-form stories on <a href="https://extremerituals.substack.com" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">Extreme Rituals</a> on Substack.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Team</h2>
          <p className="text-zinc-300 leading-relaxed mb-6">
            <strong>Daniele Colucci</strong> — Co-Creator, Photographer, Videomaker<br />
            Website: <a href="https://danielecolucci.com" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">danielecolucci.com</a>
          </p>
          <p className="text-zinc-300 leading-relaxed mb-6">
            <strong>Mattia Astori</strong> — Co-Creator, Producer, Photographer<br />
            Website: <a href="https://mattiaastori.com" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">mattiaastori.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
