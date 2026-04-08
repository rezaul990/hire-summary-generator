# Troubleshooting Person ID Report Integration

## Common Issues and Solutions

### Issue 1: Button Doesn't Work (Nothing Happens)

**Symptoms:**
- Click "Person ID Report" button
- Nothing happens
- No new tab opens

**Solutions:**

1. **Check Pop-up Blocker**
   - Browser may be blocking pop-ups
   - Look for pop-up blocked icon in address bar
   - Allow pop-ups for your site
   - Try clicking the button again

2. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Share the error message for help

3. **Verify Development Server is Running**
   ```bash
   # Make sure both apps are running
   npm run start:all
   ```
   - Main app should be on http://localhost:3000
   - Person ID Report should be on http://localhost:5173

### Issue 2: 404 Error (Page Not Found)

**Symptoms:**
- Button opens new tab
- Shows "404 Not Found" or blank page

**In Development:**

1. **Check if Person ID Report is running**
   ```bash
   # Open a new terminal and check
   curl http://localhost:5173
   ```

2. **Restart both apps**
   ```bash
   # Stop all running processes (Ctrl+C)
   # Then restart
   npm run start:all
   ```

3. **Check port 5173 is available**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   
   # If something is using it, kill the process or change port
   ```

**In Production (Vercel):**

1. **Check Vercel Build Logs**
   - Go to Vercel Dashboard
   - Click on your project
   - Click on latest deployment
   - Check "Building" logs
   - Look for "Person ID Report built successfully"

2. **Verify Build Output**
   - Build logs should show:
     ```
     ✅ Main app built successfully
     ✅ Person ID Report built successfully
     ✅ Person ID Report copied successfully
     ```

3. **Check if files exist**
   - In Vercel deployment, check if `/person-id-report/` path exists
   - Try accessing directly: `https://your-site.vercel.app/person-id-report/`

### Issue 3: Blank Page (Loads but Nothing Shows)

**Symptoms:**
- New tab opens
- Page is blank/white
- No content visible

**Solutions:**

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Common errors:
     - Module not found
     - Failed to fetch
     - CORS errors

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Reload the page
   - Look for failed requests (red)
   - Check if assets are loading

3. **Verify Build**
   ```bash
   # Rebuild locally
   npm run build:all
   
   # Check if person-id-report folder exists
   ls build/person-id-report/
   
   # Should see: index.html, assets/, etc.
   ```

### Issue 4: Works Locally but Not on Vercel

**Symptoms:**
- Works fine with `npm run start:all`
- Doesn't work on deployed Vercel site

**Solutions:**

1. **Check Vercel Configuration**
   - Verify `vercel.json` exists in root
   - Build command should be: `npm run build:all`
   - Output directory should be: `build`

2. **Rebuild on Vercel**
   - Go to Vercel Dashboard
   - Click "Redeploy"
   - Watch build logs carefully

3. **Check Environment**
   - Sidebar.js checks `process.env.NODE_ENV`
   - In production, it should use `/person-id-report/index.html`
   - Check console log: "Opening Person ID Report: { isDevelopment: false, url: '/person-id-report/index.html' }"

4. **Verify Path**
   - Try accessing directly: `https://your-site.vercel.app/person-id-report/index.html`
   - If 404, the build didn't copy files correctly

### Issue 5: Build Fails

**Symptoms:**
- `npm run build:all` fails
- Error messages during build

**Solutions:**

1. **Check Dependencies**
   ```bash
   # Reinstall everything
   npm run setup
   ```

2. **Check for Missing Files**
   - Verify `person-id-report` folder exists
   - Verify `build-all.js` exists
   - Verify `fs-extra` is installed

3. **Check Node Version**
   ```bash
   node --version
   # Should be 14.x or higher
   ```

4. **Manual Build Test**
   ```bash
   # Build main app
   npm run build
   
   # Build person-id-report
   cd person-id-report
   npm run build
   cd ..
   
   # Check outputs
   ls build/
   ls person-id-report/dist/
   ```

## Quick Diagnostic Commands

```bash
# 1. Check if button exists
# Open browser console and run:
document.querySelector('.tool-button')

# 2. Check environment
console.log(process.env.NODE_ENV)

# 3. Test URL manually
# In development:
window.open('http://localhost:5173', '_blank')

# In production:
window.open('/person-id-report/index.html', '_blank')

# 4. Check if person-id-report is accessible
# In browser, go to:
# Development: http://localhost:5173
# Production: https://your-site.vercel.app/person-id-report/
```

## Still Not Working?

### Collect This Information:

1. **Environment:**
   - [ ] Local development or Vercel?
   - [ ] Browser and version?
   - [ ] Operating system?

2. **Error Messages:**
   - [ ] Console errors (screenshot)
   - [ ] Network errors (screenshot)
   - [ ] Build errors (copy text)

3. **What Happens:**
   - [ ] Nothing happens when clicking button?
   - [ ] New tab opens but shows 404?
   - [ ] New tab opens but blank page?
   - [ ] Other (describe)?

4. **Verification:**
   ```bash
   # Run these and share output:
   npm run build:all
   ls build/person-id-report/
   cat vercel.json
   ```

### Alternative: Use Direct Link

If button still doesn't work, you can use a direct link instead:

**Update Sidebar.js:**
```javascript
<a 
  href={isDevelopment ? 'http://localhost:5173' : '/person-id-report/index.html'}
  target="_blank" 
  rel="noopener noreferrer"
  className="tool-link"
>
  Open Tool →
</a>
```

This changes the button to a regular link, which may work better in some browsers.

## Contact Support

If none of these solutions work:
1. Check the console for errors
2. Check Vercel build logs
3. Share error messages
4. Describe exactly what happens when you click the button

---

**Need more help?** Check:
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `INTEGRATION_GUIDE.md` - Technical details
- `QUICK_START.md` - Setup guide
