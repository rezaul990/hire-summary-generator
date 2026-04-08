# Vercel Deployment Guide - Collection Summary with Person ID Report

## 🚀 Quick Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import your Git repository** (GitHub, GitLab, or Bitbucket)
4. **Configure Project**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:all`
   - **Output Directory**: `build`
   - **Install Command**: `npm run setup`
5. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

The CLI will automatically detect the `vercel.json` configuration.

## ⚙️ Vercel Configuration

The project includes a `vercel.json` file with the following settings:

```json
{
  "buildCommand": "npm run build:all",
  "outputDirectory": "build",
  "installCommand": "npm run setup"
}
```

### What This Does:
- **installCommand**: Installs dependencies for both apps
- **buildCommand**: Builds both Collection Summary and Person ID Report
- **outputDirectory**: Serves the combined build folder

## 🔧 Manual Configuration (If Needed)

If you need to configure manually in Vercel Dashboard:

### Build & Development Settings:
- **Framework Preset**: Other (or None)
- **Build Command**: `npm run build:all`
- **Output Directory**: `build`
- **Install Command**: `npm run setup`
- **Development Command**: `npm start` (for preview deployments)

### Root Directory:
- Leave as `.` (root)

## 🌐 After Deployment

### Accessing Your Apps:

1. **Collection Summary (Main App)**:
   ```
   https://your-project.vercel.app/
   ```

2. **Person ID Report**:
   ```
   https://your-project.vercel.app/person-id-report/
   ```

### Testing the Integration:

1. Visit your deployed site
2. Look for "More Useful Tools for RCM" section
3. Click "Person ID Report" button (👤 icon)
4. Person ID Report should open in a new tab

## 🔄 Continuous Deployment

### Automatic Deployments:

Vercel automatically deploys when you push to your repository:

- **Production**: Pushes to `main` or `master` branch
- **Preview**: Pushes to other branches or pull requests

### Build Process:

Each deployment will:
1. Run `npm run setup` (install dependencies for both apps)
2. Run `npm run build:all` (build both apps)
3. Deploy the `build` folder
4. Person ID Report will be available at `/person-id-report/`

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue**: Build command fails
**Solution**:
```bash
# Ensure vercel.json is committed
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

**Issue**: "person-id-report not found"
**Solution**: Make sure the `person-id-report` folder is committed to your repository

**Issue**: Dependencies not installing
**Solution**: Check that both `package.json` files are in the repository:
- Root: `package.json`
- Person ID Report: `person-id-report/package.json`

### Person ID Report Not Working

**Issue**: 404 error when clicking Person ID Report button
**Solution**: 
1. Check Vercel build logs to ensure `build:all` ran successfully
2. Verify `build/person-id-report/` folder was created
3. Check that `vercel.json` rewrites are configured

**Issue**: Person ID Report opens but shows blank page
**Solution**:
1. Check browser console for errors
2. Verify the build output includes all Person ID Report files
3. Check that `person-id-report/dist/` was copied correctly

### Environment Variables

If you need environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables for both apps if needed
3. Redeploy to apply changes

## 📊 Build Logs

To check build logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Click on a deployment
4. View "Building" logs to see the build process

Look for:
```
🚀 Building Collection Summary App...
✅ Main app built successfully
🚀 Building Person ID Report...
✅ Person ID Report built successfully
📦 Copying Person ID Report to main build...
✅ Person ID Report copied successfully
```

## 🔐 Security Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

These are automatically applied to all routes.

## 🎯 Performance Optimization

### Vercel Automatically Provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Compression (Gzip/Brotli)
- ✅ Edge caching
- ✅ Serverless functions (if needed)

### Build Optimization:
The `build:all` script creates optimized production builds for both apps.

## 📱 Custom Domain

To add a custom domain:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Both apps will be accessible:
   - `https://yourdomain.com/` (Main app)
   - `https://yourdomain.com/person-id-report/` (Person ID Report)

## 🔄 Updating Your Deployment

### Via Git:
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel will automatically rebuild and deploy.

### Via Vercel CLI:
```bash
vercel --prod
```

### Via Vercel Dashboard:
1. Go to Deployments
2. Click "Redeploy" on any previous deployment

## 📝 Vercel Project Settings

Recommended settings in Vercel Dashboard:

### General:
- **Node.js Version**: 18.x or higher
- **Build & Development Settings**: As configured above

### Git:
- **Production Branch**: main (or master)
- **Ignored Build Step**: Leave empty (build on every push)

### Environment Variables:
Add if needed:
- `REACT_APP_TELEGRAM_BOT_TOKEN` (if using Telegram integration)
- `REACT_APP_TELEGRAM_CHAT_ID` (if using Telegram integration)

## 🆘 Support

### Vercel Support:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

### Project Issues:
- Check `INTEGRATION_GUIDE.md` for technical details
- Check `QUICK_START.md` for common commands
- Review Vercel build logs for errors

## ✅ Deployment Checklist

Before deploying:
- [ ] `vercel.json` is committed
- [ ] `person-id-report` folder is committed
- [ ] Both `package.json` files are committed
- [ ] All build scripts are in root `package.json`
- [ ] Test locally with `npm run build:all`

After deploying:
- [ ] Main app loads correctly
- [ ] Person ID Report button is visible
- [ ] Person ID Report opens in new tab
- [ ] Person ID Report functions correctly
- [ ] No console errors

## 🎉 Success!

Once deployed, your Collection Summary app with integrated Person ID Report will be live on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Continuous deployment
- ✅ Preview deployments for branches
- ✅ Both apps accessible from one domain

---

**Deployed by: Md. Rezaul Karim RCM**
**Platform: Vercel**
