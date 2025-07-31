#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase environment variables...\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Please update it manually with your Supabase credentials.\n');
  console.log('Required variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n');
} else {
  // Create .env.local template
  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project dashboard
# https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example:
# NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
  console.log('📝 Please update .env.local with your actual Supabase credentials\n');
}

console.log('📋 Next steps:');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Copy your project URL and anon key from Settings > API');
console.log('3. Update .env.local with your credentials');
console.log('4. Run the SQL schema from supabase-schema.sql in your Supabase SQL editor');
console.log('5. Start your development server: npm run dev');
console.log('6. Test signup at http://localhost:3000/signup\n');

console.log('📖 For detailed instructions, see SETUP_SUPABASE.md'); 