"use client";

import React, { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function WorldMapAnimation() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  type PointDatum = { lat: number; lng: number; phase?: number };

  const pointsData: PointDatum[] = [
    // Tultepec, Mexico
    { lat: 19.685, lng: -99.129, phase: 0.0 },
    // Macha (San Pedro de Macha), Bolivia
    { lat: -18.92, lng: -66.67, phase: 1.3 },
    // San Juan de la Vega, Mexico
    { lat: 20.708, lng: -100.743, phase: 2.6 },
    // Phuket, Thailand
    { lat: 7.8804, lng: 98.3923, phase: 3.9 },
    // Additional points around the world
    // New York, USA
    { lat: 40.7128, lng: -74.0060, phase: 0.7 },
    // Paris, France
    { lat: 48.8566, lng: 2.3522, phase: 1.9 },
    // Nairobi, Kenya
    { lat: -1.2921, lng: 36.8219, phase: 2.9 },
    // Delhi, India
    { lat: 28.6139, lng: 77.2090, phase: 4.2 },
    // Sydney, Australia
    { lat: -33.8688, lng: 151.2093, phase: 5.1 },
    // Tokyo, Japan
    { lat: 35.6762, lng: 139.6503, phase: 0.3 },
    // Rio de Janeiro, Brazil
    { lat: -22.9068, lng: -43.1729, phase: 1.6 },
    // Cape Town, South Africa
    { lat: -33.9249, lng: 18.4241, phase: 2.8 },
    // Moscow, Russia
    { lat: 55.7558, lng: 37.6176, phase: 4.5 },
    // Vancouver, Canada
    { lat: 49.2827, lng: -123.1207, phase: 5.8 },
  ];

  const [tick, setTick] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Intersection Observer to detect when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before fully in view
      }
    );

    if (containerRef.current) {
      const currentContainer = containerRef.current;
      observer.observe(currentContainer);

      return () => {
        if (currentContainer) {
          observer.unobserve(currentContainer);
        }
      };
    }
    return () => {};
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      const containerWidth = Math.min(window.innerWidth - 32, 500); // Account for padding
      const size = isMobile ? containerWidth : 500;
      setDimensions({ width: size, height: size });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop - only runs when component is visible
  useEffect(() => {
    if (!isVisible) return;

    let rafId: number;
    const animate = () => {
      setTick(t => (t + 1) % 1000000);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible]);

  useEffect(() => {
    let attachedCanvas: HTMLCanvasElement | null = null;
    let blockEvent: ((e: Event) => void) | null = null;
    let controls: ReturnType<NonNullable<GlobeMethods["controls"]>> | null = null;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      const globe = globeRef.current;
      if (!globe) {
        requestAnimationFrame(init);
        return;
      }
      // renderer may not be ready immediately
      const renderer = globe.renderer?.();
      const domElement = renderer?.domElement as HTMLCanvasElement | undefined;
      if (!domElement) {
        requestAnimationFrame(init);
        return;
      }

      controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;
        controls.enableRotate = false;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.update?.();
      }

      attachedCanvas = domElement;
      // Allow page scroll (wheel/touch) but prevent drag interactions on the globe
      blockEvent = (e: Event) => {
        e.stopPropagation();
      };
      ["pointerdown", "pointermove", "pointerup", "contextmenu"].forEach(ev =>
        attachedCanvas!.addEventListener(ev, blockEvent!, { passive: true })
      );
    };

    init();

    return () => {
      cancelled = true;
      if (attachedCanvas && blockEvent) {
        ["pointerdown", "pointermove", "pointerup", "contextmenu"].forEach(ev =>
          attachedCanvas!.removeEventListener(ev, blockEvent as EventListener)
        );
      }
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Globe
          ref={globeRef}
          height={dimensions.height}
          width={dimensions.width}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={pointsData}
          pointAltitude={0.03}
          pointColor={() => "rgba(255, 0, 0, 0.6)"}
          pointRadius={(d: object) => {
            const datum = d as PointDatum;
            const base = 0.8;
            const amp = 0.2;
            const speed = 0.04; // lower is slower
            return base + amp * (0.5 + 0.5 * Math.sin(tick * speed + (datum?.phase || 0)));
          }}
          atmosphereColor="rgba(255, 255, 255, 0.6)"
          atmosphereAltitude={0.25}
        />
      </div>
    </section>
  );
}