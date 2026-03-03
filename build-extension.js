#!/usr/bin/env node

/**
 * Simple build script for the Image Downloader extension
 * This script copies the source files to a build directory for Chrome extension loading
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building Image Downloader Extension...');

// Source and build directories
const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, 'build');
const stylesDir = path.join(__dirname, 'stylesheets');
const imagesDir = path.join(__dirname, 'images');

// Create build directory
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'manifest.json',
  'package.json',
  'README.md',
  'LICENSE.md',
  'USERGUIDE'
];

// Copy root files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(buildDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file}`);
  }
});

// Copy source directories
const dirsToCopy = [
  { src: srcDir, dest: path.join(buildDir, 'src') },
  { src: stylesDir, dest: path.join(buildDir, 'stylesheets') },
  { src: imagesDir, dest: path.join(buildDir, 'images') }
];

dirsToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    copyDir(src, dest);
    console.log(`✅ Copied ${path.basename(src)} directory`);
  }
});

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('\n🎉 Build complete!');
console.log('\n📋 Next steps:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the "build" folder');
console.log('5. Test the enhanced features!');

console.log('\n🧪 Test files available:');
console.log('- test-smart-titles.html - Comprehensive test scenarios');
console.log('- preview-enhanced-interface.html - Visual demo');

console.log('\n📖 See BUILD_INSTRUCTIONS.md for detailed setup guide.');