"use client";
import React from "react";
import { motion } from "framer-motion";

export default function WorldMapAnimation() {
  const dots = [
    { x: 300, y: 280 },
    { x: 600, y: 250 },
    { x: 950, y: 400 },
    { x: 1300, y: 350 },
    { x: 1550, y: 500 },
  ];

  return (
    <div className="relative mt-16 flex justify-center">
      <svg
        viewBox="0 0 1800 800"
        className="w-full max-w-6xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft glowing globe halo */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="900" cy="400" r="420" fill="url(#glow)" />

        {/* Animated arc */}
        <motion.path
          d="M300,280 C700,120 1200,700 1550,500"
          fill="none"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="6 10"
          animate={{ strokeDashoffset: [0, 80] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing dots */}
        {dots.map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="3.5"
            fill="white"
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{
              duration: 2 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
