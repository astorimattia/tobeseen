import React from "react";

export default function WorldMapAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* World outline, simplified */}
        <path
          d="M20,180 Q60,100 140,120 Q220,140 300,100 Q380,60 460,120 Q540,180 620,140 Q700,100 780,180"
          stroke="url(#glow)"
          strokeWidth="2"
          fill="transparent"
        >
          <animate
            attributeName="stroke-dasharray"
            from="0,1000"
            to="1000,0"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>

        {/* Random glowing dots that animate across the world */}
        {Array.from({ length: 12 }).map((_, i) => (
          <circle
            key={i}
            cx={Math.random() * 800}
            cy={Math.random() * 400}
            r={2 + Math.random() * 2}
            fill="white"
            opacity={0.2 + Math.random() * 0.3}
          >
            <animate
              attributeName="cx"
              values={`${Math.random() * 800};${Math.random() * 800}`}
              dur={`${10 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${Math.random() * 400};${Math.random() * 400}`}
              dur={`${10 + Math.random() * 10}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.8;0.2"
              dur={`${5 + Math.random() * 5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}
