#!/usr/bin/env node

/**
 * Video Optimization Script
 * 
 * This script provides instructions and commands for optimizing background videos
 * for maximum performance. Run these commands manually as they require ffmpeg.
 */

const fs = require('fs');
const path = require('path');

console.log('🎬 Video Optimization Guide');
console.log('============================\n');

console.log('To optimize your background video for maximum performance, run these commands:\n');

console.log('1. Install ffmpeg (if not already installed):');
console.log('   brew install ffmpeg\n');

console.log('2. Optimize WebM format (recommended for modern browsers):');
console.log('   ffmpeg -i public/bg.webm \\');
console.log('     -c:v libvpx-vp9 \\');
console.log('     -crf 30 \\');
console.log('     -b:v 0 \\');
console.log('     -b:a 128k \\');
console.log('     -c:a libopus \\');
console.log('     -vf "scale=1920:1080" \\');
console.log('     -r 30 \\');
console.log('     -an \\');
console.log('     -movflags +faststart \\');
console.log('     -f webm \\');
console.log('     public/bg_optimized.webm\n');

console.log('3. Create MP4 fallback (for older browsers):');
console.log('   ffmpeg -i public/bg.webm \\');
console.log('     -c:v libx264 \\');
console.log('     -crf 28 \\');
console.log('     -preset slow \\');
console.log('     -vf "scale=1920:1080" \\');
console.log('     -r 30 \\');
console.log('     -an \\');
console.log('     -movflags +faststart \\');
console.log('     -f mp4 \\');
console.log('     public/bg.mp4\n');

console.log('4. Create low-quality preview (for faster initial load):');
console.log('   ffmpeg -i public/bg.webm \\');
console.log('     -c:v libvpx-vp9 \\');
console.log('     -crf 40 \\');
console.log('     -b:v 0 \\');
console.log('     -vf "scale=960:540" \\');
console.log('     -r 15 \\');
console.log('     -an \\');
console.log('     -t 3 \\');
console.log('     -f webm \\');
console.log('     public/bg_preview.webm\n');

console.log('5. Replace the original file:');
console.log('   mv public/bg_optimized.webm public/bg.webm\n');

console.log('\n📊 Optimization Benefits:');
console.log('- Reduced file size (typically 50-70% smaller)');
console.log('- Better compression with VP9 codec');
console.log('- Optimized for web streaming');
console.log('- GPU-accelerated decoding');
console.log('- Progressive loading support\n');

console.log('🔧 Additional Performance Tips:');
console.log('- Use WebM as primary format (better compression)');
console.log('- Include MP4 fallback for compatibility');
console.log('- Consider creating multiple quality versions');
console.log('- Use poster images for faster initial display');
console.log('- Implement lazy loading (already done in Hero component)');
