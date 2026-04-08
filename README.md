# Walton Division & Area Wise Summary

A modern React application for analyzing and comparing Walton division and area-wise collection data.

## Features

- **Division & Area Wise Summary**: View detailed summaries with division and area filters
  - Detailed view with individual areas
  - Division summary view showing only division totals
  - Download filtered data as Excel

- **Area Wise Summary with Plaza Details**: Analyze plaza-level data
  - Division and area filters
  - Area subtotals
  - Grand totals with recalculated values

- **Daily Collection Comparison**: Compare previous day and current day collections
  - Upload two Excel files for comparison
  - Division and area filters
  - Track daily collection progress
  - Monitor overdue collection changes
  - Download comparison reports

- **Person ID Report**: Generate detailed person ID reports (Integrated App)
  - Upload Excel files with person data
  - Generate comprehensive reports
  - Export and share reports

- **Integrated Tools**:
  - Excel Data Cleaner
  - Overdue Calculator
  - Person ID Report (New!)

## Installation

### Quick Setup (Recommended)

```bash
npm run setup
```

This will install dependencies for both the main app and the Person ID Report.

### Manual Setup

```bash
# Install main app dependencies
npm install

# Install Person ID Report dependencies
cd person-id-report
npm install
cd ..
```

## Development

### Run Both Apps

```bash
npm run start:all
```

This starts:
- **Collection Summary**: http://localhost:3000
- **Person ID Report**: http://localhost:5173

### Run Main App Only

```bash
npm start
```

The app will open at `http://localhost:3000`

## Build

### Build Both Apps (Recommended for Production)

```bash
npm run build:all
```

Creates optimized production builds:
- Main app: `./build/`
- Person ID Report: `./build/person-id-report/`

### Build Main App Only

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

## Deployment

### Vercel (Recommended)

**Quick Deploy:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel Dashboard
3. Configure:
   - Build Command: `npm run build:all`
   - Output Directory: `build`
   - Install Command: `npm run setup`
4. Deploy!

See **VERCEL_DEPLOYMENT.md** for detailed instructions.

### Netlify

**Build Command:**
```
npm run build:all
```

**Publish Directory:**
```
build
```

### Deployment Steps

1. **Using Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Using Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Using GitHub**:
   - Push your code to GitHub
   - Connect your repository to Vercel or Netlify
   - Set build command to `npm run build:all`
   - Set publish directory to `build`
   - Automatic deployment on every push

4. **Manual Deployment**:
   - Run `npm run build:all`
   - Upload the `build` folder to your hosting service

## How to Use

### 1. Division & Area Wise Summary
- Upload your Excel file
- Choose between "Detailed View" or "Division Summary" view
- Use filters to narrow down data
- Download filtered results

### 2. Area Wise Summary with Plaza Details
- Upload your Excel file
- Filter by division and area
- View plaza-level details with subtotals
- Download filtered data

### 3. Daily Collection Comparison
- Upload previous day's Excel file
- Upload current day's Excel file
- Click "Compare" to generate comparison
- Filter by division and area
- View daily collection progress and overdue changes
- Download comparison report

### 4. Person ID Report (New!)
- Click the "Person ID Report" button in the "More Useful Tools" section
- Opens in a new tab
- Upload Excel files with person data
- Generate and export reports

## Excel File Format

Your Excel file should contain the following columns:
- Division
- Area
- Plaza
- Collectible Acc Qty
- Collected Acc Qty
- Collectible Amount
- Collected Amount
- Previous Month Overdue
- Running Month Overdue

## Project Structure

```
.
├── src/                      # Main Collection Summary app
├── person-id-report/         # Person ID Report app (Vite)
├── build-all.js             # Build script for both apps
├── dev-all.js               # Development script for both apps
├── setup.js                 # Setup script
├── INTEGRATION_GUIDE.md     # Detailed integration docs
└── QUICK_START.md           # Quick start guide
```

## Technologies Used

- React 18
- XLSX (for Excel file processing)
- Vite (for Person ID Report)
- Create React App (for main app)
- CSS3 with modern styling
- Responsive design

## Documentation

- **VERCEL_DEPLOYMENT.md** - Vercel deployment guide (Recommended)
- **QUICK_START.md** - Quick start guide for the integrated apps
- **INTEGRATION_GUIDE.md** - Detailed integration documentation
- **INTEGRATION_SUMMARY.md** - Summary of integration changes
- **TELEGRAM_SETUP.md** - Telegram bot integration guide

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Developed By

**Md. Rezaul Karim RCM**
- Tech & Data Lover
- WhatsApp: +8801712394851
- Facebook: https://www.facebook.com/rezaul2000

## License

MIT
