// This script generates placeholder icons for PWA
// You should replace these with your actual app icons

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1976d2"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}px" fill="white" text-anchor="middle" dominant-baseline="middle">RFID</text>
</svg>
`;

// Create icons directory
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Note: This creates simple placeholder SVG icons
// In production, you should use proper PNG icons with your app logo
iconSizes.forEach(size => {
  const svg = svgTemplate(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\nPlaceholder icons created!');
console.log('For production, please replace these with proper PNG icons featuring your app logo.');
console.log('You can use tools like:');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('- https://maskable.app/');
console.log('- https://realfavicongenerator.net/');