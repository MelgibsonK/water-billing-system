"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, ArrowLeft, CalendarDays, DollarSign, Loader2, PlusCircle } from "lucide-react"
import { db } from "@/lib/supabase"

export default function GenerateBillPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [meters, setMeters] = useState<any[]>([])
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load customers
        const { data: customersData, error: customersError } = await db.getCustomers()
        if (customersError) {
          console.error('Error loading customers:', customersError)
          setError('Failed to load customers')
          return
        }

        // Load meters
        const { data: metersData, error: metersError } = await db.getMeters()
        if (metersError) {
          console.error('Error loading meters:', metersError)
          setError('Failed to load meters')
          return
        }

        // Load readings
        const { data: readingsData, error: readingsError } = await db.getMeterReadings()
        if (readingsError) {
          console.error('Error loading readings:', readingsError)
          setError('Failed to load readings')
          return
        }

        setCustomers(customersData || [])
        setMeters(metersData || [])
        setReadings(readingsData || [])
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading data...</p>
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
                <FileText className="w-8 h-8 text-red-500" />
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const billData = Object.fromEntries(formData.entries())

    console.log("New Bill Data:", billData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    alert("Bill generated successfully! (Placeholder action)")
    setIsLoading(false)
    router.push("/dashboard/bills")
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
                  Generate New Bill
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Create a new bill for a customer based on meter readings.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bills
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No customers found</h3>
                <p className="text-slate-600 mb-4">You need customers and meters to generate bills.</p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => router.push('/dashboard/customers/add')}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Add Customer
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/meters/add')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Add Meter
                  </Button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerId" className="text-slate-700 font-semibold flex items-center">
                      Customer
                    </Label>
                    <Select name="customerId" required>
                      <SelectTrigger id="customerId" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                              {customer.first_name} {customer.last_name} ({customer.customer_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meterId" className="text-slate-700 font-semibold flex items-center">
                      Meter Number
                    </Label>
                    <Select name="meterId" required>
                      <SelectTrigger id="meterId" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a meter" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {meters.map((meter) => (
                          <SelectItem key={meter.id} value={meter.id}>
                              {meter.meter_number} ({meter.customers?.first_name} {meter.customers?.last_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readingId" className="text-slate-700 font-semibold flex items-center">
                      Reading to Bill
                    </Label>
                    <Select name="readingId" required>
                      <SelectTrigger id="readingId" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a reading" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {readings.map((reading) => (
                          <SelectItem key={reading.id} value={reading.id}>
                              {reading.meters?.meter_number} ({new Date(reading.reading_date).toLocaleDateString()}) - {reading.reading_value} m³
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingPeriodStart" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-purple-600" />
                      Billing Period Start
                    </Label>
                    <Input
                      id="billingPeriodStart"
                      name="billingPeriodStart"
                      type="date"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingPeriodEnd" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-purple-600" />
                      Billing Period End
                    </Label>
                    <Input
                      id="billingPeriodEnd"
                      name="billingPeriodEnd"
                      type="date"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-purple-600" />
                      Due Date
                    </Label>
                    <Input id="dueDate" name="dueDate" type="date" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount" className="text-slate-700 font-semibold flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                      Total Amount (KSh)
                    </Label>
                    <Input
                      id="totalAmount"
                      name="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700 font-semibold flex items-center">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes for the bill..."
                  rows={2}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Bill...
                  </>
                ) : (
                  <>
                    Generate Bill
                    <PlusCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
