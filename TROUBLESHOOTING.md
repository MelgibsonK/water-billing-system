# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 🔴 **Can't Sign In After Signup**

**Problem**: You can signup successfully but can't sign in with the same credentials.

**Solutions**:

1. **Check if email confirmation is required**:
   - Go to your Supabase dashboard → Authentication → Settings
   - If "Enable email confirmations" is ON, check your email for confirmation link
   - Click the confirmation link before trying to sign in

2. **Test your Supabase setup**:
   ```bash
   npm run test-auth
   ```

3. **Check if database trigger is working**:
   - Go to Supabase dashboard → SQL Editor
   - Run this query to check if users exist:
   ```sql
   SELECT * FROM public.users;
   ```

4. **Manual user creation** (if trigger failed):
   - The login page will now automatically create user profiles if they don't exist
   - Try signing in again - it should work now

### 🔴 **"User account not found" Error**

**Problem**: Login fails with "User account not found in system" error.

**Cause**: The database trigger didn't create the user profile automatically.

**Solution**: The updated login page now handles this automatically. Try signing in again.

### 🔴 **"Invalid credentials" Error**

**Problem**: Login fails with "Invalid credentials" error.

**Solutions**:

1. **Double-check email and password**:
   - Make sure you're using the exact same email from signup
   - Check for typos in password

2. **Check Supabase Auth**:
   - Go to Supabase dashboard → Authentication → Users
   - Verify your user exists in the auth.users table

3. **Reset password if needed**:
   - Use the "Forgot password?" link on the login page

### 🔴 **Database Connection Issues**

**Problem**: Can't connect to Supabase database.

**Solutions**:

1. **Check environment variables**:
   ```bash
   npm run setup
   ```
   - Verify `.env.local` has correct Supabase URL and anon key

2. **Check Supabase project status**:
   - Go to https://supabase.com/dashboard
   - Ensure your project is active and not paused

3. **Verify API keys**:
   - Go to Supabase dashboard → Settings → API
   - Copy the correct URL and anon key

### 🔴 **RLS Policy Errors**

**Problem**: "Row Level Security policy" errors.

**Solution**:
- Run the complete SQL schema in Supabase SQL Editor
- Make sure all RLS policies were created successfully

### 🔴 **Email Confirmation Issues**

**Problem**: Not receiving confirmation emails.

**Solutions**:

1. **Check spam folder**

2. **Verify email settings**:
   - Go to Supabase dashboard → Authentication → Settings
   - Check "Site URL" is set correctly
   - Verify redirect URLs include your domain

3. **Disable email confirmation for testing**:
   - Go to Authentication → Settings
   - Turn OFF "Enable email confirmations"
   - Users can now sign in immediately after signup

### 🔴 **Session Issues**

**Problem**: Users get logged out unexpectedly.

**Solutions**:

1. **Check session duration**:
   - Go to Supabase dashboard → Authentication → Settings
   - Adjust "JWT expiry" if needed

2. **Clear browser data**:
   - Clear cookies and local storage
   - Try signing in again

## Debug Steps

### 1. **Run the Test Script**
```bash
npm run test-auth
```

### 2. **Check Browser Console**
- Open browser developer tools (F12)
- Look for errors in the Console tab
- Check Network tab for failed requests

### 3. **Check Supabase Logs**
- Go to Supabase dashboard → Logs
- Look for authentication errors
- Check for database errors

### 4. **Verify Database Schema**
Run this in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'customers', 'meters', 'bills');

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

## Quick Fixes

### **Reset Everything**
1. Delete all users from Supabase Auth
2. Run the SQL schema again
3. Test signup and login

### **Bypass Email Confirmation**
1. Go to Supabase dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Users can sign in immediately after signup

### **Manual User Creation**
If the trigger fails, manually create a user:
```sql
INSERT INTO public.users (id, email, name, role, is_active)
VALUES (
  'user-uuid-from-auth',
  'user@example.com',
  'User Name',
  'user',
  true
);
```

## Still Having Issues?

1. **Check the setup guide**: `SETUP_SUPABASE.md`
2. **Run the test script**: `npm run test-auth`
3. **Verify your Supabase project is properly configured**
4. **Check that all SQL commands executed successfully**

The updated login page should now handle most edge cases automatically, including creating user profiles if they don't exist in the database. 