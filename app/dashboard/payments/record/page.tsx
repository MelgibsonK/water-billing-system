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
import { CreditCard, ArrowLeft, CalendarDays, DollarSign, User, Loader2, PlusCircle } from "lucide-react"
import { db } from "@/lib/supabase"

export default function RecordPaymentPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bills, setBills] = useState<any[]>([])
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
    const loadBills = async () => {
      try {
        setLoading(true)
        // Load only pending bills for payment
        const { data, error } = await db.getBills()
        
        if (error) {
          console.error('Error loading bills:', error)
          setError('Failed to load bills')
          return
        }

        // Filter for pending bills only
        const pendingBills = data?.filter(bill => bill.status === 'pending' || bill.status === 'overdue') || []
        setBills(pendingBills)
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
              <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
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
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-green-500 hover:bg-green-600"
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
    const paymentData = Object.fromEntries(formData.entries())

    console.log("New Payment Data:", paymentData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    alert("Payment recorded successfully! (Placeholder action)")
    setIsLoading(false)
    router.push("/dashboard/payments")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
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
                  <CreditCard className="w-6 h-6 mr-3 text-green-500" />
                  Record Payment
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Record a new payment for an outstanding bill.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No pending bills found</h3>
                <p className="text-slate-600 mb-4">All bills are either paid or there are no bills to pay.</p>
                <div className="space-x-4">
                  <Button 
                    onClick={() => router.push('/dashboard/bills')}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    View All Bills
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/bills/generate')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Generate Bill
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billId" className="text-slate-700 font-semibold flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                        Bill to Pay
                      </Label>
                      <Select name="billId" required>
                        <SelectTrigger id="billId" className="h-12 rounded-xl">
                          <SelectValue placeholder="Select a bill" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {bills.map((bill) => (
                            <SelectItem key={bill.id} value={bill.id}>
                              {bill.bill_number} - {bill.customers?.first_name} {bill.customers?.last_name} ({formatCurrency(bill.total_amount)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-slate-700 font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                        Payment Amount (KSh)
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-slate-700 font-semibold flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                        Payment Method
                      </Label>
                      <Select name="paymentMethod" required>
                        <SelectTrigger id="paymentMethod" className="h-12 rounded-xl">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate" className="text-slate-700 font-semibold flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-green-600" />
                        Payment Date
                      </Label>
                      <Input
                        id="paymentDate"
                        name="paymentDate"
                        type="date"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transactionId" className="text-slate-700 font-semibold flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                      Transaction ID (Optional)
                    </Label>
                    <Input
                      id="transactionId"
                      name="transactionId"
                      placeholder="e.g., MPESA123456789"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 font-semibold flex items-center">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any additional notes about this payment..."
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Recording Payment...
                    </>
                  ) : (
                    <>
                      Record Payment
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
