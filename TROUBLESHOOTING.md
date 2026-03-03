# Installation Troubleshooting Guide

## 🚨 Common Installation Issues and Solutions

### Issue 1: Extension Won't Load

**Problem:** Nothing happens when you click "Load unpacked"

**Solution:**
1. Make sure you're selecting the **`build`** folder (not the main project folder)
2. The build folder should contain:
   - `manifest.json`
   - `src/` folder
   - `stylesheets/` folder
   - `images/` folder

**Check:** Run this command to verify:
```bash
dir build
```
You should see the folders listed above.

### Issue 2: Extension Loads but Doesn't Work

**Problem:** Extension appears but popup doesn't open or features don't work

**Solution:**
1. **Check Chrome Developer Tools:**
   - Right-click the extension icon
   - Select "Inspect popup"
   - Look for any error messages in the Console tab

2. **Check Extension Details:**
   - In Chrome Extensions, click "Details" for your extension
   - Make sure all permissions are granted
   - Check that "Allow access to file URLs" is enabled if needed

### Issue 3: Popup Opens but No Images Show

**Problem:** Extension loads but no images appear in the popup

**Solution:**
1. **Visit a website with images first** (like https://unsplash.com)
2. **Check the website has images** - some sites may not have detectable images
3. **Check Console for errors** - right-click extension popup → Inspect

### Issue 4: Smart Features Not Working

**Problem:** Images show but no smart titles or smart naming

**Solution:**
1. **Enable "Show file renaming"** in extension options
2. **Check that images have metadata** - not all images have alt text or titles
3. **Test with demo page:** Open `test-smart-titles.html` in browser

## 🎯 Step-by-Step Fix

### Step 1: Verify Build
```bash
# Check build folder exists and has correct files
dir build
dir build\src\Popup
```

### Step 2: Remove and Reinstall
1. In Chrome Extensions, find your extension
2. Click "Remove" to uninstall it
3. Click "Load unpacked" again
4. Select the `build` folder

### Step 3: Test with Demo
1. Open `test-smart-titles.html` in Chrome
2. Load the extension on this page
3. This page has test images specifically for the extension

### Step 4: Check Console
1. Right-click the extension icon
2. Select "Inspect popup"
3. Look for any red error messages
4. Take note of any errors and share them

## 🆘 Emergency Fix

If nothing works, try this:

1. **Close all Chrome windows**
2. **Reopen Chrome**
3. **Go to `chrome://extensions/`**
4. **Enable Developer mode**
5. **Click "Load unpacked"**
6. **Select the `build` folder**
7. **Visit https://unsplash.com**
8. **Click extension icon**

## 📋 Success Verification

After installation, you should see:

✅ Extension appears in Chrome Extensions list
✅ Extension icon shows in toolbar
✅ Popup opens when clicked
✅ Images appear in popup
✅ Hover shows smart titles
✅ Click to select/deselect works
✅ Download button works

## 🎉 Still Having Issues?

If you're still having problems:

1. **Share the Console errors** (right-click popup → Inspect → Console)
2. **Tell me exactly what happens** when you try each step
3. **What do you see** vs. **what do you expect to see**

I'll help you fix it!