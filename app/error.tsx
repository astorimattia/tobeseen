"use client";
import React from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-zinc-400 max-w-md">
        {process.env.NODE_ENV === "development" ? error?.message : "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        Try again
      </button>
    </div>
  );
}


