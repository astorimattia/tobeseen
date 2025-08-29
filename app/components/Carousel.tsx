"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export default function Carousel({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/5">
      <div
        className="relative h-[56vw] max-h-[520px] w-full"
        aria-roledescription="carousel"
        aria-label="Gallery"
      >
        {items.map((item, i) => (
          <figure
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === index}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="text-sm text-zinc-300">{item.title}</div>
              <div className="text-base md:text-lg font-medium text-zinc-100">{item.subtitle}</div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-white"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-white"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}


