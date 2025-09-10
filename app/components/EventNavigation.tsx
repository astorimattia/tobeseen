'use client';

import React, { useState, useCallback } from "react";

interface EventNavigationProps {
  currentIndex: number;
  totalEvents: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function EventNavigation({ 
  currentIndex, 
  totalEvents, 
  onPrevious, 
  onNext 
}: EventNavigationProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance for a swipe
  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }
  }, [touchStart, touchEnd, onNext, onPrevious]);

  return (
    <div 
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation buttons */}
      <div className="flex items-center justify-between p-2 md:p-0">
        <button
          onClick={onPrevious}
          className="group flex items-center justify-center gap-1 px-3 py-2 md:px-4 md:py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 w-[50px] sm:w-[130px]"
          aria-label="Previous event"
        >
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-2xs md:text-xs font-medium hidden sm:inline">Prev</span>
        </button>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          <div className="flex gap-0.5 md:gap-1">
            {Array.from({ length: totalEvents }, (_, i) => (
              <div
                key={i}
                className={`h-1 w-4 md:w-6 rounded-full transition-all duration-300 ${
                  i === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onNext}
          className="group flex items-center justify-center gap-1 px-3 py-2 md:px-4 md:py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 w-[50px] sm:w-[130px]"
          aria-label="Next event"
        >
          <span className="text-2xs md:text-xs font-medium hidden sm:inline">Next</span>
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
}
