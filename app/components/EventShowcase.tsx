import React from "react";
import Image from "next/image";

interface EventShowcaseProps {
  id: string;
  title: string;
  story: string;
  images: string[];
  comingSoon?: boolean;
}

export default function EventShowcase({ id, title, story, images, comingSoon }: EventShowcaseProps) {
  return (
    <article id={id} className="space-y-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-zinc-300 max-w-3xl">{story}</p>

      {/* Responsive photo grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={src}
              alt={`${title} photo ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>

      {comingSoon && (
        <p className="italic text-zinc-400">
          🎥 Documentary version coming 2026
        </p>
      )}
    </article>
  );
}
