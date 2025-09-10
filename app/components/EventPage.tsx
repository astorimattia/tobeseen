'use client';

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FullScreenImageViewer from "./FullScreenImageViewer";
import EventNavigation from "./EventNavigation";

interface Event {
  id: string;
  title: string;
  story: string;
  images: string[];
  documentaryDate?: string;
}

interface EventPageProps {
  event: Event;
  currentIndex: number;
  totalEvents: number;
  nextEventId: string;
  prevEventId: string;
}

export default function EventPage({ 
  event, 
  currentIndex, 
  totalEvents, 
  nextEventId, 
  prevEventId 
}: EventPageProps) {
  const router = useRouter();
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
    setImageErrors(prev => new Set(prev).add(index));
  }, []);

  const navigateToEvent = useCallback((eventId: string) => {
    router.push(`/work/${eventId}`);
  }, [router]);

  // Touch event handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isFullScreenOpen) return; // Don't navigate when fullscreen is open
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [isFullScreenOpen]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isFullScreenOpen) return; // Don't navigate when fullscreen is open
    setTouchEnd(e.targetTouches[0].clientX);
  }, [isFullScreenOpen]);

  const handleTouchEnd = useCallback(() => {
    if (isFullScreenOpen) return; // Don't navigate when fullscreen is open
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateToEvent(nextEventId);
    } else if (isRightSwipe) {
      navigateToEvent(prevEventId);
    }
  }, [touchStart, touchEnd, navigateToEvent, nextEventId, prevEventId, isFullScreenOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullScreenOpen) return; // Don't navigate when fullscreen is open
      
      if (e.key === 'ArrowLeft') {
        navigateToEvent(prevEventId);
      } else if (e.key === 'ArrowRight') {
        navigateToEvent(nextEventId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToEvent, prevEventId, nextEventId, isFullScreenOpen]);

  return (
    <>
      <div 
        className="mx-auto max-w-6xl px-4 py-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Event Navigation */}
        <EventNavigation
          currentIndex={currentIndex}
          totalEvents={totalEvents}
          onPrevious={() => navigateToEvent(prevEventId)}
          onNext={() => navigateToEvent(nextEventId)}
        />

        {/* Event Content */}
        <article className="space-y-8 mt-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{event.title}</h1>
            <p className="text-xl text-zinc-300 max-w-4xl leading-relaxed">{event.story}</p>
            {event.documentaryDate && (
              <p className="text-zinc-400 text-lg italic">
                🎬 Documentary coming {event.documentaryDate}
              </p>
            )}
          </div>


          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.images.map((src, i) => (
              <button
                key={i}
                onClick={() => handleImageClick(i)}
                className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-zinc-800"
                aria-label={`View ${event.title} photo ${i + 1} in full screen`}
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

                <Image
                  src={src}
                  alt={`${event.title} photo ${i + 1}`}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    loadedImages.has(i) ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    objectPosition: event.id === 'vegetarian' && i === 6 ? 'center top' : 
                                   event.id === 'vegetarian' && i === 10 ? 'center 25%' : 'center center'
                  }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={85}
                  loading={i < 8 ? "eager" : "lazy"} // Load first 8 images eagerly, rest lazy
                  priority={i < 4} // Prioritize first 4 images
                  onLoad={() => handleImageLoad(i)}
                  onError={() => handleImageError(i)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </button>
            ))}
          </div>
        </article>
      </div>

      {/* Full screen image viewer */}
      <FullScreenImageViewer
        images={event.images}
        initialIndex={selectedImageIndex}
        isOpen={isFullScreenOpen}
        onClose={closeFullScreen}
        title={event.title}
      />
    </>
  );
}
