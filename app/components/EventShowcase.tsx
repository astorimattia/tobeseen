'use client';

import React, { useState } from "react";
import Image from "next/image";
import FullScreenImageViewer from "./FullScreenImageViewer";

interface EventShowcaseProps {
  id: string;
  title: string;
  story: string;
  images: string[];
  documentaryDate?: string;
}

export default function EventShowcase({ id, title, story, images, documentaryDate }: EventShowcaseProps) {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsFullScreenOpen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreenOpen(false);
  };

  return (
    <>
      <article id={id} className="space-y-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-zinc-300 max-w-3xl">{story}</p>
        {documentaryDate && (
          <p className="text-zinc-400 text-sm italic">
            🎬 Documentary coming {documentaryDate}
          </p>
        )}

        {/* Responsive photo grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => handleImageClick(i)}
              className="relative aspect-[4/3] overflow-hidden group cursor-pointer"
              aria-label={`View ${title} photo ${i + 1} in full screen`}
            >
              <Image
                src={src}
                alt={`${title} photo ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

            </button>
          ))}
        </div>
      </article>

      {/* Full screen image viewer */}
      <FullScreenImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isFullScreenOpen}
        onClose={closeFullScreen}
        title={title}
      />
    </>
  );
}
