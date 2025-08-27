import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 px-6 text-center">
      <h2 className="text-2xl font-semibold">Not found</h2>
      <p className="text-sm text-zinc-400">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="mt-3 text-sm text-white/80 underline underline-offset-4">
        Go back home
      </a>
    </div>
  );
}


