# 💧 Tuuru Water Management System

Welcome to **Tuuru Water Management System** – a cutting-edge, comprehensive platform designed to revolutionize water utility management in Kenya. Built with modern web technologies, Tuuru offers a seamless, efficient, and visually stunning experience for managing customers, meters, billing, and payments.

Experience a system where functionality meets elegance, with a focus on intuitive design and smooth user interactions.

## ✨ Features at a Glance

Tuuru is packed with powerful features to streamline your operations:

*   🔐 **Secure & Robust Authentication**: Powered by Supabase Auth, featuring role-based access control to ensure data integrity and secure access for all users.
*   👥 **Intuitive Customer Management**: Effortlessly register, update, and manage customer profiles with a user-friendly interface.
*   📊 **Advanced Meter Tracking**: Keep precise records of water meters and their readings, ensuring accurate consumption data.
*   💰 **Automated Billing System**: Generate bills with ease, supporting flexible tiered pricing structures for fair and transparent charges.
*   💳 **Diverse Payment Processing**: Integrate multiple payment channels including M-Pesa, Card, Bank Transfer, and Cash, offering convenience to your customers.
*   📈 **Real-time Dashboard Analytics**: Gain instant insights into your operations with dynamic charts and statistics, helping you make informed decisions.
*   📱 **Fully Responsive Design**: A beautiful and functional experience across all devices, from mobile phones to large desktop displays.
*   ⚡ **Blazing Fast Performance**: Optimized for speed with intelligent preloading and smooth page transitions, ensuring a fluid user experience.
*   🔄 **Comprehensive Activity Tracking**: Maintain a complete audit trail of all system activities, enhancing accountability and transparency.

## 🚀 Tech Stack

Crafted with the latest and greatest technologies for a modern and scalable solution:

*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
*   **Backend**: Supabase (PostgreSQL, Auth, Real-time)
*   **UI Components**: Radix UI, Lucide Icons
*   **State Management**: React Hooks
*   **Authentication**: Supabase Auth
*   **Database**: PostgreSQL with Row Level Security

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js 18+
*   npm, yarn, or pnpm
*   Supabase account
*   Git

## ⚡ Quick Start

Get Tuuru up and running in minutes!

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/MelgibsonK/water-billing-system.git
cd tuuru-water-management
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Set Up Supabase

