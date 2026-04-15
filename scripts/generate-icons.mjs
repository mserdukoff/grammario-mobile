import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const italicFont = fs.readFileSync(path.join(root, 'assets/fonts/InstrumentSerif-Italic.ttf'));

// Full icon SVG (rounded rect + G)
function makeIconSvg(size) {
  const rx = Math.round((14 / 64) * size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#FAF9F7"/>
  <text
    x="50%"
    y="52%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Instrument Serif"
    font-size="${Math.round(size * 0.6875)}"
    font-style="italic"
    font-weight="400"
    fill="#1C1917"
  >G</text>
</svg>`;
}

// Foreground for Android adaptive icon: G on transparent bg
function makeAdaptiveForegroundSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <text
    x="50%"
    y="52%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Instrument Serif"
    font-size="${Math.round(size * 0.55)}"
    font-style="italic"
    font-weight="400"
    fill="#1C1917"
  >G</text>
</svg>`;
}

// Background for Android adaptive icon: solid fill
function makeAdaptiveBackgroundSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FAF9F7"/>
</svg>`;
}

// Monochrome for Android adaptive icon: black G on transparent
function makeAdaptiveMonochromeSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <text
    x="50%"
    y="52%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Instrument Serif"
    font-size="${Math.round(size * 0.55)}"
    font-style="italic"
    font-weight="400"
    fill="#000000"
  >G</text>
</svg>`;
}

function renderSvgToPng(svgString, outputPath) {
  const resvg = new Resvg(svgString, {
    font: {
      fontBuffers: [italicFont],
      loadSystemFonts: false,
    },
  });
  const png = resvg.render().asPng();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, png);
  console.log(`✓ ${path.relative(root, outputPath)}`);
}

const SIZE = 1024;

renderSvgToPng(makeIconSvg(SIZE),                     path.join(root, 'assets/icon.png'));
renderSvgToPng(makeIconSvg(SIZE),                     path.join(root, 'assets/splash-icon.png'));
renderSvgToPng(makeAdaptiveForegroundSvg(SIZE),        path.join(root, 'assets/android-icon-foreground.png'));
renderSvgToPng(makeAdaptiveBackgroundSvg(SIZE),        path.join(root, 'assets/android-icon-background.png'));
renderSvgToPng(makeAdaptiveMonochromeSvg(SIZE),        path.join(root, 'assets/android-icon-monochrome.png'));
renderSvgToPng(makeIconSvg(64),                        path.join(root, 'assets/favicon.png'));

console.log('\nAll icons generated.');
