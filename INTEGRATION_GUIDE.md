# Person ID Report Integration Guide

This guide explains how the Person ID Report has been integrated into the Collection Summary application.

## Overview

The Person ID Report is a separate React application (built with Vite) that has been integrated into the main Collection Summary app (built with Create React App). Both apps run independently but are accessible through a unified interface.

## Project Structure

```
.
├── src/                          # Main Collection Summary app
│   ├── components/
│   │   └── Sidebar.js           # Contains link to Person ID Report
│   └── ...
├── person-id-report/            # Person ID Report app (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── build-all.js                 # Build script for both apps
├── dev-all.js                   # Development script for both apps
└── package.json                 # Main app package.json
```

## Development

### Running Both Apps in Development Mode

```bash
# Install dependencies for both apps
npm install
cd person-id-report && npm install && cd ..

# Start both apps simultaneously
npm run start:all
```

This will start:
- **Collection Summary App**: http://localhost:3000
- **Person ID Report**: http://localhost:5173

### Running Apps Individually

**Collection Summary only:**
```bash
npm start
```

**Person ID Report only:**
```bash
cd person-id-report
npm run dev
```

## Building for Production

### Build Both Apps

```bash
npm run build:all
```

This script will:
1. Build the main Collection Summary app → `./build/`
2. Build the Person ID Report → `./person-id-report/dist/`
3. Copy Person ID Report build to → `./build/person-id-report/`

### Build Apps Individually

**Collection Summary only:**
```bash
npm run build
```

**Person ID Report only:**
```bash
cd person-id-report
npm run build
```

## How It Works

### In Development
- The Sidebar component detects `NODE_ENV === 'development'`
- Clicking "Person ID Report" opens `http://localhost:5173` in a new tab
- Both apps run on different ports and communicate independently

### In Production
- The build script copies the Person ID Report into `./build/person-id-report/`
- Clicking "Person ID Report" opens `/person-id-report/index.html` in a new tab
- Both apps are served from the same domain

## Deployment

### Vercel (Recommended)

The project includes `vercel.json` configuration for easy deployment.

**Via Vercel Dashboard:**
1. Import your Git repository to Vercel
2. Vercel will automatically detect the configuration
3. Click "Deploy"

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel --prod
```

**Configuration:**
- Build Command: `npm run build:all` (auto-detected)
- Output Directory: `build` (auto-detected)
- Install Command: `npm run setup` (auto-detected)

See **VERCEL_DEPLOYMENT.md** for detailed instructions.

### Netlify Deployment

1. **Build Command:**
   ```
   npm run build:all
   ```

2. **Publish Directory:**
   ```
   build
   ```

3. **Environment Variables:**
   - No additional environment variables needed

### Manual Deployment

1. Build both apps:
   ```bash
   npm run build:all
   ```

2. Deploy the entire `./build/` folder to your hosting service

3. Ensure your server is configured to serve:
   - Main app: `/` → `index.html`
   - Person ID Report: `/person-id-report/` → `person-id-report/index.html`

## Features

### Person ID Report Button
- Located in the "More Useful Tools for RCM" section
- Icon: 👤
- Opens in a new tab
- Works in both development and production

### Sidebar Tools
The sidebar now includes three tools:
1. **Excel Data Cleaner** - External link
2. **Overdue Calculator** - External link
3. **Person ID Report** - Integrated app (new)

## Troubleshooting

### Person ID Report doesn't open in development
- Make sure the Person ID Report dev server is running on port 5173
- Run `npm run start:all` to start both apps

### Person ID Report doesn't work in production
- Ensure `npm run build:all` was used to build
- Check that `./build/person-id-report/` folder exists
- Verify your hosting service serves the subdirectory correctly

### Build fails
- Make sure `fs-extra` is installed: `npm install fs-extra`
- Check that both apps have their dependencies installed
- Verify Node.js version compatibility

## Customization

### Change Person ID Report Port (Development)
Edit `person-id-report/vite.config.js`:
```javascript
export default {
  server: {
    port: 5173 // Change this port
  }
}
```

Then update `src/components/Sidebar.js`:
```javascript
const url = isDevelopment 
  ? 'http://localhost:YOUR_NEW_PORT' 
  : '/person-id-report/index.html';
```

### Change Person ID Report Path (Production)
Update `src/components/Sidebar.js`:
```javascript
const url = isDevelopment 
  ? 'http://localhost:5173' 
  : '/your-custom-path/index.html';
```

Then update `build-all.js`:
```javascript
const mainBuildPath = path.join(__dirname, 'build', 'your-custom-path');
```

## Technical Details

### Why Two Separate Apps?
- **Collection Summary**: Built with Create React App (CRA)
- **Person ID Report**: Built with Vite
- Different build tools, but both use React
- Keeps concerns separated and allows independent development

### Communication Between Apps
- Currently, apps don't communicate with each other
- Each app maintains its own state
- Future enhancement: Could use localStorage or URL parameters for data sharing

## Future Enhancements

Possible improvements:
1. **React Router Integration**: Merge both apps into a single-page application
2. **Shared State**: Use localStorage or Context API to share data
3. **Unified Build**: Migrate both to the same build tool
4. **API Integration**: Connect both apps to a backend service

## Support

For issues or questions:
- Check the console for error messages
- Verify all dependencies are installed
- Ensure correct Node.js version (14+ recommended)

---

**Developed by: Md. Rezaul Karim RCM**