1.  Create a new project at [supabase.com](https://supabase.com).
2.  Navigate to your project settings and copy the `Project URL` and `anon public` key.
3.  Copy the environment template:
    \`\`\`bash
    cp env.example .env.local
    \`\`\`
4.  Update `.env.local` with your Supabase credentials:
    \`\`\`env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    \`\`\`

### 4. Set Up Database

1.  Go to your Supabase project SQL editor.
2.  Run the schema file: \`supabase-schema.sql\`
3.  Run the sample data file: \`scripts/sample-data.sql\`

### 5. Start Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see Tuuru in action!

## 🗄️ Database Schema

The system is built upon a robust PostgreSQL database with the following core tables:

*   **users**: Manages admin and staff accounts.
*   **customers**: Stores comprehensive customer information.
*   **meters**: Details about water meters.
*   **meter_readings**: Records of meter readings over time.
*   **bills**: Generated billing records.
*   **payments**: Tracks all payment transactions.
*   **activity_log**: A complete audit trail of system activities.
*   **rate_structures**: Configures billing rate tiers.
*   **system_settings**: Stores application-wide settings.

## 🔑 Authentication Flow

Tuuru ensures a secure and streamlined authentication process:

### Admin Setup Process

1.  **Initial Admin Creation**: Add admin email and name directly to the \`users\` table.
2.  **Password Reset Flow**: The admin initiates a password reset via \`/forgot-password\`, receives an email with a reset link, and sets a new password at \`/reset-password\`.
3.  **Login Process**: Admins log in with their email and password, which are validated against Supabase Auth, leading to a secure redirection to the dashboard with session data.

## 📂 File Structure

A well-organized and intuitive file structure for easy navigation and development:

\`\`\`
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
\`\`\`

## 🧩 Key Components

Highlighting the essential building blocks of Tuuru:

### Dashboard Components

*   **DashboardHeader**: Provides navigation and user menu access.
*   **QuickActions**: Buttons for common, frequently used tasks.
*   **RecentActivity**: A real-time feed of system activities.
*   **StatsCards**: Displays key performance indicators and statistics.
*   **CustomerOverview**: Interface for managing customer information.
*   **BillingOverview**: Manages billing and payment processes.

### Authentication Components

*   **LoginForm**: Handles user authentication.
*   **ForgotPassword**: Initiates the password reset request.
*   **ResetPassword**: Allows users to set a new password.
*   **Preloader**: Manages loading states and smooth transitions.

## ⚙️ Environment Variables

Configure your Tuuru instance with these variables:

**Required:**

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

**Optional (for extended features):**

\`\`\`env
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
\`\`\`

## 🌐 API Endpoints

Leveraging Supabase's auto-generated REST API for seamless data interaction:

*   \`GET /api/customers\`: Retrieve a list of customers.
*   \`POST /api/customers\`: Create a new customer.
*   \`GET /api/meters\`: Retrieve a list of meters.
*   \`POST /api/meters\`: Create a new meter.
*   \`GET /api/bills\`: Retrieve a list of bills.
*   \`POST /api/bills\`: Generate a new bill.
*   \`GET /api/payments\`: Retrieve a list of payments.
*   \`POST /api/payments\`: Record a new payment.

## 🔒 Security Features

Security is paramount in Tuuru, implemented with best practices:

*   **Row Level Security (RLS)**: Granular, database-level access control.
*   **JWT Authentication**: Secure token-based authentication for all sessions.
*   **Password Hashing**: Industry-standard Bcrypt encryption for all passwords.
*   **Activity Logging**: A comprehensive audit trail for all system actions.
*   **Input Validation**: Robust server-side validation to prevent malicious inputs.
*   **CORS Protection**: Safeguards against cross-origin request vulnerabilities.

## 🚀 Performance Optimizations

Engineered for speed and efficiency:

*   **Page Preloading**: Dashboard content preloads during login for instant access.
*   **Lazy Loading**: Components load on demand, reducing initial load times.
*   **Image Optimization**: Utilizes Next.js's built-in image optimization.
*   **Caching**: Leverages Supabase query caching for faster data retrieval.
*   **Code Splitting**: Automatic bundle splitting for optimized resource loading.

## ☁️ Deployment

Deploying Tuuru is straightforward and flexible:

### Vercel (Recommended)

1.  Connect your GitHub repository to Vercel.
2.  Add your environment variables in the Vercel dashboard.
3.  Enjoy automatic deployments on every push to your main branch!

### Other Platforms

Tuuru can be deployed to any platform that supports Next.js, including:

*   Netlify
*   Railway
*   DigitalOcean App Platform
*   AWS Amplify

## ✅ Testing

Ensure the system's integrity with comprehensive testing:

\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## 🤝 Contributing

We welcome contributions to make Tuuru even better!

1.  Fork the repository.
2.  Create a new feature branch (\`git checkout -b feature/your-feature-name\`).
3.  Make your changes and ensure they adhere to our coding standards.
4.  Add tests if applicable.
5.  Submit a pull request with a clear description of your changes.

## 📄 License

This project is licensed under the MIT License. See the \`LICENSE\` file for full details.

## 📞 Support

Need help or have questions? We're here for you!

*   **Email**: support@tuuru.com
*   **Phone**: +254 700 000 000
*   **Documentation**: [docs.tuuru.com](https://docs.tuuru.com)

## 🗺️ Roadmap

Our vision for the future of Tuuru:

*   [ ] Mobile app (React Native)
*   [ ] Advanced analytics dashboard
*   [ ] Integration with M-Pesa API
*   [ ] SMS notifications
*   [ ] Multi-language support
*   [ ] Advanced reporting
*   [ ] Customer portal
*   [ ] API documentation
*   [ ] Unit and integration tests
*   [ ] CI/CD pipeline

## 🗓️ Changelog

### v1.0.0 (2024-01-15)

*   Initial release
*   Complete authentication system
*   Dashboard with real-time data
*   Customer and meter management
*   Billing and payment system
*   Activity logging
*   Responsive design
*   Performance optimizations
