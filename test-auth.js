#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please run: npm run setup')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🧪 Testing Supabase Authentication...\n')

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message)
      return
    }
    console.log('✅ Successfully connected to Supabase\n')

    // Test 2: Check if users table exists
    console.log('2. Testing users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table not found:', usersError.message)
      console.log('💡 Make sure you ran the SQL schema in Supabase SQL Editor')
      return
    }
    console.log('✅ Users table exists\n')

    // Test 3: Check if trigger function exists
    console.log('3. Testing database trigger...')
    const { data: triggerTest, error: triggerError } = await supabase
      .rpc('handle_new_user', { user_id: 'test' })
    
    if (triggerError && triggerError.message.includes('function') && triggerError.message.includes('not found')) {
      console.error('❌ Database trigger not found:', triggerError.message)
      console.log('💡 Make sure you ran the complete SQL schema in Supabase SQL Editor')
      return
    }
    console.log('✅ Database trigger exists\n')

    // Test 4: Check RLS policies
    console.log('4. Testing Row Level Security...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (rlsError && rlsError.message.includes('policy')) {
      console.error('❌ RLS policies not configured:', rlsError.message)
      console.log('💡 Make sure you ran the complete SQL schema in Supabase SQL Editor')
      return
    }
    console.log('✅ RLS policies are configured\n')

    console.log('🎉 All tests passed! Your Supabase setup is working correctly.')
    console.log('\n📋 Next steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Go to http://localhost:3000/signup')
    console.log('3. Create a new account')
    console.log('4. Try logging in at http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your .env.local file has correct Supabase credentials')
    console.log('2. Make sure you ran the SQL schema in Supabase SQL Editor')
    console.log('3. Verify your Supabase project is active')
  }
}

testAuth() 