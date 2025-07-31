"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  ArrowLeft,
  CalendarDays,
  DollarSign,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
  Mail,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from "@/lib/supabase"

export default function PaymentDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
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
    const loadPaymentData = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getPayment(id as string)
        
        if (error) {
          console.error('Error loading payment:', error)
          setError('Failed to load payment data')
          return
        }

        setPaymentData(data)
      } catch (err) {
        console.error('Error loading payment:', err)
        setError('Failed to load payment data')
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadPaymentData()
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
              <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading payment details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Payment not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/payments')} 
                className="mt-4 bg-green-500 hover:bg-green-600"
              >
                Back to Payments
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
        }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full px-3 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full px-3 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-3 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Refunded
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'card':
        return 'Credit/Debit Card'
      case 'bank_transfer':
        return 'Bank Transfer'
      case 'cash':
        return 'Cash'
      case 'cheque':
        return 'Cheque'
      default:
        return method
    }
  }

  const handleDeletePayment = async () => {
    try {
      // In a real app, you would call an API to delete the payment
      alert(`Payment ${paymentData.payment_number} deleted! (Placeholder action)`)
      router.push('/dashboard/payments')
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Failed to delete payment')
    }
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
                  Payment Details: {paymentData.payment_number}
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Complete information about this payment transaction.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(paymentData.status || 'completed')}
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Payments
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Payment Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {paymentData.customers?.first_name} {paymentData.customers?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{paymentData.customers?.customer_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {paymentData.customers?.address}, {paymentData.customers?.city}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                      Payment Information
                </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Payment Number</p>
                        <p className="text-slate-800 font-semibold">{paymentData.payment_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Amount</p>
                        <p className="text-slate-800 font-semibold">{formatCurrency(paymentData.amount)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Payment Method</p>
                        <p className="text-slate-800 font-semibold">{getPaymentMethodLabel(paymentData.payment_method)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Payment Date</p>
                        <p className="text-slate-800 font-semibold">{formatDate(paymentData.payment_date)}</p>
                      </div>
                    </div>
                    {paymentData.transaction_id && (
                      <div>
                        <p className="text-sm font-medium text-slate-600">Transaction ID</p>
                        <p className="text-slate-800 font-semibold">{paymentData.transaction_id}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bill Information */}
                {paymentData.bills && (
                  <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Associated Bill
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">Bill: {paymentData.bills.bill_number}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">Amount: {formatCurrency(paymentData.bills.total_amount)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">Due Date: {formatDate(paymentData.bills.due_date)}</span>
                </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {paymentData.notes && (
                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-800">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{paymentData.notes}</p>
                    </CardContent>
              </Card>
                )}
            </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Payment Summary */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Payment Summary
                </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(paymentData.amount)}</p>
                      <p className="text-sm text-slate-600 mt-1">Paid on {formatDate(paymentData.payment_date)}</p>
                </div>
                  </CardContent>
              </Card>

                {/* Payment Actions */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full rounded-xl">
                      <Eye className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full rounded-xl">
                          <MoreHorizontal className="w-4 h-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <FileText className="mr-2 h-4 w-4" /> Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Mail className="mr-2 h-4 w-4" /> Send Receipt
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Payment
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the payment record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeletePayment}
                                className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Payment Number</span>
                      <span className="text-sm font-medium text-slate-800">{paymentData.payment_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Method</span>
                      <span className="text-sm font-medium text-slate-800">{getPaymentMethodLabel(paymentData.payment_method)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="text-sm font-medium text-slate-800 capitalize">{paymentData.status || 'completed'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Date</span>
                      <span className="text-sm font-medium text-slate-800">{formatDate(paymentData.payment_date)}</span>
                    </div>
                    {paymentData.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Transaction ID</span>
                        <span className="text-sm font-medium text-slate-800">{paymentData.transaction_id}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {paymentData.customers?.first_name} {paymentData.customers?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{paymentData.customers?.customer_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{paymentData.customers?.city || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
