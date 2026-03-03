# Chrome Extension Installation Guide

## 🚀 Step-by-Step Installation

### Step 1: Chrome Extensions Page
You should already have `chrome://extensions/` open in your browser.

### Step 2: Enable Developer Mode
```
┌─────────────────────────────────────────────────────────┐
│ Chrome Extensions                                         │
├─────────────────────────────────────────────────────────┤
│ [Details] [Update] [Developer mode] [Profile]           │
│                                                         │
│ [Your other extensions here...]                         │
└─────────────────────────────────────────────────────────┘
```
- Look for **"Developer mode"** toggle in the top right
- Click it to turn it **ON** (it will turn blue)

### Step 3: Load Your Extension
```
┌─────────────────────────────────────────────────────────┐
│ Chrome Extensions                                         │
├─────────────────────────────────────────────────────────┤
│ [Load unpacked] [Pack extension] [Update] [Profile]     │
│                                                         │
│ [Your other extensions here...]                         │
└─────────────────────────────────────────────────────────┘
```
- Click the blue **"Load unpacked"** button
- A file browser window will appear

### Step 4: Select Build Folder
In the file browser:
1. Navigate to your project directory
2. Look for the **`build`** folder (not the main project folder)
3. Select the **`build`** folder
4. Click **"Select Folder"** or **"Open"**

### Step 5: Extension Installed!
```
┌─────────────────────────────────────────────────────────┐
│ Chrome Extensions                                         │
├─────────────────────────────────────────────────────────┤
│ [Load unpacked] [Pack extension] [Update] [Profile]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Image Downloader                                    │ │
│ │ ┌─────────┐  [Details] [Remove] [Allow in incognito]│ │
│ │ │  🖼️    │                                         │ │
│ │ └─────────┘                                         │ │
│ │ Developer mode                                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Step 6: Pin to Toolbar (Optional)
```
Click 🔘 (puzzle piece) → Find "Image Downloader" → Click "Pin"
```

## 🧪 Testing Your Extension

### Visit a Website with Images
Try: https://unsplash.com or https://pexels.com

### Click Extension Icon
- Should look like a picture frame 🖼️
- A popup will appear with all images from the page

### Test Features
1. **Hover over images** → See smart titles appear
2. **Click images** → Select/deselect them
3. **Filter by URL** → Type in search box
4. **Download** → Click download button

## 📋 What You Should See

### In Extension Popup:
```
┌─────────────────────────────────────────────────────────┐
│ Enhanced Image Downloader [SMART TITLES ACTIVE]         │
├─────────────────────────────────────────────────────────┤
│ [Filter by URL] [Normal▼] [Advanced Filters] [Options]  │
├─────────────────────────────────────────────────────────┤
│ ☑ Select all (X / Y)                                    │
├─────────────────────────────────────────────────────────┤
│ [🖼️ Image 1] [🖼️ Image 2] [🖼️ Image 3]                   │
│ [🖼️ Image 4] [🖼️ Image 5] [🖼️ Image 6]                   │
├─────────────────────────────────────────────────────────┤
│ [Save to subfolder] [Rename files] [Download Selected]  │
└─────────────────────────────────────────────────────────┘
```

### Hover Effect:
```
When you hover over an image:
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│  Beautiful mountain landscape   │
│  with trees and lake            │
│  ─────────────────────────────  │
└─────────────────────────────────┘
```

## 🎯 Success Checklist

- [ ] Developer mode is enabled
- [ ] Extension loaded from `build` folder
- [ ] Extension appears in extensions list
- [ ] Extension icon shows in toolbar
- [ ] Popup opens when clicked
- [ ] Images appear in popup
- [ ] Hover shows smart titles
- [ ] Click to select/deselect works
- [ ] Download button works
- [ ] Files are named with smart titles

## 🆘 Troubleshooting

**Extension won't load?**
- Make sure you selected the `build` folder (not the main project folder)
- Check that all files are present in the build folder
- Try refreshing the extensions page

**Features not working?**
- Make sure you're on a page with images
- Check that "Show file renaming" is enabled in options
- Try reloading the extension

**Still having issues?**
- Open Chrome Developer Tools (F12)
- Check Console for any error messages
- Reload the extension and try again

## 🎉 You're Done!

Your enhanced image downloader is now installed and ready to use with all the smart features!