# Image Optimization Guide

This document outlines the comprehensive image optimization setup implemented for maximum performance and loading speed.

## 🚀 Optimizations Implemented

### 1. Next.js Image Configuration
- **Modern formats**: WebP and AVIF support for better compression
- **Device-specific sizes**: Optimized breakpoints for different screen sizes
- **Long-term caching**: 1-year cache TTL for better performance
- **Experimental features**: CSS optimization and package imports optimization

### 2. Strategic Image Preloading
- **Critical images**: Preload hero images and above-the-fold content
- **Smart preloading**: Only preload images that are likely to be viewed
- **Resource hints**: Use `<link rel="preload">` for critical images

### 3. Advanced Lazy Loading
- **Intersection Observer**: Load images 50px before they enter viewport
- **Priority system**: Critical images load immediately, others lazy load
- **Progressive loading**: First 6 images eager, rest lazy in galleries

### 4. Loading States & Error Handling
- **Loading spinners**: Visual feedback during image loading
- **Error fallbacks**: Graceful handling of failed image loads
- **Smooth transitions**: Opacity transitions for better UX

### 5. Responsive Image Sizing
- **Proper sizes attribute**: Accurate viewport-based sizing
- **Multiple breakpoints**: Optimized for mobile, tablet, and desktop
- **Quality optimization**: Different quality levels for different use cases

### 6. Performance Monitoring
- **Load time tracking**: Monitor image loading performance
- **Core Web Vitals**: Track LCP and CLS metrics
- **Error tracking**: Monitor failed image loads

## 📁 File Structure

```
app/components/
├── ImagePreloader.tsx          # Strategic image preloading
├── OptimizedImage.tsx          # Advanced lazy loading component
├── ResponsiveImage.tsx         # Responsive image sizing
├── ImagePerformanceMonitor.tsx # Performance tracking
├── EventShowcase.tsx           # Optimized gallery component
├── FullScreenImageViewer.tsx   # Optimized fullscreen viewer
├── Carousel.tsx                # Optimized carousel
└── Team.tsx                    # Optimized team photos

scripts/
└── optimize-images.js          # Image optimization script

public/
├── optimized/                  # Generated optimized images
│   ├── image_sm.webp          # 640px width
│   ├── image_md.webp          # 1024px width
│   ├── image_lg.webp          # 1920px width
│   └── image_xl.webp          # 2560px width
└── [original images]
```

## 🛠 Usage

### Basic Image Component
```tsx
import Image from 'next/image';

<Image
  src="/image.webp"
  alt="Description"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
  priority={isAboveFold}
  loading={isAboveFold ? "eager" : "lazy"}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Optimized Image Component
```tsx
import OptimizedImage from './components/OptimizedImage';

<OptimizedImage
  src="/image.webp"
  alt="Description"
  fill
  priority={isCritical}
  quality={90}
/>
```

### Image Preloading
```tsx
import ImagePreloader from './components/ImagePreloader';

const criticalImages = ['/hero.webp', '/logo.png'];
<ImagePreloader images={criticalImages} priority={true} />
```

## 🔧 Build Process

### Development
```bash
npm run dev
```

### Production Build with Optimization
```bash
npm run build:optimized
```

This will:
1. Run image optimization script
2. Generate multiple sizes and formats
3. Build the application

### Manual Image Optimization
```bash
npm run optimize-images
```

## 📊 Performance Features

### Loading Strategy
- **Above-the-fold**: Eager loading with priority
- **Below-the-fold**: Lazy loading with intersection observer
- **Gallery images**: First 6 eager, rest lazy
- **Fullscreen viewer**: High quality (95%) for best experience

### Quality Settings
- **Hero images**: 90-95% quality
- **Gallery thumbnails**: 85% quality
- **Team photos**: 90% quality
- **Fullscreen**: 95% quality

### Caching Strategy
- **Browser cache**: 1 year TTL
- **CDN cache**: Optimized for global delivery
- **Service worker**: Future implementation ready

## 🎯 Performance Metrics

### Target Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **Image load time**: < 1s for critical images

### Monitoring
- Console logging for development
- Google Analytics integration ready
- Core Web Vitals tracking
- Error rate monitoring

## 🔍 Best Practices

### Image Selection
1. Use WebP format for better compression
2. Provide multiple sizes for responsive design
3. Use appropriate quality settings
4. Implement proper alt text for accessibility

### Loading Strategy
1. Preload critical above-the-fold images
2. Use lazy loading for below-the-fold content
3. Implement loading states for better UX
4. Handle errors gracefully

### Performance
1. Monitor Core Web Vitals
2. Optimize image sizes for target devices
3. Use modern image formats
4. Implement proper caching strategies

## 🚨 Troubleshooting

### Common Issues
1. **Images not loading**: Check file paths and formats
2. **Slow loading**: Verify preloading and lazy loading setup
3. **Layout shift**: Ensure proper aspect ratios and sizes
4. **Poor quality**: Adjust quality settings for different use cases

### Debug Mode
Enable performance monitoring in development:
```tsx
<ImagePerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
```

## 📈 Future Enhancements

1. **Service Worker**: Implement offline image caching
2. **Progressive JPEG**: Add progressive loading for large images
3. **Art Direction**: Implement responsive images with different crops
4. **CDN Integration**: Add CDN support for global optimization
5. **WebP Fallback**: Add fallback for older browsers
6. **Image Compression**: Real-time compression for user uploads

## 🔗 Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Core Web Vitals](https://web.dev/vitals/)
- [WebP Format Guide](https://developers.google.com/speed/webp)
