'use client';

import React, { useState, useEffect } from 'react';

interface SoccorsoVideoPlayerProps {
  vimeoId: string;
  title: string;
  year?: string;
}

export default function SoccorsoVideoPlayer({ vimeoId, title, year }: SoccorsoVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) setIsPlaying(true);
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-center">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
          {title}
        </h1>
        {year && <p className="text-zinc-400 text-sm font-medium tracking-wide">{year}</p>}
      </div>

      {/* Main Video Container */}
      <div
        className={`${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-black p-2 md:p-6 flex flex-col justify-center items-center'
            : 'relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl group'
        }`}
      >
        {/* Fullscreen Close Button (when in fixed fullscreen mode) */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-zinc-900/90 text-white rounded-full text-xs font-semibold border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 shadow-xl cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit Fullscreen
            </button>
          </div>
        )}

        {/* Video Player or Big Play Cover */}
        {isPlaying ? (
          <div className="relative w-full h-full aspect-video">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=0&title=0&byline=0&portrait=0`}
              className="absolute inset-0 w-full h-full rounded-xl"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`${title} Vimeo Documentary`}
            />
          </div>
        ) : (
          <div
            onClick={handleStartPlay}
            className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center p-6 cursor-pointer group select-none"
          >
            {/* Ambient pulse glow behind Play button */}
            <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500 pointer-events-none" />

            {/* Large Easy Play Button */}
            <button
              type="button"
              onClick={handleStartPlay}
              aria-label="Play Video"
              className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
              <svg className="w-9 h-9 md:w-10 md:h-10 ml-1 fill-black" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            <span className="relative z-10 mt-4 text-sm font-semibold text-white tracking-wider uppercase">
              Play Documentary
            </span>
            <span className="relative z-10 text-xs text-zinc-400 mt-1">
              Tap to start video
            </span>
          </div>
        )}

        {/* Controls Overlay Bar for Easy Fullscreen Toggle */}
        {!isFullscreen && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-white/20 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-lg"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              {isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen (Mobile / iPhone)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
