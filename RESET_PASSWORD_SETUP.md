# Reset Password Configuration

## Issue Fixed

The reset password links were using `localhost` instead of your actual domain. This has been fixed by updating the `resetPassword` function in `lib/supabase.ts`.

## Configuration Required

### 1. Environment Variables

Update your `.env.local` file with your actual domain:

```bash
# For development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production (replace with your actual domain)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Supabase Configuration

In your Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://your-domain.com`)
3. Add your reset password URL to **Redirect URLs**:
   - `https://your-domain.com/reset-password`
   - `http://localhost:3000/reset-password` (for development)

### 3. Email Templates (Optional)

You can customize the reset password email template in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password**
3. Customize the email content and styling

## How It Works

1. User requests password reset from the login page
2. Supabase sends an email with a reset link
3. The link now uses your configured domain instead of localhost
4. User clicks the link and is taken to your reset password page
5. User enters new password and is redirected to login

## Testing

- **Development**: Links will use `http://localhost:3000`
- **Production**: Links will use your configured domain

## Troubleshooting

If reset links still use localhost:

1. Check that `NEXT_PUBLIC_APP_URL` is set correctly in your environment
2. Verify Supabase Site URL configuration
3. Clear browser cache and try again
4. Check that the environment variable is being loaded correctly

## Security Notes

- Reset links expire after 24 hours by default
- Links can only be used once
- Tokens are automatically invalidated after use
- Consider implementing rate limiting for reset requests 