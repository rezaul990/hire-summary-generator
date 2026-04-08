# Quick Start Guide - Person ID Report Integration

## 🚀 Getting Started

### First Time Setup

```bash
# Run the setup script (installs dependencies for both apps)
npm run setup
```

### Development

```bash
# Start both apps simultaneously
npm run start:all
```

This opens:
- **Collection Summary**: http://localhost:3000
- **Person ID Report**: http://localhost:5173

### Production Build

```bash
# Build both apps for production
npm run build:all
```

Output: `./build/` folder containing both apps

## 📍 Where to Find the Person ID Report Button

1. Open the Collection Summary app
2. Look for the **"More Useful Tools for RCM"** section (near the top)
3. Click the **"Person ID Report"** button (👤 icon)
4. The Person ID Report opens in a new tab

## 🎯 What's New

### Added to Sidebar:
- **Person ID Report** button with 👤 icon
- Opens in a new tab
- Works in both development and production

### New Scripts:
- `npm run setup` - First-time setup
- `npm run start:all` - Run both apps in development
- `npm run build:all` - Build both apps for production

### New Files:
- `build-all.js` - Production build script
- `dev-all.js` - Development server script
- `setup.js` - Setup script
- `INTEGRATION_GUIDE.md` - Detailed integration docs

## 🔧 Common Commands

```bash
# Setup (first time only)
npm run setup

# Development
npm run start:all          # Both apps
npm start                  # Main app only

# Production
npm run build:all          # Both apps
npm run build              # Main app only

# Person ID Report only
cd person-id-report
npm run dev                # Development
npm run build              # Production
```

## 📦 Deployment

### Vercel (Your Current Platform)

**Quick Deploy:**
```bash
# Via CLI
npm install -g vercel
vercel --prod
```

**Via Dashboard:**
1. Import your Git repository
2. Build command: `npm run build:all`
3. Output directory: `build`
4. Install command: `npm run setup`
5. Deploy!

See **VERCEL_DEPLOYMENT.md** for detailed Vercel-specific instructions.

### Netlify

1. **Build command**: `npm run build:all`
2. **Publish directory**: `build`
3. Deploy!

### Other Hosting

1. Run `npm run build:all`
2. Upload the entire `build` folder
3. Configure server to serve:
   - `/` → main app
   - `/person-id-report/` → Person ID Report

## ❓ Troubleshooting

**Person ID Report button doesn't work in development?**
- Make sure you ran `npm run start:all` (not just `npm start`)
- Check that port 5173 is available

**Build fails?**
- Run `npm run setup` to ensure all dependencies are installed
- Check that `person-id-report` folder exists

**Person ID Report doesn't open in production?**
- Verify you used `npm run build:all` (not just `npm run build`)
- Check that `build/person-id-report/` folder exists

## 📖 More Information

See `INTEGRATION_GUIDE.md` for detailed documentation.

---

**Developed by: Md. Rezaul Karim RCM**
