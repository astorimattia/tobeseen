import React, { useMemo } from "react";

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-zinc-500">
        © {year} Sacratos
      </div>
    </footer>
  );
}
