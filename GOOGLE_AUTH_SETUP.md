# Google Authentication Setup Guide

This guide will help you configure Google OAuth authentication for your Collection Summary application.

## Prerequisites

- Supabase project: `nseykgyfbakvthrymuoe.supabase.co`
- Google Cloud Console account
- Your application URLs:
  - Local: `http://localhost:3000`
  - Production: `https://rezaulkarim.shop`

## Step 1: Configure Google Cloud Console

### 1.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in required fields:
     - App name: `Collection Summary by Reza`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Skip scopes (click **Save and Continue**)
   - Add test users if needed
   - Click **Save and Continue**

### 1.2 Create OAuth Client ID

1. Application type: **Web application**
2. Name: `Collection Summary Web App`
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://rezaulkarim.shop
   ```
4. **Authorized redirect URIs:**
   ```
   https://nseykgyfbakvthrymuoe.supabase.co/auth/v1/callback
   ```
5. Click **Create**
6. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these in the next step

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **HireSummary** (`nseykgyfbakvthrymuoe`)
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand
5. Toggle **Enable Sign in with Google** to ON
6. Fill in the credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
7. **Site URL**: `https://rezaulkarim.shop`
8. **Redirect URLs**: Add both:
   ```
   http://localhost:3000
   https://rezaulkarim.shop
   ```
9. Click **Save**

### 2.2 Verify Database Table

The `user_profiles` table is already created with the following structure:
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `area_name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Step 3: Test Authentication

### 3.1 Local Testing

1. Start the development server:
   ```bash
   npm start
   ```
2. Open `http://localhost:3000` in your browser
3. You should see the authentication page
4. Click **Sign Up** tab
5. Select your area from the dropdown
6. Click **Sign Up with Google**
7. Complete the Google sign-in flow
8. You should be redirected back and see your personalized dashboard

### 3.2 Production Testing

1. Build and deploy to production:
   ```bash
   npm run build:all
   git add .
   git commit -m "Add Google authentication with area selection"
   git push origin dev
   ```
2. Visit `https://rezaulkarim.shop`
3. Test the same sign-up flow

## Step 4: Verify User Profile Creation

After signing in, verify that the user profile was created:

1. Go to Supabase Dashboard → **Table Editor**
2. Select `user_profiles` table
3. You should see your user record with:
   - Your Google account ID
   - Your email
   - Your selected area
   - Creation timestamp

## Features Implemented

### ✅ Authentication Flow
- Google OAuth sign-in/sign-up
- Area selection during sign-up (45 areas available)
- Session management with Supabase
- Automatic profile creation

### ✅ User Experience
- Users must sign in to access the webapp
- No unauthenticated access allowed
- Personalized dashboard showing user's area
- Sign-out functionality

### ✅ My Area Report
- Automatically displayed after file upload
- Shows only plazas from user's selected area
- Plaza-wise breakdown with:
  - Card collection
  - Collection percentages (Qty & Amt)
  - Overdue changes
- Summary cards with area totals

### ✅ Header Updates
- Displays user's area name
- Sign-out button
- Maintains existing save and statistics buttons

## Troubleshooting

### Issue: "Invalid redirect URL"
**Solution:** Ensure the redirect URL in Google Cloud Console exactly matches:
```
https://nseykgyfbakvthrymuoe.supabase.co/auth/v1/callback
```

### Issue: "OAuth consent screen not configured"
**Solution:** Complete the OAuth consent screen configuration in Google Cloud Console before creating credentials.

### Issue: User profile not created
**Solution:** Check browser console for errors. Ensure the `user_profiles` table has proper permissions in Supabase.

### Issue: "Please sign up and select your area" alert
**Solution:** This means the user signed in but no area was selected during sign-up. Sign out and use the Sign Up tab with area selection.

## Security Notes

- The Supabase anon key is safe to use in client-side code
- Row Level Security (RLS) should be enabled on `user_profiles` table for production
- Google OAuth credentials should be kept secure
- Never commit OAuth secrets to version control

## Next Steps

1. **Enable RLS on user_profiles table:**
   ```sql
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   
   -- Allow users to read their own profile
   CREATE POLICY "Users can view own profile"
   ON user_profiles FOR SELECT
   USING (auth.uid() = id);
   
   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile"
   ON user_profiles FOR UPDATE
   USING (auth.uid() = id);
   ```

2. **Test with multiple users** to ensure area filtering works correctly

3. **Monitor authentication logs** in Supabase Dashboard → Authentication → Logs

4. **Consider adding email verification** for additional security

## Support

If you encounter any issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for JavaScript errors
3. Verify Google OAuth credentials are correct
4. Ensure redirect URLs match exactly

---

**Made with ❤️ by Md. Rezaul Karim RCM**
