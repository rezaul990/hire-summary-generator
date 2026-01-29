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

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

The app will open at `http://localhost:3000`

## Build

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

## Deployment to Netlify

### Option 1: Using Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 2: Using GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically build and deploy on every push

### Option 3: Manual Deployment

1. Run `npm run build`
2. Drag and drop the `build` folder to Netlify

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

## Technologies Used

- React 18
- XLSX (for Excel file processing)
- CSS3 with modern styling
- Responsive design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
