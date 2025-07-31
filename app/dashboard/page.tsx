"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Waves, DollarSign, Users, FileText, Droplets, TrendingUp, CalendarDays, Plus, Loader2, CheckCircle, AlertCircle, User, Gauge, CreditCard, Receipt } from "lucide-react"
import { db, DashboardStats } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null)
  const [addCustomerSuccess, setAddCustomerSuccess] = useState(false)
  
  // Reading modal states
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false)
  const [isAddingReading, setIsAddingReading] = useState(false)
  const [readingError, setReadingError] = useState<string | null>(null)
  const [readingSuccess, setReadingSuccess] = useState(false)
  const [meters, setMeters] = useState<any[]>([])
  
  // Payment modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [bills, setBills] = useState<any[]>([])
  
  // Bill modal states
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [isGeneratingBill, setIsGeneratingBill] = useState(false)
  const [billError, setBillError] = useState<string | null>(null)
  const [billSuccess, setBillSuccess] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [customerMeters, setCustomerMeters] = useState<any[]>([])
  const [readings, setReadings] = useState<any[]>([])
  
  // Meter modal states
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false)
  const [isAddingMeter, setIsAddingMeter] = useState(false)
  const [meterError, setMeterError] = useState<string | null>(null)
  const [meterSuccess, setMeterSuccess] = useState(false)
  const [meterCustomers, setMeterCustomers] = useState<any[]>([])
  
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = localStorage.getItem("admin_session")
        if (!session) {
          // Use window.location for logout redirects to prevent loops
          window.location.href = "/login"
          return
        }
        
        let sessionData
        try {
          sessionData = JSON.parse(session)
        } catch (parseError) {
          console.error("Invalid session data:", parseError)
          localStorage.removeItem("admin_session")
          window.location.href = "/login"
          return
        }
        
        if (!sessionData || !sessionData.id || !sessionData.email) {
          localStorage.removeItem("admin_session")
          window.location.href = "/login"
          return
        }
        
        setUser(sessionData)
        
        // Load dashboard stats in background
        const loadStats = async () => {
          try {
            setLoading(true)
            const { data } = await db.getDashboardStats()
            setStats(data)
          } catch (error) {
            console.error("Failed to load dashboard stats:", error)
          } finally {
            setLoading(false)
          }
        }
        
        loadStats()
      } catch (error) {
        console.error("Session check error:", error)
        localStorage.removeItem("admin_session")
        window.location.href = "/login"
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    // Add a small delay to prevent immediate redirects
    const timer = setTimeout(checkSession, 100)
    return () => clearTimeout(timer)
  }, [router])

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingCustomer(true)
    setAddCustomerError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const customerData = Object.fromEntries(formData.entries())

      // Generate customer number
      const timestamp = Date.now().toString().slice(-6)
      const customerNumber = `CUST${timestamp}`

      // Prepare data for database
      const newCustomer = {
        customer_number: customerNumber,
        first_name: customerData.firstName as string,
        last_name: customerData.lastName as string,
        email: customerData.email as string || null,
        phone: customerData.phone as string || null,
        address: customerData.address as string,
        city: customerData.city as string || null,
        postal_code: customerData.postalCode as string || null,
        is_active: true
      }

      // Save to database
      const { data, error: dbError } = await db.createCustomer(newCustomer)

      if (dbError) {
        console.error('Database error:', dbError)
        setAddCustomerError('Failed to add customer. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_added',
          description: `Added new customer: ${newCustomer.first_name} ${newCustomer.last_name}`,
          details: {
            customer_id: data.id,
            customer_number: customerNumber,
            customer_name: `${newCustomer.first_name} ${newCustomer.last_name}`
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }

      // Show success and close modal
      setAddCustomerSuccess(true)
      setTimeout(() => {
        setIsAddModalOpen(false)
        setAddCustomerSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh stats
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Error adding customer:', err)
      setAddCustomerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsAddingCustomer(false)
    }
  }

  // Handler for recording new reading
  const handleRecordReading = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingReading(true)
    setReadingError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const readingData = Object.fromEntries(formData.entries())

      // Prepare data for database
      const newReading = {
        meter_id: readingData.meterId as string,
        reading_value: parseFloat(readingData.readingValue as string),
        reading_date: readingData.readingDate as string,
        recorded_by: readingData.readerName as string,
        notes: readingData.notes as string || null
      }

      // Save to database
      const { data, error: dbError } = await db.createMeterReading(newReading)

      if (dbError) {
        console.error('Database error:', dbError)
        setReadingError('Failed to record reading. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'reading_recorded',
          description: `Recorded new meter reading: ${newReading.reading_value} m³`,
          details: {
            reading_id: data.id,
            meter_id: newReading.meter_id,
            reading_value: newReading.reading_value
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
      }

      // Show success and close modal
      setReadingSuccess(true)
      setTimeout(() => {
        setIsReadingModalOpen(false)
        setReadingSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh stats
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Error recording reading:', err)
      setReadingError('An unexpected error occurred. Please try again.')
    } finally {
      setIsAddingReading(false)
    }
  }

  // Handler for processing payment
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingPayment(true)
    setPaymentError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const paymentData = Object.fromEntries(formData.entries())

      // Generate payment number
      const timestamp = Date.now().toString().slice(-6)
      const paymentNumber = `PAY${timestamp}`

      // Get bill details to get customer_id
      const selectedBill = bills.find(bill => bill.id === paymentData.billId)
      if (!selectedBill) {
        setPaymentError('Selected bill not found.')
        return
      }

      // Prepare data for database
      const newPayment = {
        payment_number: paymentNumber,
        bill_id: paymentData.billId as string,
        customer_id: selectedBill.customer_id,
        amount: parseFloat(paymentData.amountPaid as string),
        payment_method: paymentData.paymentMethod as 'mpesa' | 'card' | 'bank_transfer' | 'cash',
        payment_date: paymentData.paymentDate as string,
        processed_by: user.id,
        notes: paymentData.notes as string || null
      }

      // Save to database
      const { data, error: dbError } = await db.createPayment(newPayment)

      if (dbError) {
        console.error('Database error:', dbError)
        setPaymentError('Failed to process payment. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'payment_received',
          description: `Processed payment: KSh ${newPayment.amount.toLocaleString()}`,
          details: {
            payment_id: data.id,
            payment_number: paymentNumber,
            amount_paid: newPayment.amount
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
      }

      // Show success and close modal
      setPaymentSuccess(true)
      setTimeout(() => {
        setIsPaymentModalOpen(false)
        setPaymentSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh stats
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Error processing payment:', err)
      setPaymentError('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Handler for generating bill
  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingBill(true)
    setBillError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const billData = Object.fromEntries(formData.entries())

      // Generate bill number
      const timestamp = Date.now().toString().slice(-6)
      const billNumber = `BILL${timestamp}`

      // Calculate bill amount (simplified calculation)
      const baseRate = 150 // KSh per m³
      const consumption = parseFloat(billData.consumption as string)
      const totalAmount = consumption * baseRate

      // Prepare data for database
      const newBill = {
        bill_number: billNumber,
        customer_id: billData.customerId as string,
        meter_id: billData.meterId as string,
        reading_id: billData.readingId as string,
        consumption: consumption,
        rate_per_unit: baseRate,
        total_amount: totalAmount,
        due_date: billData.dueDate as string,
        status: 'pending' as const
      }

      // Save to database
      const { data, error: dbError } = await db.createBill(newBill)

      if (dbError) {
        console.error('Database error:', dbError)
        setBillError('Failed to generate bill. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'bill_generated',
          description: `Generated new bill: ${billNumber}`,
          details: {
            bill_id: data.id,
            bill_number: billNumber,
            total_amount: totalAmount
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
      }

      // Show success and close modal
      setBillSuccess(true)
      setTimeout(() => {
        setIsBillModalOpen(false)
        setBillSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh stats
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Error generating bill:', err)
      setBillError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGeneratingBill(false)
    }
  }

  // Handler for adding new meter
  const handleAddMeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingMeter(true)
    setMeterError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const meterData = Object.fromEntries(formData.entries())

      // Generate meter number
      const timestamp = Date.now().toString().slice(-6)
      const meterNumber = `MTR${timestamp}`

      // Prepare data for database
      const newMeter = {
        meter_number: meterNumber,
        customer_id: meterData.customerId as string,
        meter_type: meterData.meterType as string,
        installation_date: meterData.installationDate as string,
        last_reading: parseFloat(meterData.lastReading as string) || 0,
        last_reading_date: meterData.lastReadingDate as string || null,
        is_active: true
      }

      // Save to database
      const { data, error: dbError } = await db.createMeter(newMeter)

      if (dbError) {
        console.error('Database error:', dbError)
        setMeterError('Failed to add meter. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_added', // Using customer_added as closest match
          description: `Added new meter: ${meterNumber}`,
          details: {
            meter_id: data.id,
            meter_number: meterNumber,
            meter_type: newMeter.meter_type
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
      }

      // Show success and close modal
      setMeterSuccess(true)
      setTimeout(() => {
        setIsMeterModalOpen(false)
        setMeterSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        // Refresh stats
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Error adding meter:', err)
      setMeterError('An unexpected error occurred. Please try again.')
    } finally {
      setIsAddingMeter(false)
    }
  }

  // Load data for modals
  useEffect(() => {
    const loadModalData = async () => {
      if (isReadingModalOpen) {
        try {
          const { data } = await db.getMeters()
          setMeters(data || [])
        } catch (error) {
          console.error('Error loading meters:', error)
        }
      }
      
      if (isPaymentModalOpen) {
        try {
          const { data } = await db.getBills()
          // Filter for pending/overdue bills only
          const pendingBills = data?.filter((bill: any) => 
            bill.status === 'pending' || bill.status === 'overdue'
          ) || []
          setBills(pendingBills)
        } catch (error) {
          console.error('Error loading bills:', error)
        }
      }
      
      if (isBillModalOpen) {
        try {
          const [customersData, metersData, readingsData] = await Promise.all([
            db.getCustomers(),
            db.getMeters(),
            db.getMeterReadings()
          ])
          setCustomers(customersData.data || [])
          setCustomerMeters(metersData.data || [])
          setReadings(readingsData.data || [])
        } catch (error) {
          console.error('Error loading bill data:', error)
        }
      }
      
      if (isMeterModalOpen) {
        try {
          const { data } = await db.getCustomers()
          setMeterCustomers(data || [])
        } catch (error) {
          console.error('Error loading customers for meter:', error)
        }
      }
    }
    
    loadModalData()
  }, [isReadingModalOpen, isPaymentModalOpen, isBillModalOpen, isMeterModalOpen])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Real data for the main overview cards
  const mainStats = {
    totalRevenue: {
      title: "Current Month Revenue",
      value: stats ? `KSh ${(stats.total_revenue / 1000000).toFixed(4)}M` : "KSh 0M",
      change: "+8.2%",
      description: "Revenue from payments this month",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
      gradient: "from-amber-500 to-orange-500",
    },
    activeCustomers: {
      title: "Active Customers",
      value: stats ? stats.total_customers.toLocaleString() : "0",
      change: "+5%",
      description: "Currently active accounts",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-500",
    },
    pendingBills: {
      title: "Pending Bills",
      value: stats ? stats.pending_bills.toLocaleString() : "0",
      change: "-5%",
      description: "Bills awaiting payment",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
      gradient: "from-blue-500 to-indigo-500",
    },
    avgUsage: {
      title: "Avg. Water Usage",
      value: stats && stats.avg_usage ? `${stats.avg_usage.toFixed(1)} m³` : "0 m³",
      change: "+1.2%",
      description: "Avg. consumption per customer",
      icon: Droplets,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      gradient: "from-cyan-500 to-blue-500",
    },
  }

  // Show loading screen while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Loading Dashboard</h2>
            <p className="text-slate-600">Please wait while we prepare your data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
      <DashboardHeader user={user} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
            <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {user.name || "Admin"}! 👋
                </h1>
            <p className="text-slate-600">
              Here's what's happening with your water management system today.
            </p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(mainStats).map(([key, stat]) => {
            const IconComponent = stat.icon
                    return (
              <Card
                key={key}
                className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-2 py-0.5 text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {loading && !stats ? (
                        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                </div>
              </div>
            </Card>
            )
          })}
          </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <QuickActions 
              onAddCustomer={() => setIsAddModalOpen(true)}
              onAddMeter={() => setIsMeterModalOpen(true)}
              onRecordReading={() => setIsReadingModalOpen(true)}
              onProcessPayment={() => setIsPaymentModalOpen(true)}
              onGenerateBills={() => setIsBillModalOpen(true)}
            />
          </div>
        </div>

        {/* Add Customer Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-500" />
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Fill in the details to register a new customer.
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {addCustomerSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">Customer added successfully!</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {addCustomerError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{addCustomerError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-semibold">
                    First Name *
                  </Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder="John" 
                    required 
                    className="h-11 rounded-xl" 
                    disabled={isAddingCustomer}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-semibold">
                    Last Name *
                  </Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Doe" 
                    required 
                    className="h-11 rounded-xl" 
                    disabled={isAddingCustomer}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="h-11 rounded-xl"
                    disabled={isAddingCustomer}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-semibold">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+2547XXXXXXXX"
                    required
                    className="h-11 rounded-xl"
                    disabled={isAddingCustomer}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700 font-semibold">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  required
                  rows={2}
                  className="rounded-xl"
                  disabled={isAddingCustomer}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-slate-700 font-semibold">
                    City *
                  </Label>
                  <Input 
                    id="city" 
                    name="city" 
                    placeholder="Nairobi" 
                    required 
                    className="h-11 rounded-xl" 
                    disabled={isAddingCustomer}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-slate-700 font-semibold">
                    Postal Code
                  </Label>
                  <Input 
                    id="postalCode" 
                    name="postalCode" 
                    placeholder="00100" 
                    className="h-11 rounded-xl" 
                    disabled={isAddingCustomer}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isAddingCustomer}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingCustomer}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 disabled:opacity-50"
                >
                  {isAddingCustomer ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Customer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Record Reading Modal */}
        <Dialog open={isReadingModalOpen} onOpenChange={setIsReadingModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-cyan-500" />
                Record New Reading
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Record a new meter reading for a customer.
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {readingSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">Reading recorded successfully!</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {readingError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{readingError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRecordReading} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meterId" className="text-slate-700 font-semibold">
                  Select Meter *
                </Label>
                <Select name="meterId" required disabled={isAddingReading}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a meter" />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem key={meter.id} value={meter.id}>
                        {meter.meter_number} - {meter.meter_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="readingValue" className="text-slate-700 font-semibold">
                    Reading Value (m³) *
                  </Label>
                  <Input
                    id="readingValue"
                    name="readingValue"
                    type="number"
                    step="0.01"
                    placeholder="150.25"
                    required
                    className="h-11 rounded-xl"
                    disabled={isAddingReading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readingDate" className="text-slate-700 font-semibold">
                    Reading Date *
                  </Label>
                  <Input
                    id="readingDate"
                    name="readingDate"
                    type="date"
                    required
                    className="h-11 rounded-xl"
                    disabled={isAddingReading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readerName" className="text-slate-700 font-semibold">
                  Reader Name *
                </Label>
                <Input
                  id="readerName"
                  name="readerName"
                  placeholder="John Doe"
                  required
                  className="h-11 rounded-xl"
                  disabled={isAddingReading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-semibold">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes about this reading..."
                  rows={3}
                  className="rounded-xl"
                  disabled={isAddingReading}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReadingModalOpen(false)}
                  disabled={isAddingReading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingReading}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl px-6 disabled:opacity-50"
                >
                  {isAddingReading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Gauge className="w-4 h-4 mr-2" />
                      Record Reading
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Process Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-amber-500" />
                Process Payment
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Process a payment for an outstanding bill.
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {paymentSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">Payment processed successfully!</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {paymentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{paymentError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billId" className="text-slate-700 font-semibold">
                  Select Bill *
                </Label>
                <Select name="billId" required disabled={isProcessingPayment}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a bill to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    {bills.map((bill) => (
                      <SelectItem key={bill.id} value={bill.id}>
                        {bill.bill_number} - KSh {bill.total_amount?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid" className="text-slate-700 font-semibold">
                    Amount Paid (KSh) *
                  </Label>
                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    required
                    className="h-11 rounded-xl"
                    disabled={isProcessingPayment}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-slate-700 font-semibold">
                    Payment Method *
                  </Label>
                  <Select name="paymentMethod" required disabled={isProcessingPayment}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-slate-700 font-semibold">
                  Payment Date *
                </Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  required
                  className="h-11 rounded-xl"
                  disabled={isProcessingPayment}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-semibold">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes about this payment..."
                  rows={3}
                  className="rounded-xl"
                  disabled={isProcessingPayment}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isProcessingPayment}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Generate Bills Modal */}
        <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-blue-500" />
                Generate New Bill
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Generate a new bill for a customer based on meter readings.
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {billSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">Bill generated successfully!</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {billError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{billError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId" className="text-slate-700 font-semibold">
                  Select Customer *
                </Label>
                <Select name="customerId" required disabled={isGeneratingBill}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customer_number} - {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterId" className="text-slate-700 font-semibold">
                  Select Meter *
                </Label>
                <Select name="meterId" required disabled={isGeneratingBill}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a meter" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerMeters.map((meter) => (
                      <SelectItem key={meter.id} value={meter.id}>
                        {meter.meter_number} - {meter.meter_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingId" className="text-slate-700 font-semibold">
                  Select Reading *
                </Label>
                <Select name="readingId" required disabled={isGeneratingBill}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a reading" />
                  </SelectTrigger>
                  <SelectContent>
                    {readings.map((reading) => (
                      <SelectItem key={reading.id} value={reading.id}>
                        {reading.reading_value} m³ - {new Date(reading.reading_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consumption" className="text-slate-700 font-semibold">
                    Consumption (m³) *
                  </Label>
                  <Input
                    id="consumption"
                    name="consumption"
                    type="number"
                    step="0.01"
                    placeholder="25.5"
                    required
                    className="h-11 rounded-xl"
                    disabled={isGeneratingBill}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-slate-700 font-semibold">
                    Due Date *
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                    className="h-11 rounded-xl"
                    disabled={isGeneratingBill}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBillModalOpen(false)}
                  disabled={isGeneratingBill}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGeneratingBill}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 disabled:opacity-50"
                >
                  {isGeneratingBill ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Bill
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Meter Modal */}
        <Dialog open={isMeterModalOpen} onOpenChange={setIsMeterModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-blue-500" />
                Add New Meter
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Register a new water meter for a customer.
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {meterSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-emerald-700 font-medium">Meter added successfully!</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {meterError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{meterError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddMeter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId" className="text-slate-700 font-semibold">
                  Select Customer *
                </Label>
                <Select name="customerId" required disabled={isAddingMeter}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {meterCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.customer_number} - {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterType" className="text-slate-700 font-semibold">
                  Meter Type *
                </Label>
                <Select name="meterType" required disabled={isAddingMeter}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Digital Water Meter">Digital Water Meter</SelectItem>
                    <SelectItem value="Analog Water Meter">Analog Water Meter</SelectItem>
                    <SelectItem value="Smart Water Meter">Smart Water Meter</SelectItem>
                    <SelectItem value="Industrial Water Meter">Industrial Water Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installationDate" className="text-slate-700 font-semibold">
                    Installation Date *
                  </Label>
                  <Input
                    id="installationDate"
                    name="installationDate"
                    type="date"
                    required
                    className="h-11 rounded-xl"
                    disabled={isAddingMeter}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastReading" className="text-slate-700 font-semibold">
                    Initial Reading (m³)
                  </Label>
                  <Input
                    id="lastReading"
                    name="lastReading"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-11 rounded-xl"
                    disabled={isAddingMeter}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastReadingDate" className="text-slate-700 font-semibold">
                  Last Reading Date
                </Label>
                <Input
                  id="lastReadingDate"
                  name="lastReadingDate"
                  type="date"
                  className="h-11 rounded-xl"
                  disabled={isAddingMeter}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMeterModalOpen(false)}
                  disabled={isAddingMeter}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingMeter}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 disabled:opacity-50"
                >
                  {isAddingMeter ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Gauge className="w-4 h-4 mr-2" />
                      Add Meter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
