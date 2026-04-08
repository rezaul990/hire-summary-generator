# Assign Person ID Report

A standalone web application for generating and analyzing Assign Person ID reports from Excel data.

## Features

- Upload Excel files (.xlsx, .xls)
- Generate Person ID Top Sheet report with:
  - Plaza-wise grouping
  - Person ID statistics
  - Collection metrics (AC Qty, Collection Achieve Qty, Not Collected Qty)
  - Target vs Achieve amounts
  - Percentage calculations
  - Plaza subtotals with dark blue highlighting
  - Grand totals
- Export as Excel with formatted data
- Export as Image (optimized for Viber/WhatsApp sharing)
- Responsive design
- Developer credits included

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Excel File Structure

The application expects Excel files with the following column structure:

- Column C: Division
- Column D: Area
- Column E: Plaza
- Column G: Account No.
- Column H: Customer Name
- Column J: Product Category
- Column L: Assign Person ID
- Column N: Invoice No.
- Column O: Invoice Date
- Column P: Matured Date
- Column Q: Per Month Ins. Schedule Amt.
- Column S: Collection Target
- Column U: Collection Achieve

Header row should be at Row 6 (index 5), data starts from Row 7.

## Deployment

The app can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any web server

Simply run `npm run build` and deploy the `dist` folder.

## Developer

Developed by: Md. Rezaul Karim RCM

## License

Private - All rights reserved
