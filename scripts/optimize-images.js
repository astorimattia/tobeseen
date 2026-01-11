const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const outputDir = path.join(publicDir, 'optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Image optimization configurations
const configs = [
  { suffix: '_sm', width: 640, quality: 80 },
  { suffix: '_md', width: 1024, quality: 85 },
  { suffix: '_lg', width: 1920, quality: 90 },
  { suffix: '_xl', width: 2560, quality: 95 }
];

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImage(inputPath, outputPath, config) {
  try {
    const { width, quality } = config;

    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality })
      .toFile(outputPath);

    console.log(`✓ Optimized: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (path.resolve(filePath) === path.resolve(outputDir)) {
      continue;
    }

    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();

      if (imageExtensions.includes(ext)) {
        const baseName = path.basename(file, ext);
        const relativePath = path.relative(publicDir, filePath);
        const outputSubDir = path.dirname(path.join(outputDir, relativePath));

        // Create output subdirectory if it doesn't exist
        if (!fs.existsSync(outputSubDir)) {
          fs.mkdirSync(outputSubDir, { recursive: true });
        }

        // Generate optimized versions
        for (const config of configs) {
          const outputFileName = `${baseName}${config.suffix}.webp`;
          const outputPath = path.join(outputSubDir, outputFileName);

          // Check if output file already exists
          if (fs.existsSync(outputPath)) {
            // console.log(`✓ Skipped (already exists): ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
            continue;
          }

          await optimizeImage(filePath, outputPath, config);
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization...');
  console.log(`📁 Processing directory: ${publicDir}`);
  console.log(`📁 Output directory: ${outputDir}`);

  try {
    await processDirectory(publicDir);
    console.log('✅ Image optimization completed!');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Run the optimization
main();
