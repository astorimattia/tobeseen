'use client';

import React from "react";

export default function TestVideoPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero-style Video Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Hero Component Video Test</h2>
            <div className="relative bg-black rounded-lg overflow-hidden h-64">
              {/* Fallback background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
              
              {/* Video element - Same as Hero */}
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              >
                <source src="/test.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            
            <div className="mt-4 p-4 bg-gray-800 rounded">
              <h3 className="font-semibold mb-2">Hero Video:</h3>
              <p>• Background video with overlay</p>
              <p>• Should autoplay and loop</p>
              <p>• Same implementation as main Hero</p>
            </div>
          </div>

          {/* Simple Video Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Simple Video Test</h2>
            <div className="bg-black rounded-lg overflow-hidden h-64">
              <video
                controls
                className="w-full h-full"
              >
                <source src="/test.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="mt-4 p-4 bg-gray-800 rounded">
              <h3 className="font-semibold mb-2">Simple Video:</h3>
              <p>• Basic video with controls</p>
              <p>• Should load and be playable</p>
              <p>• Tests basic video functionality</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-900 rounded">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <p>Both videos should now work properly. The left video mimics your Hero component, and the right video is a simple test.</p>
        </div>
      </div>
    </div>
  );
}
