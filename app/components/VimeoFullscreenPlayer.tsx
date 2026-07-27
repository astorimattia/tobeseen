'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VimeoFullscreenPlayerProps {
  vimeoId: string;
  title: string;
}

interface VimeoPlayerInstance {
  on: (event: string, callback: (data: unknown) => void) => void;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
}

declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLIFrameElement | string, options?: Record<string, unknown>) => VimeoPlayerInstance;
    };
  }
}

export default function VimeoFullscreenPlayer({ vimeoId, title }: VimeoFullscreenPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Dynamically load Vimeo Player API script if not present
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (window.Vimeo && window.Vimeo.Player) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    let vimeoPlayer: VimeoPlayerInstance | null = null;

    loadScript().then(() => {
      if (iframeRef.current && window.Vimeo) {
        try {
          vimeoPlayer = new window.Vimeo.Player(iframeRef.current);

          // When video starts playing, automatically trigger fullscreen!
          vimeoPlayer.on('play', () => {
            setIsExpanded(true);
            if (vimeoPlayer && vimeoPlayer.requestFullscreen) {
              vimeoPlayer.requestFullscreen().catch(() => {
                // Browser prevented native fullscreen API; CSS fallback is active
              });
            }
          });

          vimeoPlayer.on('pause', () => {
            // Optional pause handler
          });

          vimeoPlayer.on('ended', () => {
            setIsExpanded(false);
          });
        } catch (err) {
          console.error('Vimeo player init error:', err);
        }
      }
    });
  }, [vimeoId]);

  return (
    <div
      className={`${
        isExpanded
          ? 'fixed inset-0 z-50 bg-black p-0 md:p-4 flex flex-col items-center justify-center'
          : 'relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl'
      }`}
    >
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-zinc-900/90 text-white rounded-full text-xs font-semibold border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 shadow-2xl cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Fullscreen
        </button>
      )}

      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0`}
        className="w-full h-full rounded-xl"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`${title} Vimeo Documentary`}
      />
    </div>
  );
}
