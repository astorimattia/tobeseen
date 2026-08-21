import React from "react";
import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found | Sacratos",
  description: "This page doesn't exist. Check our sitemap or agent instructions for available content.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">404 - Page Not Found</h1>
      <p className="text-zinc-400 max-w-md">
        The page you're looking for doesn't exist.
      </p>
      
      <div className="mt-6 flex flex-col gap-3 text-sm">
        <Link 
          href="/" 
          className="text-white/80 hover:text-white underline underline-offset-4"
        >
          Go back home
        </Link>
        <Link 
          href="/sitemap.xml" 
          className="text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
        >
          View sitemap
        </Link>
        <Link 
          href="/llms.txt" 
          className="text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
        >
          Agent instructions (llms.txt)
        </Link>
      </div>

      <pre className="mt-8 text-left text-xs text-zinc-600 bg-zinc-900 p-4 rounded border border-zinc-800 max-w-lg overflow-x-auto hidden md:block">
{`# Page not found

Try these resources:
- Sitemap: https://sacratos.com/sitemap.xml
- AI agent instructions: https://sacratos.com/llms.txt
- Homepage: https://sacratos.com/`}
      </pre>
    </div>
  );
}
