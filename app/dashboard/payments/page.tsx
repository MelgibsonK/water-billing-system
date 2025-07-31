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
  CreditCard,
  PlusCircle,
  CalendarDays,
  DollarSign,
  User,
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  RefreshCcw,
  Loader2,
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

export default function PaymentsPage() {
  const [user, setUser] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [recordPaymentSuccess, setRecordPaymentSuccess] = useState(false)
  const [recordPaymentError, setRecordPaymentError] = useState<string | null>(null)
  const [selectedBillId, setSelectedBillId] = useState<string>('')
  
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
    const loadPayments = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getPayments()
        
        if (error) {
          console.error('Error loading payments:', error)
          setError('Failed to load payments')
          return
        }

        setPayments(data || [])
      } catch (err) {
        console.error('Error loading payments:', err)
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadPayments()
    }
  }, [user])

  // Load bills for the modal dropdown
  useEffect(() => {
    const loadBills = async () => {
      if (isRecordPaymentOpen) {
        try {
          // Load pending and overdue bills
          const { data, error } = await db.getBills()
          if (!error && data) {
            const pendingBills = data.filter(bill => 
              bill.status === 'pending' || bill.status === 'overdue'
            )
            setBills(pendingBills)
          }
        } catch (err) {
          console.error('Error loading bills:', err)
        }
      }
    }

    loadBills()
  }, [isRecordPaymentOpen])

  const handleRecordPayment = async (formData: FormData) => {
    try {
      setIsRecordingPayment(true)
      setRecordPaymentError(null)

      const selectedBillId = formData.get('billId') as string
      const selectedBill = bills.find(bill => bill.id === selectedBillId)

      if (!selectedBill) {
        setRecordPaymentError('Selected bill not found')
        return
      }

      const paymentData = {
        bill_id: selectedBillId,
        customer_id: selectedBill.customer_id,
        payment_number: formData.get('paymentNumber') as string,
        amount: selectedBill.total_amount, // Use bill's total amount
        payment_method: formData.get('paymentMethod') as 'mpesa' | 'card' | 'bank_transfer' | 'cash',
        payment_date: formData.get('paymentDate') as string,
        transaction_id: formData.get('transactionId') as string || null,
        notes: formData.get('notes') as string || null,
        processed_by: user.id
      }

      const { data, error } = await db.createPayment(paymentData)
      
      if (error) {
        console.error('Error creating payment:', error)
        setRecordPaymentError('Failed to record payment. Please try again.')
        return
      }

      // Update bill status to paid
      const { error: updateError } = await db.updateBill(selectedBillId, {
        status: 'paid' as const,
        paid_at: new Date().toISOString()
      })

      if (updateError) {
        console.error('Error updating bill status:', updateError)
        // Don't fail the payment if bill update fails, just log it
      }

      // Log activity
      await db.logActivity({
        user_id: user.id,
        activity_type: 'payment_received',
        description: `Recorded new payment: ${paymentData.payment_number}`,
        details: { payment_id: data?.id, payment_number: paymentData.payment_number, amount: paymentData.amount, bill_id: selectedBillId }
      })

      setRecordPaymentSuccess(true)
      
      // Refresh payments list
      const { data: newPayments, error: loadError } = await db.getPayments()
      if (!loadError && newPayments) {
        setPayments(newPayments)
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsRecordPaymentOpen(false)
        setRecordPaymentSuccess(false)
        setRecordPaymentError(null)
        setSelectedBillId('')
      }, 2000)

    } catch (err) {
      console.error('Error recording payment:', err)
      setRecordPaymentError('Failed to record payment. Please try again.')
    } finally {
      setIsRecordingPayment(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading payments data...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
            Completed
          </Badge>
        )
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full px-3 py-1">Pending</Badge>
      case "failed":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full px-3 py-1">Failed</Badge>
      case "refunded":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-3 py-1">Refunded</Badge>
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa'
      case 'card':
        return 'Card'
      case 'bank_transfer':
        return 'Bank Transfer'
      case 'cash':
        return 'Cash'
      default:
        return method
    }
  }

  const handleRefundPayment = async (id: string) => {
    try {
      // In a real app, you would call an API to refund the payment
    setPayments((prev) => prev.map((payment) => (payment.id === id ? { ...payment, status: "refunded" } : payment)))
    alert(`Payment ${id} refunded! (Placeholder action)`)
    } catch (error) {
      console.error('Error refunding payment:', error)
      alert('Failed to refund payment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading payments...</p>
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
                className="mt-4 bg-amber-500 hover:bg-amber-600"
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
                  <CreditCard className="w-6 h-6 mr-3 text-amber-500" />
                  Payment Records
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Track and manage all incoming payments. {payments.length} payment{payments.length !== 1 ? 's' : ''} found.
                </CardDescription>
              </div>
              <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
                <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl px-6 shadow-lg shadow-amber-500/25 transition-all duration-300">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Record New Payment
                </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                    <DialogDescription>
                      Record a new payment for a customer bill.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {recordPaymentSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✓ Payment recorded successfully!</p>
                    </div>
                  )}
                  
                  {recordPaymentError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">{recordPaymentError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    
                    // Validate that a bill is selected
                    if (!selectedBillId) {
                      setRecordPaymentError('Please select a bill')
                      return
                    }
                    
                    const formData = new FormData(e.currentTarget)
                    // Add the selected bill ID to form data since Select doesn't work with FormData
                    formData.set('billId', selectedBillId)
                    handleRecordPayment(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="billId" className="text-right">
                          Bill
                        </Label>
                        <Select 
                          value={selectedBillId}
                          onValueChange={setSelectedBillId}
                          required
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a bill" />
                          </SelectTrigger>
                          <SelectContent>
                            {bills.map((bill) => (
                              <SelectItem key={bill.id} value={bill.id}>
                                Bill #{bill.bill_number} - {bill.customers?.first_name} {bill.customers?.last_name} ({formatCurrency(bill.total_amount)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedBillId && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right">
                            Amount Due
                          </Label>
                          <div className="col-span-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <span className="font-semibold text-lg text-green-600">
                              {formatCurrency(bills.find(bill => bill.id === selectedBillId)?.total_amount || 0)}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">(Auto-filled from bill)</span>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentNumber" className="text-right">
                          Payment Number
                        </Label>
                        <Input
                          id="paymentNumber"
                          name="paymentNumber"
                          className="col-span-3"
                          placeholder="Enter payment number"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentMethod" className="text-right">
                          Payment Method
                        </Label>
                        <Select name="paymentMethod" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentDate" className="text-right">
                          Payment Date
                        </Label>
                        <Input
                          id="paymentDate"
                          name="paymentDate"
                          type="date"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="transactionId" className="text-right">
                          Transaction ID
                        </Label>
                        <Input
                          id="transactionId"
                          name="transactionId"
                          className="col-span-3"
                          placeholder="Enter transaction ID (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          className="col-span-3"
                          placeholder="Add any notes for this payment"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsRecordPaymentOpen(false)}
                        disabled={isRecordingPayment}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isRecordingPayment}
                      >
                        {isRecordingPayment ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-2" />
                        )}
                        {isRecordingPayment ? 'Recording...' : 'Record Payment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No payments found</h3>
                <p className="text-slate-600 mb-4">Get started by recording your first payment.</p>
                <Button 
                  onClick={() => setIsRecordPaymentOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Record First Payment
                </Button>
              </div>
            ) : (
              payments.map((payment, index) => (
              <div
                key={payment.id}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-800 truncate">Payment #{payment.payment_number}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
                        Completed
                      </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                      Customer: {payment.customers?.first_name} {payment.customers?.last_name} 
                      (Bill #{payment.bills?.bill_number})
                  </p>
                  <div className="flex items-center text-sm text-slate-600 mb-1">
                    <DollarSign className="w-3 h-3 mr-2 text-slate-400" />
                    <span>
                      Amount:{" "}
                        <span className="font-semibold text-amber-600">{formatCurrency(payment.amount)}</span>
                    </span>
                    <span className="mx-2 text-slate-400">•</span>
                      <span>Method: {getPaymentMethodLabel(payment.payment_method)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <CalendarDays className="w-3 h-3 mr-2 text-slate-400" />
                      <span>Date: {formatDate(payment.payment_date)}</span>
                      {payment.transaction_id && (
                        <>
                    <span className="mx-2 text-slate-400">•</span>
                          <span>Ref: {payment.transaction_id}</span>
                        </>
                      )}
                  </div>
                    {payment.notes && (
                      <p className="text-xs text-slate-500 mt-1">
                        Notes: {payment.notes}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Recorded: {formatDate(payment.created_at)}
                    </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-2xl hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                      <Link href={`/dashboard/payments/${payment.id}`} passHref>
                      <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" /> Refund
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to refund this payment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRefundPayment(payment.id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                            >
                              Confirm Refund
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    <DropdownMenuItem
                      onClick={() => alert(`Edit Payment ${payment.id} (Placeholder action)`)}
                      className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
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
