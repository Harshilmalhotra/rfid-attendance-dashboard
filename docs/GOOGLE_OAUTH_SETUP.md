# Google OAuth Setup Guide for RFID Attendance System

## Prerequisites
1. A Google Cloud project
2. Supabase project with Google Auth provider enabled

## Step 1: Google Cloud Console Setup

### 1.1 Create/Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen:
   - **App name**: RFID Attendance System
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Application home page**: Your app URL
   - **Authorized domains**: Add `<YOUR_PROJECT_ID>.supabase.co`
   - **Developer contact information**: Your email

### 1.2 Configure Scopes
Add these non-sensitive scopes:
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`

### 1.3 Create OAuth 2.0 Client ID
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: RFID Attendance Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com`
   - **Authorized redirect URIs**:
     - Get this from Supabase Dashboard > Authentication > Providers > Google
     - Usually: `https://<PROJECT_ID>.supabase.co/auth/v1/callback`

5. Save your **Client ID** and **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Via Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. Enter:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console (leave blank for Google One Tap)
5. Save

### 2.2 Via Management API (Alternative)
```bash
export SUPABASE_ACCESS_TOKEN="your-access-token"
export PROJECT_REF="your-project-ref"

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_google_enabled": true,
    "external_google_client_id": "your-google-client-id",
    "external_google_secret": "your-google-client-secret"
  }'
```

### 2.3 Local Development
Add to your `config.toml`:
```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "your-google-client-secret"
```

## Step 3: Environment Variables

Add to your `.env.local`:
```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 4: Implementation

The implementation includes:
1. Standard OAuth flow (already implemented)
2. Google One Tap integration (enhanced UX)
3. Secure nonce generation for token validation

## Testing

1. Ensure Google client ID is in `.env.local`
2. Run the application: `npm run dev`
3. Test both:
   - Standard "Continue with Google" button
   - Google One Tap (appears automatically for new users)

## Production Checklist

- [ ] Google OAuth consent screen verified (if using custom domain)
- [ ] Production URLs added to authorized origins/redirects
- [ ] Environment variables set in production
- [ ] Custom domain configured (optional)
- [ ] Test authentication flow in production

## Troubleshooting

### Common Issues:
1. **"Redirect URI mismatch"**: Check that redirect URI in Google matches Supabase exactly
2. **"Invalid client"**: Verify client ID is correct in both Google and Supabase
3. **One Tap not showing**: Ensure user isn't already logged in to Google
4. **CORS errors**: Add your domain to authorized JavaScript origins

### Debug Mode:
Add `?debug=true` to your auth URL to see detailed error messages.