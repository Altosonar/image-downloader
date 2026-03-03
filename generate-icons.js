const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputSvg = path.join(__dirname, 'images', 'logo.svg');
const outputDir = path.join(__dirname, 'build', 'images');
const sizes = [16, 32, 48, 128];

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon_${size}.png`);
    await sharp(inputSvg)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  console.log('All icons generated successfully!');
})();
