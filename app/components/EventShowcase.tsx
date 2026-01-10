'use client';

import React, { useState, useCallback } from "react";
import Image from "next/image";
import FullScreenImageViewer from "./FullScreenImageViewer";
import { useImageFallback } from "../hooks/useImageFallback";

interface EventShowcaseProps {
  id: string;
  title: string;
  story: string;
  images: string[];
}

export default function EventShowcase({ id, title, story, images }: EventShowcaseProps) {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageFallbacks, setImageFallbacks] = useState<Set<number>>(new Set());

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsFullScreenOpen(true);
  }, []);

  const closeFullScreen = useCallback(() => {
    setIsFullScreenOpen(false);
  }, []);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index: number) => {
    // Try fallback if not already using it
    if (!imageFallbacks.has(index)) {
      setImageFallbacks(prev => new Set(prev).add(index));
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(index); // Remove error to retry with fallback
        return newSet;
      });
    } else {
      setImageErrors(prev => new Set(prev).add(index));
    }
  }, [imageFallbacks]);

  return (
    <>
      <article id={id} className="space-y-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-zinc-300 max-w-3xl">{story}</p>


        {/* Responsive photo grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => handleImageClick(i)}
              className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-zinc-800"
              aria-label={`View ${title} photo ${i + 1} in full screen`}
            >
              {/* Loading placeholder */}
              {!loadedImages.has(i) && !imageErrors.has(i) && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Error placeholder */}
              {imageErrors.has(i) && (
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                  <div className="text-zinc-500 text-sm">Failed to load</div>
                </div>
              )}

              {imageFallbacks.has(i) ? (
                <img
                  src={src}
                  alt={`${title} photo ${i + 1}`}
                  className={`${
                    // Specific positioning for certain images
                    (id === 'vegetarian' && (i === 6 || i === 10)) || // Vegetarian photos 7 and 11 (0-indexed)
                      (id === 'tultepec' && i === 2) // Feria Internacional photo 3 (0-indexed)
                      ? 'object-top'
                      : 'object-cover'
                    } group-hover:scale-105 transition-transform duration-300 w-full h-full ${loadedImages.has(i) ? 'opacity-100' : 'opacity-0'
                    }`}
                  style={{ position: 'absolute', inset: 0 }}
                  loading={i < 6 ? "eager" : "lazy"}
                  onLoad={() => handleImageLoad(i)}
                  onError={() => handleImageError(i)}
                />
              ) : (
                <Image
                  src={src}
                  alt={`${title} photo ${i + 1}`}
                  fill
                  className={`${
                    // Specific positioning for certain images
                    (id === 'vegetarian' && (i === 6 || i === 10)) || // Vegetarian photos 7 and 11 (0-indexed)
                      (id === 'tultepec' && i === 2) // Feria Internacional photo 3 (0-indexed)
                      ? 'object-top'
                      : 'object-cover'
                    } group-hover:scale-105 transition-transform duration-300 ${loadedImages.has(i) ? 'opacity-100' : 'opacity-0'
                    }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={85}
                  loading={i < 6 ? "eager" : "lazy"} // Load first 6 images eagerly, rest lazy
                  priority={i < 3} // Prioritize first 3 images
                  onLoad={() => handleImageLoad(i)}
                  onError={() => handleImageError(i)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              )}
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
