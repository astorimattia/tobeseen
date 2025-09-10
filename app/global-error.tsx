"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <h2 className="text-2xl font-semibold">Application error</h2>
          <p className="text-sm text-zinc-600 max-w-md">
            {process.env.NODE_ENV === "development" ? error?.message : "Please try again later."}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-xl bg-black/10 px-4 py-2 text-sm font-medium hover:bg-black/20"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}


