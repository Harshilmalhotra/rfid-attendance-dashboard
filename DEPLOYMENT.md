# Deployment Guide

## Environment Variables

For production deployment, you need to set the following environment variables:

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_API_URL`: API endpoint (usually `/api`)

### Important Notes
- **DO NOT** set `NEXT_PUBLIC_DISABLE_AUTH=true` in production
- The auth bypass only works in development mode
- Authentication is always enforced in production

## Supabase Setup

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Enable Google OAuth (optional)
   - Set your site URL in Authentication > URL Configuration
   - Add redirect URLs:
     - `https://yourdomain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for local development)

3. **Database Setup**
   - Ensure your database tables are created
   - Check that Row Level Security (RLS) is properly configured

## Deployment Platforms

### Vercel
1. Import your GitHub repository
2. Add environment variables in the Vercel dashboard
3. Deploy

### Other Platforms
1. Build the project: `npm run build`
2. Set environment variables
3. Start the server: `npm start`

## Troubleshooting

### Auth Not Working
1. Check environment variables are set correctly
2. Verify Supabase project is active
3. Check browser console for errors
4. Ensure redirect URLs are configured in Supabase

### Session Issues
1. Clear browser cookies
2. Check Supabase dashboard for auth logs
3. Verify JWT expiry settings

## Local Development

For local development without auth:
```bash
# In .env.local
NEXT_PUBLIC_DISABLE_AUTH=true
```

This will bypass authentication only in development mode.