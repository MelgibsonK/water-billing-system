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
import { UserPlus, ArrowLeft, Mail, Phone, MapPin, MapIcon as City, Home, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { db } from "@/lib/supabase"

export default function AddCustomerPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
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
        setError('Failed to add customer. Please try again.')
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

      // Show success
      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/customers")
      }, 2000)

    } catch (err) {
      console.error('Error adding customer:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
    setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <CardContent className="relative z-10 p-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Customer Added Successfully!</h2>
              <p className="text-slate-600 mb-6">
                The new customer has been added to the database and is now active in the system.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-sm text-slate-600">Redirecting to customers page...</span>
              </div>
            </CardContent>
          </Card>
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
                  <UserPlus className="w-6 h-6 mr-3 text-emerald-500" />
                  Add New Customer
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Fill in the details to register a new customer.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customers
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-semibold flex items-center">
                      First Name
                    </Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="John" 
                      required 
                      className="h-12 rounded-xl" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-semibold flex items-center">
                      Last Name
                    </Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Doe" 
                      required 
                      className="h-12 rounded-xl" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="h-12 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-semibold flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+2547XXXXXXXX"
                      required
                      className="h-12 rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700 font-semibold flex items-center">
                      <Home className="w-4 h-4 mr-2 text-emerald-600" />
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="123 Main Street"
                      required
                      rows={3}
                      className="rounded-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 font-semibold flex items-center">
                      <City className="w-4 h-4 mr-2 text-emerald-600" />
                      City
                    </Label>
                    <Input 
                      id="city" 
                      name="city" 
                      placeholder="Nairobi" 
                      required 
                      className="h-12 rounded-xl" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-slate-700 font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                      Postal Code
                    </Label>
                    <Input 
                      id="postalCode" 
                      name="postalCode" 
                      placeholder="00100" 
                      className="h-12 rounded-xl" 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding Customer...
                  </>
                ) : (
                  <>
                    Add Customer
                    <UserPlus className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
