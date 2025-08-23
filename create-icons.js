// Simple script to create placeholder icons for the extension
// In production, you would use proper icon design tools

const fs = require('fs');
const path = require('path');

// Create SVG icon template
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <circle cx="${size * 0.3}" cy="${size * 0.4}" r="${size * 0.08}" fill="white"/>
  <circle cx="${size * 0.7}" cy="${size * 0.4}" r="${size * 0.08}" fill="white"/>
  <path d="M ${size * 0.25} ${size * 0.65} Q ${size * 0.5} ${size * 0.8} ${size * 0.75} ${size * 0.65}" 
        stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
  <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.1}" fill="white" rx="${size * 0.02}"/>
</svg>`;

// Icon sizes needed for Chrome extension
const sizes = [16, 32, 48, 128];

const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Creating extension icons...');

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const fileName = `icon${size}.svg`;
    const filePath = path.join(iconsDir, fileName);
    
    fs.writeFileSync(filePath, svgContent.trim());
    console.log(`Created ${fileName}`);
});

console.log('\nIcons created successfully!');
console.log('Note: For production, convert SVGs to PNG format using a tool like Inkscape or online converters.');
console.log('The SVG icons will work for development and testing.');

// Create a simple favicon as well
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG.trim());
console.log('Created favicon.svg');