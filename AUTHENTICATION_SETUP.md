# 🔐 **Tuuru Authentication System Setup Guide**

## **Overview**
This guide will help you set up the new authentication system for Tuuru Water Management Platform. The system now supports:
- ✅ **Authorized Email Signup**: Only pre-approved emails can create accounts
- ✅ **Role-Based Access**: Admin, Manager, and Reader roles
- ✅ **Secure Login**: Supabase Auth integration
- ✅ **Password Reset**: Self-service password recovery
- ✅ **Activity Logging**: Track all user actions

---

## **🚀 Quick Start**

### **Step 1: Update Database Schema**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the updated `supabase-schema.sql` file
4. This creates the new tables and policies

### **Step 2: Add Authorized Emails**
Run this SQL to add your authorized emails:

```sql
-- Add your authorized emails (replace with actual emails)
INSERT INTO authorized_emails (email, role, name) VALUES 
('your-email@example.com', 'admin', 'Your Name'),
('manager@yourcompany.com', 'manager', 'Manager Name'),
('reader@yourcompany.com', 'reader', 'Reader Name');
```

### **Step 3: Test the System**
1. Start your development server: `npm run dev`
2. Go to `/signup` to create accounts
3. Go to `/login` to sign in
4. Test password reset at `/forgot-password`

---

## **📋 Detailed Setup Instructions**

### **1. Database Schema Update**

The new schema includes:

#### **New Tables:**
- `authorized_emails` - Pre-approved emails for signup
- `pending_users` - Users who signed up but haven't confirmed
- Updated `users` table - Works with Supabase Auth

#### **Key Features:**
- **Row Level Security (RLS)** - Secure data access
- **Role-based permissions** - Admin, Manager, Reader
- **Activity logging** - Track all user actions
- **Email authorization** - Control who can sign up

### **2. Adding Authorized Users**

#### **Method 1: Direct Database Insert**
```sql
-- Add authorized emails
INSERT INTO authorized_emails (email, role, name) VALUES 
('admin@tuuru.com', 'admin', 'System Administrator'),
('manager@tuuru.com', 'manager', 'System Manager'),
('reader@tuuru.com', 'reader', 'System Reader');
```

#### **Method 2: Admin Panel (Future)**
- Admins can add authorized emails through the dashboard
- Send invitations via email
- Manage user roles and permissions

### **3. User Signup Process**

1. **User visits `/signup`**
2. **Enters authorized email** - System checks if email is approved
3. **Fills in details** - Name, password, confirm password
4. **Account creation** - Creates Supabase Auth user + database record
5. **Email confirmation** - User confirms email (if required)
6. **Login access** - User can now sign in

### **4. User Login Process**

1. **User visits `/login`**
2. **Enters credentials** - Email and password
3. **Supabase Auth verification** - Checks credentials
4. **Database verification** - Ensures user exists and is active
5. **Session creation** - Stores user data in localStorage
6. **Dashboard access** - Redirects to main application

### **5. Password Reset Process**

1. **User visits `/forgot-password`**
2. **Enters email** - Must be a registered user
3. **Reset email sent** - Supabase sends reset link
4. **User clicks link** - Goes to `/reset-password`
5. **New password set** - User creates new password
6. **Login access** - User can sign in with new password

---

## **👥 User Roles & Permissions**

### **Admin Role**
- ✅ **Full system access**
- ✅ **Manage all users**
- ✅ **Add/remove authorized emails**
- ✅ **View all data and reports**
- ✅ **System configuration**

### **Manager Role**
- ✅ **Customer management**
- ✅ **Meter management**
- ✅ **Bill generation**
- ✅ **Payment processing**
- ✅ **Reading management**
- ✅ **Reports access**

### **Reader Role**
- ✅ **View customers**
- ✅ **View meters**
- ✅ **View bills**
- ✅ **View payments**
- ✅ **View readings**
- ✅ **Basic reports**

---

## **🔧 Configuration**

### **Environment Variables**
Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Supabase Settings**
1. **Authentication → Settings**
   - Enable email confirmations (optional)
   - Set redirect URLs
   - Configure password policies

2. **Authentication → Email Templates**
   - Customize signup confirmation email
   - Customize password reset email

---

## **🛡️ Security Features**

