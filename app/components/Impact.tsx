import React from "react";
import Image from "next/image";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="transition-colors duration-300">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const RedditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="transition-colors duration-300">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM2.3 13.37C1.5 13.07 1 12.35 1 11.5c0-1.1.9-2 2-2 .64 0 1.22.32 1.6.82-1.1.85-1.92 1.9-2.3 3.05zm3.7.13c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9.8 4.8c-1.08.63-2.42.96-3.8.96-1.4 0-2.74-.34-3.8-.95-.24-.13-.32-.44-.2-.68.15-.24.46-.32.7-.18 1.83 1.06 4.76 1.06 6.6 0 .23-.13.53-.05.67.2.14.23.06.54-.18.67zm.2-2.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.7-2.13c-.38-1.16-1.2-2.2-2.3-3.05.38-.5.96-.82 1.6-.82 1.1 0 2 .9 2 2 0 .84-.53 1.57-1.3 1.87z" />
  </svg>
);

const UnsplashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="transition-colors duration-300">
    <path d="M7.5 6.75V0h9v6.75h-9zM7.5 11.25H0V24h24V11.25h-7.5v6.75h-9v-6.75z" />
  </svg>
);

const featured = [
  {
    name: "Wikipedia",
    href: "https://en.wikipedia.org",
    className: "font-serif text-xl md:text-2xl tracking-tight",
    logo: "/wikipedia.svg?v=2",
  },
  {
    name: "insta360",
    href: "https://www.insta360.com",
    className: "font-sans font-semibold text-lg md:text-xl tracking-tight",
    logo: "/insta360.svg?v=2",
  },
  {
    name: "All About Photo",
    href: "https://www.all-about-photo.com/all-about-photo-contest.php?cid=198",
    className: "font-sans font-light text-[0.7rem] md:text-xs tracking-[0.15em] md:tracking-[0.25em] uppercase",
    logo: "/aap-logo.webp",
  },
];

export default function Impact() {
  return (
    <section className="bg-black py-10 md:py-16 relative z-10 font-sans">
      <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-10 md:gap-14">

        {/* Views Counter (Top) */}
        <div className="text-center flex flex-col items-center w-full">
          <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter text-white mb-3">
            115,000,000<span className="text-white/40">+</span>
          </h2>
          <p className="text-xs md:text-sm text-white/50 font-light tracking-[0.2em] uppercase font-sans">
            Views Across Platforms
          </p>
        </div>

        {/* Unified Logos (Bottom) */}
        <div className="w-full flex flex-wrap items-center justify-center gap-10 md:gap-16 pt-4 md:pt-8">
          {/* Social Icons */}
          <div className="flex items-center gap-8 text-white/40">
            <InstagramIcon />
            <RedditIcon />
            <UnsplashIcon />
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10" />

          {/* Sponsor Logos */}
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {featured.map((item) => (
              <div
                key={item.name}
                className="text-white opacity-40 transition-opacity duration-300"
                aria-label={item.name}
              >
                {item.logo ? (
                  <div className="relative h-8 w-24 sm:w-32">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      fill
                      className="object-contain filter grayscale invert brightness-0 mix-blend-screen transition-all duration-300"
                    />
                  </div>
                ) : (
                  <span className={item.className}>{item.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
