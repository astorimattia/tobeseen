import React, { useMemo } from "react";

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-400 flex flex-wrap items-center justify-between gap-3">
        <div>© {year} Off‑Map Stories</div>
        <div className="flex items-center gap-3">
          <a className="hover:text-white" href="#what">What</a>
          <a className="hover:text-white" href="#material">Material</a>
          <a className="hover:text-white" href="#team">Team</a>
          <a className="hover:text-white" href="#contact">Contact</a>
          <a className="hover:text-white" href="#faq">FAQ</a>
        </div>
      </div>
    </footer>
  );
}


