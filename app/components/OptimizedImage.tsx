'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  quality = 85,
  priority = false,
  loading = 'lazy',
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

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
        rootMargin: '50px', // Start loading 50px before the image comes into view
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
    // If Next.js Image fails, try fallback to regular img tag
    if (!useFallback) {
      setUseFallback(true);
      setHasError(false); // Reset error to try fallback
    } else {
      setHasError(true);
      onError?.();
    }
  }, [onError, useFallback]);

  // Get the direct image URL (remove Next.js optimization if present)
  const getFallbackSrc = useCallback(() => {
    // If src is already a direct path, use it as-is
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }
    return src;
  }, [src]);

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
        <>
          {useFallback ? (
            // Fallback to regular img tag if Next.js Image optimization fails
            <img
              src={getFallbackSrc()}
              alt={alt}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${fill ? 'w-full h-full object-cover' : ''}`}
              style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
              loading={loading}
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill={fill}
              width={width}
              height={height}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes={sizes}
              quality={quality}
              priority={priority}
              loading={loading}
              onLoad={handleLoad}
              onError={handleError}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
            />
          )}
        </>
      )}
    </div>
  );
}
