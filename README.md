# Tuuru Water Management System

A comprehensive water management platform built with Next.js, TypeScript, and Supabase for water utilities in Kenya.

## Features

- 🔐 **Secure Authentication** - Supabase Auth with role-based access control
- 👥 **Customer Management** - Complete customer registration and management
- 📊 **Meter Management** - Track water meters and readings
- 💰 **Billing System** - Automated bill generation with tiered pricing
- 💳 **Payment Processing** - Multiple payment methods (M-Pesa, Card, Bank Transfer, Cash)
- 📈 **Dashboard Analytics** - Real-time statistics and insights
- 📱 **Responsive Design** - Mobile and desktop optimized
- ⚡ **Fast Performance** - Preloading and optimized page transitions
- 🔄 **Activity Tracking** - Complete audit trail of all system activities

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Hooks
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MelgibsonK/water-billing-system
cd tuuru-water-management
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy the URL and anon key
3. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Set Up Database

1. Go to your Supabase project SQL editor
2. Run the schema file: `supabase-schema.sql`
3. Run the sample data file: `scripts/sample-data.sql`

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system includes the following main tables:

- **users** - Admin and staff accounts
- **customers** - Customer information
- **meters** - Water meter details
- **meter_readings** - Meter reading records
- **bills** - Generated bills
- **payments** - Payment records
- **activity_log** - System activity tracking
- **rate_structures** - Billing rate configurations
- **system_settings** - Application settings

## Authentication Flow

### Admin Setup Process

1. **Initial Admin Creation**: 
   - Add admin email and name to the `users` table
   - Admin must use "Forgot Password" to set initial password

2. **Password Reset Flow**:
   - Admin requests password reset via `/forgot-password`
   - Receives email with reset link
   - Sets new password at `/reset-password`

3. **Login Process**:
   - Admin logs in with email and password
   - System validates against Supabase Auth
   - Redirects to dashboard with session data

## File Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── forgot-password/  # Password reset request
│   └── reset-password/   # Password reset form
├── components/           # React components
│   ├── dashboard/       # Dashboard-specific components
│   └── ui/             # Reusable UI components
├── lib/                 # Utility libraries
│   └── supabase.ts     # Supabase client and types
├── scripts/            # Database scripts
├── styles/             # Global styles
└── public/             # Static assets
```

## Key Components

### Dashboard Components

- **DashboardHeader** - Navigation and user menu
- **QuickActions** - Quick action buttons for common tasks
- **RecentActivity** - Real-time activity feed
- **StatsCards** - Dashboard statistics
- **CustomerOverview** - Customer management interface
- **BillingOverview** - Billing and payment interface

### Authentication Components

- **LoginForm** - User authentication
- **ForgotPassword** - Password reset request
- **ResetPassword** - Password reset form
- **Preloader** - Loading states and transitions

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional variables for additional features:

```env
# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment gateway (M-Pesa)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox
```

## API Endpoints

The system uses Supabase's auto-generated REST API:

- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/meters` - List meters
- `POST /api/meters` - Create meter
- `GET /api/bills` - List bills
- `POST /api/bills` - Generate bill
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

## Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt password encryption
- **Activity Logging** - Complete audit trail
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin request security

## Performance Optimizations

- **Page Preloading** - Dashboard preloads during login
- **Lazy Loading** - Components load on demand
- **Image Optimization** - Next.js image optimization
- **Caching** - Supabase query caching
- **Code Splitting** - Automatic bundle splitting

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Email: support@tuuru.com
- Phone: +254 700 000 000
- Documentation: [docs.tuuru.com](https://docs.tuuru.com)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with M-Pesa API
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Customer portal
- [ ] API documentation
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Complete authentication system
- Dashboard with real-time data
- Customer and meter management
- Billing and payment system
- Activity logging
- Responsive design
- Performance optimizations 
