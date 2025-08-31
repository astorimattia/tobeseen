import React from "react";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section className="relative isolate h-screen">
      {/* Background video */}
      <div className="absolute inset-0 -z-10">
        {/* Fallback background */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/bg.webm"
          className="h-full w-full object-cover"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto h-full max-w-6xl px-4 grid grid-rows-[1fr_auto] items-center">
        {/* Main content area - perfectly centered */}
        <div className="flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="font-heading text-xl md:text-2xl leading-tight">
              some things deserve to be seen
            </h1>
          </div>
        </div>
        
        {/* Buttons area - positioned at bottom */}
        <div className="pb-22 md:pb-12 flex justify-center">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => scrollToSection('material')}
              className="font-heading rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 transition-colors duration-200 cursor-pointer"
            >
              See the work
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              Get in touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
