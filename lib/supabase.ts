import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'manager' | 'user'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string
  city: string | null
  postal_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Meter {
  id: string
  meter_number: string
  customer_id: string
  meter_type: string
  installation_date: string
  last_reading: number
  last_reading_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  bill_number: string
  customer_id: string
  meter_id: string
  billing_period_start: string
  billing_period_end: string
  previous_reading: number
  current_reading: number
  consumption: number
  rate_per_unit: number
  total_amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  generated_by: string | null
  generated_at: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  payment_number: string
  bill_id: string
  customer_id: string
  amount: number
  payment_method: 'mpesa' | 'card' | 'bank_transfer' | 'cash'
  transaction_id: string | null
  payment_date: string
  processed_by: string | null
  notes: string | null
  created_at: string
}

export interface MeterReading {
  id: string
  meter_id: string
  reading_value: number
  reading_date: string
  recorded_by: string | null
  notes: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  activity_type: 'login' | 'logout' | 'signup' | 'customer_added' | 'customer_updated' | 'reading_recorded' | 'bill_generated' | 'payment_received' | 'settings_updated'
  description: string
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface DashboardStats {
  total_revenue: number
  total_customers: number
  pending_bills: number
  avg_usage: number
}

// Auth utilities - Simplified for open signup
export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Database utilities - Simplified for new authentication flow
export const db = {
  // Users - Now works with Supabase auth users
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    return { data, error }
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    return { data, error }
  },

  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    return { data, error }
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Dashboard Stats
  async getDashboardStats() {
    try {
      // Get total customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('is_active', true)

      // Get current month's revenue from payments
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
      
      console.log('Dashboard Stats - Date Range:', { startOfMonth, endOfMonth })
      
      // First, get all payments to see what we have
      const { data: allPayments, error: allPaymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date, created_at')
      
      console.log('Dashboard Stats - All payments:', allPayments?.length || 0)
      console.log('Dashboard Stats - All payments data:', allPayments)
      
      // Then filter for current month using created_at (more reliable)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date, created_at')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)

      console.log('Dashboard Stats - Current month payments found:', payments?.length || 0)
      console.log('Dashboard Stats - Current month payments data:', payments)

      // Get pending bills
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')

      // Get average usage from meter readings
      const { data: readings, error: readingsError } = await supabase
        .from('meter_readings')
        .select('reading_value')

      // Calculate stats
      const currentMonthRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
      const totalCustomers = customers?.length || 0
      const pendingBills = bills?.length || 0
      const avgUsage = readings && readings.length > 0 
        ? readings.reduce((sum, reading) => sum + (reading.reading_value || 0), 0) / readings.length 
        : 0

      console.log('Dashboard Stats - Calculated revenue:', currentMonthRevenue)

      const stats: DashboardStats = {
        total_revenue: currentMonthRevenue,
        total_customers: totalCustomers,
        pending_bills: pendingBills,
        avg_usage: avgUsage
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return { 
        data: {
          total_revenue: 0,
          total_customers: 0,
          pending_bills: 0,
          avg_usage: 0
        }, 
        error 
      }
    }
  },

  // Recent Activities
  async getRecentActivities(limit: number = 10) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getCustomer(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createCustomer(customerData: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()
    return { data, error }
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deleteCustomer(id: string) {
    try {
      // First check if customer has any related data
      const { data: meters } = await supabase
        .from('meters')
        .select('id')
        .eq('customer_id', id)
      
      const { data: bills } = await supabase
        .from('bills')
        .select('id')
        .eq('customer_id', id)
      
      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('customer_id', id)

      // If customer has related data, we should handle this appropriately
      if (meters && meters.length > 0 || bills && bills.length > 0 || payments && payments.length > 0) {
        console.warn('Customer has related data that will be cascaded:', {
          meters: meters?.length || 0,
          bills: bills?.length || 0,
          payments: payments?.length || 0
        })
      }

      // Delete the customer (cascade will handle related data)
      const { data, error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error in deleteCustomer:', error)
      return { data: null, error }
    }
  },

  // Meters
  async getMeters() {
    const { data, error } = await supabase
      .from('meters')
      .select(`
        *,
        customers (
          id,
          customer_number,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getMeter(id: string) {
    const { data, error } = await supabase
      .from('meters')
      .select(`
        *,
        customers (
          id,
          customer_number,
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createMeter(meterData: Partial<Meter>) {
    const { data, error } = await supabase
      .from('meters')
      .insert(meterData)
      .select()
      .single()
    return { data, error }
  },

  async updateMeter(id: string, updates: Partial<Meter>) {
    const { data, error } = await supabase
      .from('meters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Bills
  async getBills() {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        customers (
          id,
          customer_number,
          first_name,
          last_name
        ),
        meters (
          id,
          meter_number
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getBill(id: string) {
    const { data, error } = await supabase
      .from('bills')
      .select(`
        *,
        customers (
          id,
          customer_number,
          first_name,
          last_name
        ),
        meters (
          id,
          meter_number
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createBill(billData: Partial<Bill>) {
    const { data, error } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single()
    return { data, error }
  },

  async updateBill(id: string, updates: Partial<Bill>) {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Payments
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bills (
          id,
          bill_number
        ),
        customers (
          id,
          customer_number,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getPayment(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bills (
          id,
          bill_number,
          total_amount,
          due_date
        ),
        customers (
          id,
          customer_number,
          first_name,
          last_name,
          email,
          phone,
          address,
          city
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createPayment(paymentData: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    return { data, error }
  },

  // Meter Readings
  async getMeterReadings() {
    const { data, error } = await supabase
      .from('meter_readings')
      .select(`
        *,
        meters (
          id,
          meter_number,
          customers (
            id,
            customer_number,
            first_name,
            last_name
          )
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createMeterReading(readingData: Partial<MeterReading>) {
    const { data, error } = await supabase
      .from('meter_readings')
      .insert(readingData)
      .select()
      .single()
    return { data, error }
  },

  // Activity Log
  async logActivity(activityData: Partial<ActivityLog>) {
    const { data, error } = await supabase
      .from('activity_log')
      .insert(activityData)
      .select()
      .single()
    return { data, error }
  }
} 