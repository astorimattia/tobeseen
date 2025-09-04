'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
}

export default function ResponsiveImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  quality = 85,
  priority = false,
  loading = 'lazy',
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==",
  sizes
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    const extension = baseSrc.split('.').pop();
    
    // Check if optimized versions exist
    const optimizedVersions = [
      { suffix: '_sm', width: 640 },
      { suffix: '_md', width: 1024 },
      { suffix: '_lg', width: 1920 },
      { suffix: '_xl', width: 2560 }
    ];

    return optimizedVersions
      .map(({ suffix, width }) => {
        const optimizedPath = `/optimized${baseName}${suffix}.webp`;
        return `${optimizedPath} ${width}w`;
      })
      .join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Default sizes if not provided
  const defaultSizes = sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Failed to load</div>
        </div>
      )}

      {/* Only render image when in view */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  );
}
