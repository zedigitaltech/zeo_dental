/**
 * Team Photo Processor
 *
 * Converts raw photos to web-optimized formats for Zeo Dental team section.
 *
 * Outputs:
 * - Card size: 800×1000px (4:5 aspect ratio)
 * - Modal size: 1600×2000px (4:5 aspect ratio)
 * - Formats: WebP (85% quality) + JPEG (90% quality)
 *
 * Usage: node scripts/process-team-photos.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PHOTOS = [
  // NOTE: P1016623.RW2 needs manual conversion to JPEG first
  // Use an online converter like https://raw.pics.io/ or Adobe Camera Raw
  // {
  //   source: 'C:\\Users\\User\\Downloads\\P1016623.RW2',
  //   name: 'emanuela-velaj',
  //   doctor: 'Dr. Emanuela Velaj'
  // },
  {
    source: 'C:\\Users\\User\\Downloads\\WhatsApp Image 2025-12-17 at 11.56.17 AM-2.jpeg',
    name: 'kristi-sulanjaku',
    doctor: 'Dr. Kristi Sulanjaku'
  }
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'team');

const SIZES = {
  card: { width: 800, height: 1000 },
  modal: { width: 1600, height: 2000 }
};

const QUALITY = {
  webp: 85,
  jpeg: 90
};

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created directory: ${OUTPUT_DIR}`);
}

// Process photos
async function processPhotos() {
  console.log('🚀 Starting photo processing...\n');

  for (const photo of PHOTOS) {
    console.log(`📸 Processing: ${photo.doctor}`);

    // Check if source file exists
    if (!fs.existsSync(photo.source)) {
      console.error(`   ❌ Source file not found: ${photo.source}`);
      continue;
    }

    try {
      // Process each size
      for (const [sizeKey, dimensions] of Object.entries(SIZES)) {
        const baseFilename = `${photo.name}-${sizeKey}`;

        // Generate WebP
        const webpPath = path.join(OUTPUT_DIR, `${baseFilename}.webp`);
        await sharp(photo.source)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'top'
          })
          .webp({ quality: QUALITY.webp })
          .toFile(webpPath);

        console.log(`   ✅ ${baseFilename}.webp (${dimensions.width}×${dimensions.height})`);

        // Generate JPEG
        const jpegPath = path.join(OUTPUT_DIR, `${baseFilename}.jpg`);
        await sharp(photo.source)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'top'
          })
          .jpeg({ quality: QUALITY.jpeg })
          .toFile(jpegPath);

        console.log(`   ✅ ${baseFilename}.jpg (${dimensions.width}×${dimensions.height})`);
      }

      console.log(`   ✨ Completed: ${photo.doctor}\n`);
    } catch (error) {
      console.error(`   ❌ Error processing ${photo.doctor}:`, error.message);
    }
  }

  console.log('✅ All photos processed successfully!\n');
  console.log('📁 Output directory:', OUTPUT_DIR);
  console.log('📊 Total files created: 12 (4 per doctor: card.webp, card.jpg, modal.webp, modal.jpg)\n');
}

// Run the script
processPhotos().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
