// PNG icon generator using sharp — run once, then commit the PNGs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, 'public', 'icons', 'icon.svg');
const maskSvgPath = path.join(__dirname, 'public', 'icons', 'maskable-icon.svg');
const iconsDir = path.join(__dirname, 'public', 'icons');

const icons = [
  { src: svgPath, out: 'icon-192x192.png', size: 192 },
  { src: svgPath, out: 'icon-512x512.png', size: 512 },
  { src: svgPath, out: 'apple-touch-icon.png', size: 180 },
  { src: maskSvgPath, out: 'maskable-192x192.png', size: 192 },
  { src: maskSvgPath, out: 'maskable-512x512.png', size: 512 },
];

for (const { src, out, size } of icons) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, out));
  console.log(`✅ ${out} (${size}x${size})`);
}
console.log('\nAll icons generated!');
