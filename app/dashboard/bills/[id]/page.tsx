"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  ArrowLeft,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Mail,
  Loader2,
  User,
  Gauge,
  MapPin,
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

export default function BillDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [billData, setBillData] = useState<any>(null)
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
    const loadBillData = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getBill(id as string)
        
        if (error) {
          console.error('Error loading bill:', error)
          setError('Failed to load bill data')
          return
        }

        setBillData(data)
      } catch (err) {
        console.error('Error loading bill:', err)
        setError('Failed to load bill data')
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadBillData()
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
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading bill details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !billData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Bill not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/bills')} 
                className="mt-4 bg-purple-500 hover:bg-purple-600"
              >
                Back to Bills
              </Button>
            </div>
          </div>
        </main>
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
            <AlertCircle className="w-3 h-3 mr-1" />
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

  const handleSendReminder = async () => {
    try {
      // In a real app, you would call an API to send a reminder
      alert(`Reminder sent for bill ${billData.bill_number}! (Placeholder action)`)
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    }
  }

  const handleDeleteBill = async () => {
    try {
      // In a real app, you would call an API to delete the bill
      alert(`Bill ${billData.bill_number} deleted! (Placeholder action)`)
      router.push('/dashboard/bills')
    } catch (error) {
      console.error('Error deleting bill:', error)
      alert('Failed to delete bill')
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
                  <FileText className="w-6 h-6 mr-3 text-purple-500" />
                  Bill Details: {billData.bill_number}
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Complete information about this bill and its status.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(billData.status)}
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Bills
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Bill Information */}
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
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {billData.customers?.first_name} {billData.customers?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{billData.customers?.customer_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {billData.customers?.address}, {billData.customers?.city}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Meter Information */}
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                      Meter Information
                </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">Meter: {billData.meters?.meter_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">Type: {billData.meters?.meter_type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        Installed: {formatDate(billData.meters?.installation_date || '')}
                      </span>
                </div>
                  </CardContent>
              </Card>

                {/* Billing Details */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                      Billing Details
                </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Billing Period</p>
                        <p className="text-slate-800 font-semibold">
                          {formatDate(billData.billing_period_start)} - {formatDate(billData.billing_period_end)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Due Date</p>
                        <p className="text-slate-800 font-semibold">{formatDate(billData.due_date)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Previous Reading</p>
                        <p className="text-slate-800 font-semibold">{billData.previous_reading} m³</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Current Reading</p>
                        <p className="text-slate-800 font-semibold">{billData.current_reading} m³</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Consumption</p>
                        <p className="text-slate-800 font-semibold">{billData.consumption} m³</p>
                  </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Rate per Unit</p>
                        <p className="text-slate-800 font-semibold">{formatCurrency(billData.rate_per_unit)}</p>
                  </div>
                </div>
                  </CardContent>
              </Card>
            </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Total Amount */}
                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                      Total Amount
                </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{formatCurrency(billData.total_amount)}</p>
                      <p className="text-sm text-slate-600 mt-1">Due by {formatDate(billData.due_date)}</p>
                </div>
                  </CardContent>
              </Card>

                {/* Actions */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(billData.status === 'pending' || billData.status === 'overdue') && (
                      <Button
                        onClick={handleSendReminder}
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reminder
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full rounded-xl">
                          <MoreHorizontal className="w-4 h-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        <Link href={`/dashboard/bills/${billData.id}/edit`}>
                          <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                            <Eye className="mr-2 h-4 w-4" /> Edit Bill
                          </DropdownMenuItem>
                      </Link>
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Mail className="mr-2 h-4 w-4" /> Send Copy
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <FileText className="mr-2 h-4 w-4" /> Delete Bill
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the bill record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteBill}
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

                {/* Bill Information */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Bill Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Bill Number</span>
                      <span className="text-sm font-medium text-slate-800">{billData.bill_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Generated</span>
                      <span className="text-sm font-medium text-slate-800">
                        {formatDate(billData.generated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="text-sm font-medium text-slate-800 capitalize">{billData.status}</span>
                    </div>
                    {billData.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Paid On</span>
                        <span className="text-sm font-medium text-slate-800">
                          {formatDate(billData.paid_at)}
                        </span>
                      </div>
                    )}
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
