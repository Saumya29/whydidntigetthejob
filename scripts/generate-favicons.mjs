import { readFileSync, writeFileSync } from 'fs';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const svg = readFileSync('public/icon.svg', 'utf-8');

// Generate different sizes
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  writeFileSync(`public/${name}`, pngBuffer);
  console.log(`Generated ${name}`);
}

// Create favicon.ico from 16x16 and 32x32
const png16 = readFileSync('public/favicon-16x16.png');
const png32 = readFileSync('public/favicon-32x32.png');

// Simple ICO format with just 32x32
await sharp(png32)
  .toFile('public/favicon.ico');

console.log('Generated favicon.ico');
console.log('Done!');
