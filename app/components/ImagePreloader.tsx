'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export default function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (!priority) return;

    // Preload critical images
    images.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      images.forEach((src) => {
        const existingLink = document.querySelector(`link[href="${src}"]`);
        if (existingLink) {
          document.head.removeChild(existingLink);
        }
      });
    };
  }, [images, priority]);

  return null;
}
