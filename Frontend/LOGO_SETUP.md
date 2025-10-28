# UOC Logo Setup Instructions

## Quick Setup

The application is now configured to display the University of Colombo (UOC) logo in:
1. **Header** - Top right corner (smaller size)
2. **Home Page** - Hero section (larger, prominent display)

## Steps to Add the Logo

### Option 1: Manual Save (Recommended)
1. You have the UOC logo image file
2. Save it as: `frontend/public/logos/uoc-logo.png`
3. That's it! The logo will automatically appear when you refresh the page

### Option 2: Use an Existing Logo File
If you already have a logo file:
```powershell
# Copy your logo file to the correct location
Copy-Item "path\to\your\uoc-logo.png" "frontend\public\logos\uoc-logo.png"
```

### Option 3: Download from External Source
If you have a URL to the logo:
```powershell
cd frontend/public/logos
Invoke-WebRequest -Uri "URL_TO_LOGO" -OutFile "uoc-logo.png"
```

## Supported Formats
- PNG (recommended) - `uoc-logo.png`
- SVG (best quality) - `uoc-logo.svg` (you'll need to update the file extension in the components)
- JPG/JPEG - `uoc-logo.jpg`

## Where the Logo Appears

### 1. Header Component (`src/components/Header.tsx`)
- Location: Top right, next to the trophy badge
- Size: 40px x 40px (mobile), 56px x 56px (desktop)
- Style: Clean, with object-fit contain

### 2. Home Page (`src/pages/Home.tsx`)
- Location: Hero section, centered above the title
- Size: 96px x 96px (mobile), 128px x 128px (desktop)
- Style: Large, prominent with drop shadow

## Verification

After adding the logo:
1. Make sure the dev server is running (`npm run dev`)
2. Navigate to http://localhost:5173
3. You should see the UOC logo in:
   - The header (top right)
   - The home page hero section (center, large)

## Troubleshooting

### Logo Not Showing?
1. Check the file name is exactly: `uoc-logo.png`
2. Check the file is in: `frontend/public/logos/`
3. Hard refresh your browser (Ctrl + Shift + R)
4. Check browser console for 404 errors

### Wrong Size/Positioning?
- Edit `src/components/Header.tsx` (line with className for img tag)
- Edit `src/pages/Home.tsx` (line with className for img tag)
- Adjust the `h-` and `w-` Tailwind classes

## Next Steps

If you want to use a different file format or name:
1. Update the `src` attribute in both files:
   - `src/components/Header.tsx`
   - `src/pages/Home.tsx`
2. Change `/logos/uoc-logo.png` to your file path
