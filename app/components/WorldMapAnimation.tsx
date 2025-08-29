"use client";

import React, { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function WorldMapAnimation() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const pointsData = [
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
  ];

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      setTick(t => (t + 1) % 1000000);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    let attachedCanvas: HTMLCanvasElement | null = null;
    let blockEvent: ((e: Event) => void) | null = null;
    let controls: any = null;
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
        controls.autoRotateSpeed = 1.2;
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
    <section className="relative h-screen w-full bg-black flex items-center justify-center">
      <Globe
        ref={globeRef}
        height={700}
        width={700}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={pointsData}
        pointAltitude={0.03}
        pointColor={() => "rgba(0,255,255,0.6)"}
        pointRadius={(d: any) => {
          const base = 0.45;
          const amp = 0.2;
          const speed = 0.04; // lower is slower
          return base + amp * (0.5 + 0.5 * Math.sin(tick * speed + (d?.phase || 0)));
        }}
      />
    </section>
  );
}