import React from "react";
import Image from "next/image";

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
    href: "https://www.all-about-photo.com/all-about-photo-contest.php?cid=198",
    className: "font-sans font-light text-[0.7rem] md:text-xs tracking-[0.15em] md:tracking-[0.25em] uppercase",
    logo: "/aap-logo.webp",
  },
];

export default function FeaturedOn() {
  return (
    <section className="pt-4 pb-10 md:pt-4 md:pb-14">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div className="flex items-center justify-center gap-6 sm:gap-16">
          {featured.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white opacity-50 hover:opacity-80 transition-opacity duration-300"
              aria-label={item.name}
            >
              {item.logo ? (
                <div className="relative h-8 w-24 sm:w-32">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    fill
                    className="object-contain filter grayscale invert brightness-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              ) : (
                <span className={item.className}>{item.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
