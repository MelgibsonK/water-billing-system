# Supabase Setup Guide

## Overview
This guide will help you set up the new simplified Supabase authentication system that allows all emails to signup.

## Prerequisites
1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key

## Step 1: Environment Variables
Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Database Schema
Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

## Step 3: Authentication Settings
Configure Supabase authentication:

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Enable email confirmations" (recommended for production)
3. Set your site URL (e.g., `http://localhost:3000` for development)
4. Configure redirect URLs:
   - `http://localhost:3000/login` (for development)
   - `http://localhost:3000/reset-password` (for password reset)

## Step 4: Email Templates (Optional)
Customize email templates in Authentication > Email Templates:

1. **Confirm signup**: Welcome users and confirm their email
2. **Reset password**: Allow users to reset their password
3. **Magic link**: Alternative login method

## Step 5: Test the Setup
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/signup`
3. Create a new account with any email
4. Check your email for confirmation (if enabled)
5. Sign in at `http://localhost:3000/login`

## Key Features of the New System

### ✅ Open Signup
- Any email can create an account
- No pre-authorization required
- Default role: 'user'

### ✅ Automatic User Profile Creation
- Database trigger automatically creates user profile
- User data stored in `public.users` table
- Links to Supabase `auth.users`

### ✅ Email Confirmation
- Users receive confirmation emails
- Account activation required before login
- Secure email verification

### ✅ Role-Based Access
- Three roles: 'admin', 'manager', 'user'
- Admins can manage all users
- Row Level Security (RLS) policies in place

### ✅ Activity Logging
- All signups and logins are logged
- Track user activity for security
- IP address and user agent tracking

## Database Tables Created

1. **users** - User profiles (extends auth.users)
2. **customers** - Customer information
3. **meters** - Water meters
4. **bills** - Billing records
5. **payments** - Payment transactions
6. **meter_readings** - Meter reading records
7. **activity_log** - User activity tracking

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have full access to all data
- Secure password handling
- Email verification required

## Troubleshooting

### Common Issues

1. **"User account not found" error**
   - Check if the database trigger is working
   - Verify the `handle_new_user()` function exists

2. **Email confirmation not working**
   - Check Supabase email settings
   - Verify redirect URLs are correct
   - Check spam folder

3. **RLS policies blocking access**
   - Ensure user is authenticated
   - Check user role permissions
   - Verify RLS policies are correctly applied

### Debug Steps

1. Check Supabase logs in the dashboard
2. Verify environment variables are loaded
3. Test database connections
4. Check browser console for errors

## Production Deployment

1. Update environment variables with production URLs
2. Configure production email settings
3. Set up proper redirect URLs
4. Enable additional security features
5. Monitor logs and activity

## Support

If you encounter issues:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Verify all SQL commands executed successfully
4. Test with a fresh database if needed 