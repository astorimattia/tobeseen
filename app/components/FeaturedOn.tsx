import React from "react";

const featured = [
  {
    name: "Wikipedia",
    href: "https://en.wikipedia.org",
    className: "font-serif text-xl md:text-2xl tracking-tight",
  },
  {
    name: "insta360",
    href: "https://www.insta360.com",
    className: "font-sans font-semibold text-lg md:text-xl tracking-tight",
  },
  {
    name: "All About Photo",
    href: "https://www.allaboutphoto.com",
    className: "font-sans font-light text-[0.65rem] md:text-xs tracking-[0.25em] uppercase",
  },
];

export default function FeaturedOn() {
  return (
    <section className="pt-4 pb-10 md:pt-4 md:pb-14">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div className="flex items-center justify-center gap-10 sm:gap-16">
          {featured.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white opacity-50 hover:opacity-80 transition-opacity duration-300"
              aria-label={item.name}
            >
              <span className={item.className}>{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
