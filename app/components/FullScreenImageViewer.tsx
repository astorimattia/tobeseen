'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface FullScreenImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function FullScreenImageViewer({
  images,
  initialIndex,
  isOpen,
  onClose,
  title
}: FullScreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed h-screen inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] text-white hover:text-zinc-300 transition-colors"
        aria-label="Close full screen view"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 z-[10000] text-white">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-zinc-400">
          {currentIndex + 1} of {images.length}
        </p>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-[10000] text-white hover:text-zinc-300 transition-colors p-2"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-[10000] text-white hover:text-zinc-300 transition-colors p-2"
        aria-label="Next image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main image */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-full max-h-full">
          <Image
            src={images[currentIndex]}
            alt={`${title} photo ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Image counter dots */}
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[10001] flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
