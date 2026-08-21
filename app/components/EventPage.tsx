'use client';

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FullScreenImageViewer from "./FullScreenImageViewer";
import EventNavigation from "./EventNavigation";
import SensitiveContentFilter from "./SensitiveContentFilter";

interface StoryLink {
  url: string;
  title: string;
  author?: string;
  external?: boolean; // true for external links (open in new tab)
}

interface Event {
  id: string;
  title: string;
  year?: string;
  story: string;
  images: string[];
  analogImages?: string[];
  mediumUrl?: string; // Optional field for Medium article URL (legacy)
  mediumTitle?: string; // Optional title for the Medium article (legacy)
  stories?: StoryLink[]; // New: multiple stories
  vimeoId?: string;
  videoUrl?: string;
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
  const [imageFallbacks, setImageFallbacks] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnalogMode, setIsAnalogMode] = useState(false);

  // Get current images based on toggle state
  const currentImages = isAnalogMode && event.analogImages ? event.analogImages : event.images;
  const hasAnalogImages = event.analogImages && event.analogImages.length > 0;

  // Reset selected image index when switching modes
  useEffect(() => {
    setSelectedImageIndex(0);
    setLoadedImages(new Set());
    setImageErrors(new Set());
    setImageFallbacks(new Set());
  }, [isAnalogMode]);

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

  // Sensitive content state
  const isSensitive = event.id === 'vegetarian';
  const [hasConsented, setHasConsented] = useState(!isSensitive);

  return (
    <>
      <div
        className="mx-auto max-w-6xl px-4 py-4 md:py-8"
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

        {/* Sensitive Content Warning Overlay */}
        {isSensitive && !hasConsented && (
          <div className="fixed inset-0 z-50 flex bg-black items-center justify-center">
            <SensitiveContentFilter onShowContent={() => setHasConsented(true)} />
          </div>
        )}

        {/* Event Content */}
        <article className="space-y-8 mt-4 md:mt-8">
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                {event.title}
              </h1>
              {event.year && (
                <span className="text-xl md:text-2xl text-zinc-500 font-medium whitespace-nowrap pt-1">
                  {event.year}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-zinc-300 max-w-4xl leading-relaxed">{event.story}</p>

            {/* Story Links - Quiet list design */}
            {(event.stories && event.stories.length > 0) ? (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Stories</div>
                <div className="space-y-3">
                  {event.stories.map((story, index) => (
                  <div key={index}>
                    <Link
                      href={story.url}
                      target={story.external ? "_blank" : undefined}
                      rel={story.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-baseline gap-2"
                    >
                      <span className="text-sm text-white group-hover:text-zinc-300 transition-colors">
                        {story.title}
                      </span>
                      <span className="text-sm text-zinc-500 flex-shrink-0">
                        {story.external ? '↗' : '→'}
                      </span>
                    </Link>
                    {story.author && (
                      <div className="text-xs text-zinc-500 mt-0.5">{story.author}</div>
                    )}
                  </div>
                ))}
                </div>
              </div>
            ) : event.mediumUrl ? (
              <div className="mt-6">
                <Link
                  href={`/work/${event.id}/story`}
                  className="group inline-flex items-baseline gap-2"
                >
                  <span className="text-sm text-white group-hover:text-zinc-300 transition-colors">
                    {event.mediumTitle || `Read more about ${event.title}`}
                  </span>
                  <span className="text-sm text-zinc-500 flex-shrink-0">→</span>
                </Link>
              </div>
            ) : null}

            {/* Embedded Vimeo Video Player */}
            {event.vimeoId && (
              <div className="mt-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl">
                  <iframe
                    src={`https://player.vimeo.com/video/${event.vimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${event.title} Vimeo Documentary`}
                  />
                </div>
              </div>
            )}

            {/* Digital/Analog Toggle */}
            {(hasAnalogImages || event.id === 'tinku' || event.id === 'tultepec') && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center bg-zinc-800/50 rounded-full p-1 border border-white/10">
                  <button
                    onClick={() => setIsAnalogMode(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${!isAnalogMode
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    Digital
                  </button>
                  <button
                    onClick={() => setIsAnalogMode(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${isAnalogMode
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    Analog
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hero Image */}
          {currentImages.length > 0 && (
            <div key={`hero-${isAnalogMode ? 'analog' : 'digital'}`} className="group relative w-full aspect-[4/3] md:aspect-[16/7] overflow-hidden bg-zinc-800 cursor-pointer" onClick={() => handleImageClick(0)}>
              {imageFallbacks.has(0) ? (
                <img
                  ref={el => {
                    if (el && el.complete && !loadedImages.has(0)) {
                      handleImageLoad(0);
                    }
                  }}
                  src={currentImages[0]}
                  alt={`${event.title} main photo`}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    objectPosition: event.id === 'mautkakuan' ? 'center 95%' : 'center center'
                  }}
                  onLoad={() => handleImageLoad(0)}
                  onError={() => handleImageError(0)}
                />
              ) : (
                <Image
                  src={currentImages[0]}
                  alt={`${event.title} main photo`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="100vw"
                  quality={85}
                  priority
                  onLoad={() => handleImageLoad(0)}
                  onError={() => handleImageError(0)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  style={{
                    objectPosition: event.id === 'mautkakuan' ? 'center 95%' : 'center center'
                  }}
                />
              )}
              {/* Loading placeholder */}
              {!loadedImages.has(0) && !imageErrors.has(0) && (
                <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              {/* Error placeholder */}
              {imageErrors.has(0) && (
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                  <div className="text-zinc-500 text-xs">Failed to load</div>
                </div>
              )}
            </div>
          )}

          {/* Photo Grid */}
          <div key={`grid-${isAnalogMode ? 'analog' : 'digital'}`} className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
            {currentImages.slice(1).map((src, i) => (
              <button
                key={`${isAnalogMode ? 'analog' : 'digital'}-${i}`}
                onClick={() => handleImageClick(i + 1)}
                className="relative aspect-[4/3] overflow-hidden group cursor-pointer bg-zinc-800"
                aria-label={`View ${event.title} photo ${i + 1} in full screen`}
              >
                {/* Loading placeholder */}
                {!loadedImages.has(i + 1) && !imageErrors.has(i + 1) && (
                  <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Error placeholder */}
                {imageErrors.has(i + 1) && (
                  <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                    <div className="text-zinc-500 text-xs">Failed to load</div>
                  </div>
                )}

                {imageFallbacks.has(i + 1) ? (
                  <img
                    src={src}
                    alt={`${event.title} photo ${i + 1}`}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full ${loadedImages.has(i + 1) ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      objectPosition: event.id === 'vegetarian' && i === 6 ? 'center top' :
                        event.id === 'vegetarian' && i === 10 ? 'center 25%' : 'center center'
                    }}
                    loading="lazy"
                    onLoad={() => handleImageLoad(i + 1)}
                    onError={() => handleImageError(i + 1)}
                  />
                ) : (
                  <Image
                    src={src}
                    alt={`${event.title} photo ${i + 1}`}
                    fill
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${loadedImages.has(i + 1) ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{
                      objectPosition: event.id === 'vegetarian' && i === 6 ? 'center top' :
                        event.id === 'vegetarian' && i === 10 ? 'center 25%' : 'center center'
                    }}
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    quality={75}
                    loading="lazy"
                    onLoad={() => handleImageLoad(i + 1)}
                    onError={() => handleImageError(i + 1)}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                )}
              </button>
            ))}
          </div>
        </article>
      </div>

      {/* Full screen image viewer */}
      <FullScreenImageViewer
        images={currentImages}
        initialIndex={selectedImageIndex}
        isOpen={isFullScreenOpen}
        onClose={closeFullScreen}
        title={event.title}
        mode={isAnalogMode ? 'analog' : 'digital'}
      />
    </>
  );
}
