import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 아이콘 크기 목록
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// SVG 아이콘 템플릿 (간단한 지갑 아이콘)
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <rect x="${size * 0.1}" y="${size * 0.2}" width="${size * 0.8}" height="${size * 0.6}" fill="#ffffff" rx="${size * 0.1}"/>
  <rect x="${size * 0.15}" y="${size * 0.25}" width="${size * 0.7}" height="${size * 0.5}" fill="#000000" rx="${size * 0.05}"/>
  <rect x="${size * 0.2}" y="${size * 0.35}" width="${size * 0.6}" height="${size * 0.3}" fill="#ffffff" rx="${size * 0.02}"/>
  <circle cx="${size * 0.35}" cy="${size * 0.5}" r="${size * 0.08}" fill="#000000"/>
  <circle cx="${size * 0.65}" cy="${size * 0.5}" r="${size * 0.08}" fill="#000000"/>
</svg>
`;

// icons 디렉토리 생성
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 각 크기별로 SVG 파일 생성
iconSizes.forEach(size => {
  const svgContent = svgTemplate(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('PWA icons generated successfully!');
console.log('Note: For production, you should replace these SVG icons with proper PNG icons.'); 