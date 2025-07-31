"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  PlusCircle,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
  Eye,
  Mail,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db } from "@/lib/supabase"

export default function BillsPage() {
  const [user, setUser] = useState<any>(null)
  const [bills, setBills] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [meters, setMeters] = useState<any[]>([])
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isGenerateBillOpen, setIsGenerateBillOpen] = useState(false)
  const [isGeneratingBill, setIsGeneratingBill] = useState(false)
  const [generateBillSuccess, setGenerateBillSuccess] = useState(false)
  const [generateBillError, setGenerateBillError] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getBills()
        
        if (error) {
          console.error('Error loading bills:', error)
          setError('Failed to load bills')
          return
        }

        setBills(data || [])
      } catch (err) {
        console.error('Error loading bills:', err)
        setError('Failed to load bills')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadBills()
    }
  }, [user])

  // Load data for the modal dropdowns
  useEffect(() => {
    const loadModalData = async () => {
      if (isGenerateBillOpen) {
        try {
          // Load customers
          const { data: customersData, error: customersError } = await db.getCustomers()
          if (!customersError && customersData) {
            setCustomers(customersData)
          }

          // Load meters
          const { data: metersData, error: metersError } = await db.getMeters()
          if (!metersError && metersData) {
            setMeters(metersData)
          }

          // Load readings
          const { data: readingsData, error: readingsError } = await db.getMeterReadings()
          if (!readingsError && readingsData) {
            setReadings(readingsData)
          }
        } catch (err) {
          console.error('Error loading modal data:', err)
        }
      }
    }

    loadModalData()
  }, [isGenerateBillOpen])

  const handleGenerateBill = async (formData: FormData) => {
    try {
      setIsGeneratingBill(true)
      setGenerateBillError(null)

      // Debug form data
      console.log('Bill form data entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const billData = {
        customer_id: formData.get('customerId') as string,
        meter_id: formData.get('meterId') as string,
        previous_reading: parseFloat(formData.get('previousReading') as string),
        current_reading: parseFloat(formData.get('currentReading') as string),
        consumption: parseFloat(formData.get('unitsConsumed') as string),
        rate_per_unit: parseFloat(formData.get('ratePerUnit') as string),
        total_amount: parseFloat(formData.get('totalAmount') as string),
        billing_period_start: formData.get('billingPeriodStart') as string,
        billing_period_end: formData.get('billingPeriodEnd') as string,
        due_date: formData.get('dueDate') as string,
        bill_number: formData.get('billNumber') as string,
        status: 'pending' as const,
        generated_by: user.id
      }

      console.log('Sending bill data:', billData)

      const { data, error } = await db.createBill(billData)
      
      if (error) {
        console.error('Error creating bill:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        setGenerateBillError(`Failed to generate bill: ${error.message}`)
        return
      }

      // Log activity
      await db.logActivity({
        user_id: user.id,
        activity_type: 'bill_generated',
        description: `Generated new bill: ${billData.bill_number}`,
        details: { bill_id: data?.id, bill_number: billData.bill_number, total_amount: billData.total_amount }
      })

      setGenerateBillSuccess(true)
      
      // Refresh bills list
      const { data: newBills, error: loadError } = await db.getBills()
      if (!loadError && newBills) {
        setBills(newBills)
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsGenerateBillOpen(false)
        setGenerateBillSuccess(false)
        setGenerateBillError(null)
      }, 2000)

    } catch (err) {
      console.error('Error generating bill:', err)
      setGenerateBillError('Failed to generate bill. Please try again.')
    } finally {
      setIsGeneratingBill(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading bills data...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full px-3 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-3 py-1">
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="rounded-full">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const handleSendReminder = async (id: string) => {
    try {
    alert(`Reminder sent for Bill ${id}! (Placeholder action)`)
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading bills...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-purple-500 hover:bg-purple-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
      <DashboardHeader user={user} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
        <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-purple-500" />
                  Bill Management
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Generate, view, and track all customer bills. {bills.length} bill{bills.length !== 1 ? 's' : ''} found.
                </CardDescription>
              </div>
              <Dialog open={isGenerateBillOpen} onOpenChange={setIsGenerateBillOpen}>
                <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl px-6 shadow-lg shadow-purple-500/25 transition-all duration-300">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Generate New Bill
                </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Generate New Bill</DialogTitle>
                    <DialogDescription>
                      Generate a new bill for a customer based on meter readings.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {generateBillSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✓ Bill generated successfully!</p>
                    </div>
                  )}
                  
                  {generateBillError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">{generateBillError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleGenerateBill(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customerId" className="text-right">
                          Customer
                        </Label>
                        <Select name="customerId" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.first_name} {customer.last_name} - {customer.customer_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meterId" className="text-right">
                          Meter
                        </Label>
                        <Select name="meterId" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a meter" />
                          </SelectTrigger>
                          <SelectContent>
                            {meters.map((meter) => (
                              <SelectItem key={meter.id} value={meter.id}>
                                {meter.meter_number} - {meter.customers?.first_name} {meter.customers?.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="readingId" className="text-right">
                          Reading
                        </Label>
                        <Select name="readingId" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a reading" />
                          </SelectTrigger>
                          <SelectContent>
                            {readings.map((reading) => (
                              <SelectItem key={reading.id} value={reading.id}>
                                {reading.reading_value} m³ - {reading.meters?.meter_number} ({new Date(reading.reading_date).toLocaleDateString()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="previousReading" className="text-right">
                          Previous Reading
                        </Label>
                        <Input
                          id="previousReading"
                          name="previousReading"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter previous reading"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="currentReading" className="text-right">
                          Current Reading
                        </Label>
                        <Input
                          id="currentReading"
                          name="currentReading"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter current reading"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="billNumber" className="text-right">
                          Bill Number
                        </Label>
                        <Input
                          id="billNumber"
                          name="billNumber"
                          className="col-span-3"
                          placeholder="Enter bill number"
                          required
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div>
                          <Label htmlFor="billingPeriodStart" className="text-xs block mb-1">
                            Period Start
                          </Label>
                          <Input
                            id="billingPeriodStart"
                            name="billingPeriodStart"
                            type="date"
                            className="w-36 text-xs"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPeriodEnd" className="text-xs block mb-1">
                            Period End
                          </Label>
                          <Input
                            id="billingPeriodEnd"
                            name="billingPeriodEnd"
                            type="date"
                            className="w-36 text-xs"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate" className="text-xs block mb-1">
                            Due Date
                          </Label>
                          <Input
                            id="dueDate"
                            name="dueDate"
                            type="date"
                            className="w-36 text-xs"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ratePerUnit" className="text-right">
                          Rate/Unit (KSH)
                        </Label>
                        <Input
                          id="ratePerUnit"
                          name="ratePerUnit"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter rate per unit"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unitsConsumed" className="text-right">
                          Units Consumed
                        </Label>
                        <Input
                          id="unitsConsumed"
                          name="unitsConsumed"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter units consumed"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalAmount" className="text-right">
                          Total Amount (KSH)
                        </Label>
                        <Input
                          id="totalAmount"
                          name="totalAmount"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter total amount"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsGenerateBillOpen(false)}
                        disabled={isGeneratingBill}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isGeneratingBill}
                      >
                        {isGeneratingBill ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4 mr-2" />
                        )}
                        {isGeneratingBill ? 'Generating...' : 'Generate Bill'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No bills found</h3>
                <p className="text-slate-600 mb-4">Get started by generating your first bill.</p>
                <Button 
                  onClick={() => setIsGenerateBillOpen(true)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Generate First Bill
                </Button>
              </div>
            ) : (
              bills.map((bill, index) => (
              <div
                key={bill.id}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-800 truncate">Bill #{bill.bill_number}</p>
                    {getStatusBadge(bill.status)}
                  </div>
                    <p className="text-sm text-slate-600 mb-1">
                      Customer: {bill.customers?.first_name} {bill.customers?.last_name}
                    </p>
                  <div className="flex items-center text-sm text-slate-600 mb-1">
                    <DollarSign className="w-3 h-3 mr-2 text-slate-400" />
                    <span>
                        Amount: <span className="font-semibold text-purple-600">{formatCurrency(bill.total_amount)}</span>
                    </span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span>Consumption: {bill.consumption} m³</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <CalendarDays className="w-3 h-3 mr-2 text-slate-400" />
                      <span>Due: {formatDate(bill.due_date)}</span>
                    <span className="mx-2 text-slate-400">•</span>
                      <span>Period: {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 mt-1">
                      <span>Rate: {formatCurrency(bill.rate_per_unit)}/m³</span>
                      <span className="mx-2">•</span>
                      <span>Generated: {formatDate(bill.generated_at)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-2xl hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                    <Link href={`/dashboard/bills/${bill.id}`} passHref>
                      <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </Link>
                    {bill.status === "pending" || bill.status === "overdue" ? (
                      <DropdownMenuItem
                        onClick={() => handleSendReminder(bill.id)}
                        className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                      >
                        <Mail className="mr-2 h-4 w-4 text-blue-600" /> Send Reminder
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
