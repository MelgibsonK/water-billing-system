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
import { Gauge, ArrowLeft, CalendarDays, MapPin, Loader2, PlusCircle } from "lucide-react"
import { db } from "@/lib/supabase"

export default function AddMeterPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
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
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getCustomers()
        
        if (error) {
          console.error('Error loading customers:', error)
          setError('Failed to load customers')
          return
        }

        setCustomers(data || [])
      } catch (err) {
        console.error('Error loading customers:', err)
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadCustomers()
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading customers...</p>
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
                <Gauge className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-500 hover:bg-blue-600"
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
    const meterData = Object.fromEntries(formData.entries())

    console.log("New Meter Data:", meterData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    alert("Meter added successfully! (Placeholder action)")
    setIsLoading(false)
    router.push("/dashboard/meters")
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
                  <Gauge className="w-6 h-6 mr-3 text-blue-500" />
                  Add New Meter
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Register a new water meter for billing and monitoring.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Meters
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Gauge className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No customers found</h3>
                <p className="text-slate-600 mb-4">You need customers to assign meters to.</p>
                <Button 
                  onClick={() => router.push('/dashboard/customers/add')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Add Customer First
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meterNumber" className="text-slate-700 font-semibold flex items-center">
                        <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                        Meter Number
                      </Label>
                      <Input
                        id="meterNumber"
                        name="meterNumber"
                        placeholder="e.g., MTR0001"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
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
                      <Label htmlFor="meterType" className="text-slate-700 font-semibold flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        Meter Type
                      </Label>
                      <Select name="meterType" required>
                        <SelectTrigger id="meterType" className="h-12 rounded-xl">
                          <SelectValue placeholder="Select meter type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Digital Water Meter">Digital Water Meter</SelectItem>
                          <SelectItem value="Smart Water Meter">Smart Water Meter</SelectItem>
                          <SelectItem value="Standard Water Meter">Standard Water Meter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="installationDate" className="text-slate-700 font-semibold flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                        Installation Date
                      </Label>
                      <Input
                        id="installationDate"
                        name="installationDate"
                        type="date"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastReading" className="text-slate-700 font-semibold flex items-center">
                        <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                        Initial Reading
                      </Label>
                      <Input
                        id="lastReading"
                        name="lastReading"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        defaultValue="0"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastReadingDate" className="text-slate-700 font-semibold flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                        Initial Reading Date
                      </Label>
                      <Input
                        id="lastReadingDate"
                        name="lastReadingDate"
                        type="date"
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
                    placeholder="Any additional notes about this meter..."
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Meter...
                    </>
                  ) : (
                    <>
                      Add Meter
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
