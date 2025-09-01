import React from "react";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">Off‑Map Stories</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-zinc-300">
          <a href="#what" className="hover:text-white">What</a>
          <a href="#material" className="hover:text-white">Material</a>
          <a href="/work" className="hover:text-white">Work</a>
          <a href="#team" className="hover:text-white">Team</a>
          <a href="#contact" className="hover:text-white">Contact</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </div>
      </div>
    </nav>
  );
}


