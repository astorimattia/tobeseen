"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  const go = (dir: number) => {
    setIndex((i) => (i + dir + count) % count);
    // Reset timer when manually navigating
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 3000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      go(1); // Next
    } else if (isRightSwipe) {
      go(-1); // Previous
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden bg-zinc-900">
      <div
        className="relative h-[calc(100vh-88px)] md:h-screen w-full"
        aria-roledescription="carousel"
        aria-label="Gallery"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
              className={`object-cover ${
                item.id === 'tultepec' ? 'object-[65%_center] md:object-center' :
                item.id === 'hammers' ? 'object-[35%_center] md:object-center' :
                item.id === 'vegetarian' ? 'object-[75%_center] md:object-center' :
                'object-center'
              }`}
              sizes="(max-width: 768px) 100vw, 100vw"
              quality={90}
              priority={i === index}
              loading={i === index ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <figcaption className="absolute inset-x-0 bottom-8 p-4 text-center">
              <div className="text-sm md:text-sm text-white font-medium">{item.title}</div>
              <div className="text-lg md:text-lg font-bold text-white">{item.subtitle}</div>
              <Link
                href={`/work/${item.id}`}
                className="mt-4 inline-block rounded-xl border border-white/20 px-3 py-1 text-sm hover:bg-white/10 transition relative z-20 pointer-events-auto"
              >
                View full story →
              </Link>
            </figcaption>
          </figure>
        ))}
        
        {/* Left click zone for previous slide */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full cursor-w-resize z-10"
          onClick={() => go(-1)}
          aria-label="Previous slide"
        />
        
        {/* Right click zone for next slide */}
        <div 
          className="absolute right-0 top-0 w-1/3 h-full cursor-e-resize z-10"
          onClick={() => go(1)}
          aria-label="Next slide"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
        <button
          aria-label="Previous"
          onClick={() => go(-1)}
          className="pointer-events-auto inline-flex h-12 w-12 md:h-10 md:w-10 items-center justify-center text-white hover:text-zinc-300 transition focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="md:w-5 md:h-5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button
          aria-label="Next"
          onClick={() => go(1)}
          className="pointer-events-auto inline-flex h-12 w-12 md:h-10 md:w-10 items-center justify-center text-white hover:text-zinc-300 transition focus:outline-none focus:ring-2 focus:ring-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="md:w-5 md:h-5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-14 pb-4">
        <div className="flex items-center justify-center gap-3 md:gap-2">
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
    </div>
  );
}


