"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, ArrowLeft, MapPin, Phone, Mail, Loader2, Save } from "lucide-react"
import { db } from "@/lib/supabase"

export default function EditCustomerPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getCustomer(id as string)
        
        if (error) {
          console.error('Error loading customer:', error)
          setError('Failed to load customer data')
          return
        }

        setCustomerData(data)
      } catch (err) {
        console.error('Error loading customer:', err)
        setError('Failed to load customer data')
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadCustomerData()
    }
  }, [user, id])

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
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading customer data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !customerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Customer not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/customers')} 
                className="mt-4 bg-emerald-500 hover:bg-emerald-600"
              >
                Back to Customers
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
    const updatedData = Object.fromEntries(formData.entries())

    console.log("Updated Customer Data:", updatedData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    alert("Customer updated successfully! (Placeholder action)")
    setIsLoading(false)
    router.push("/dashboard/customers")
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
                  <User className="w-6 h-6 mr-3 text-emerald-500" />
                  Edit Customer
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Update customer information and details.
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerNumber" className="text-slate-700 font-semibold flex items-center">
                      <User className="w-4 h-4 mr-2 text-emerald-600" />
                      Customer Number
                    </Label>
                    <Input
                      id="customerNumber"
                      name="customerNumber"
                      defaultValue={customerData.customer_number}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-semibold flex items-center">
                      <User className="w-4 h-4 mr-2 text-emerald-600" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={customerData.first_name}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-semibold flex items-center">
                      <User className="w-4 h-4 mr-2 text-emerald-600" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={customerData.last_name}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={customerData.email || ''}
                      className="h-12 rounded-xl"
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
                      defaultValue={customerData.phone || ''}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive" className="text-slate-700 font-semibold flex items-center">
                      Status
                    </Label>
                    <Select name="isActive" defaultValue={customerData.is_active ? 'true' : 'false'}>
                      <SelectTrigger id="isActive" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-700 font-semibold flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                      Address
                    </Label>
                  <Input
                      id="address"
                      name="address"
                    defaultValue={customerData.address || ''}
                    className="h-12 rounded-xl"
                    />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={customerData.city || ''}
                      className="h-12 rounded-xl"
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
                      defaultValue={customerData.postal_code || ''}
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
                  defaultValue={customerData.notes || ''}
                  placeholder="Any additional notes about this customer..."
                  rows={3}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating Customer...
                  </>
                ) : (
                  <>
                    Update Customer
                    <Save className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
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