### **Row Level Security (RLS)**
- Users can only access their own data
- Role-based data access
- Secure API endpoints

### **Authentication Security**
- Supabase Auth integration
- Secure password hashing
- Session management
- CSRF protection

### **Data Protection**
- Email authorization required
- Account deactivation support
- Activity logging
- Audit trails

---

## **🚨 Troubleshooting**

### **Common Issues**

#### **1. "Email not authorized" Error**
**Problem**: User tries to sign up with unauthorized email
**Solution**: Add email to `authorized_emails` table

```sql
INSERT INTO authorized_emails (email, role, name) 
VALUES ('user@example.com', 'reader', 'User Name');
```

#### **2. "Invalid credentials" Error**
**Problem**: User can't log in despite correct password
**Solution**: Check if user exists in both Auth and database

```sql
-- Check if user exists in database
SELECT * FROM users WHERE email = 'user@example.com';

-- Check if user is active
SELECT email, is_active, role FROM users WHERE email = 'user@example.com';
```

#### **3. "Account deactivated" Error**
**Problem**: User account is inactive
**Solution**: Reactivate the account

```sql
UPDATE users SET is_active = true WHERE email = 'user@example.com';
```

#### **4. Password Reset Not Working**
**Problem**: Reset emails not received
**Solution**: Check Supabase email settings

1. Go to **Authentication → Settings**
2. Verify email provider is configured
3. Check spam folder
4. Test with different email

#### **5. Database Connection Issues**
**Problem**: Can't connect to database
**Solution**: Verify environment variables

```bash
# Check if variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Debug Queries**

#### **Check User Status**
```sql
-- Check if user exists and is active
SELECT 
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.created_at,
    ae.email as authorized_email,
    ae.role as authorized_role
FROM users u
LEFT JOIN authorized_emails ae ON u.email = ae.email
WHERE u.email = 'user@example.com';
```

#### **Check Authorized Emails**
```sql
-- List all authorized emails
SELECT 
    email,
    role,
    name,
    is_used,
    created_at
FROM authorized_emails
ORDER BY created_at DESC;
```

#### **Check Recent Activity**
```sql
-- View recent login activity
SELECT 
    al.activity_type,
    al.description,
    al.created_at,
    u.email
FROM activity_log al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.activity_type IN ('login', 'signup')
ORDER BY al.created_at DESC
LIMIT 10;
```

---

## **📊 Testing Checklist**

### **Signup Flow**
- [ ] Unauthorized email shows error
- [ ] Authorized email allows signup
- [ ] Password validation works
- [ ] Account creation successful
- [ ] Email confirmation sent (if enabled)
- [ ] User can log in after signup

### **Login Flow**
- [ ] Valid credentials work
- [ ] Invalid credentials show error
- [ ] Deactivated account shows error
- [ ] Session persists after refresh
- [ ] Logout works correctly

### **Password Reset**
- [ ] Reset email sent
- [ ] Reset link works
- [ ] New password accepted
- [ ] Can login with new password

### **Role Permissions**
- [ ] Admin can access all features
- [ ] Manager has appropriate access
- [ ] Reader has limited access
- [ ] Unauthorized actions blocked

---

## **🔄 Maintenance**

### **Regular Tasks**
1. **Monitor activity logs** - Check for suspicious activity
2. **Review authorized emails** - Remove unused entries
3. **Update user roles** - Adjust permissions as needed
4. **Backup database** - Regular backups
5. **Update dependencies** - Keep packages current

### **User Management**
```sql
-- Deactivate user
UPDATE users SET is_active = false WHERE email = 'user@example.com';

-- Change user role
UPDATE users SET role = 'manager' WHERE email = 'user@example.com';

-- Remove authorized email
DELETE FROM authorized_emails WHERE email = 'user@example.com';
```

---

## **📞 Support**

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review Supabase logs** in dashboard
3. **Check browser console** for errors
4. **Verify environment variables**
5. **Test with different browser/incognito**

---

## **🎉 Success!**

Once everything is working:

1. ✅ **Users can sign up** with authorized emails
2. ✅ **Users can log in** securely
3. ✅ **Password reset** works
4. ✅ **Role permissions** are enforced
5. ✅ **Activity logging** tracks actions
6. ✅ **Security policies** protect data

Your Tuuru Water Management Platform is now ready for production! 🚀 