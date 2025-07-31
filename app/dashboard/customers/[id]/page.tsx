"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  ArrowLeft,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Gauge,
  FileText,
  CreditCard,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
import { db } from "@/lib/supabase"

export default function CustomerDetailPage() {
  const [user, setUser] = useState<any>(null)
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
              <p className="text-slate-600 font-medium">Loading customer details...</p>
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
        Active
      </Badge>
    ) : (
      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-3 py-1">
        Inactive
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteCustomer = async () => {
    try {
      // In a real app, you would call an API to delete the customer
      alert(`Customer ${customerData.customer_number} deleted! (Placeholder action)`)
      router.push('/dashboard/customers')
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
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
                  <User className="w-6 h-6 mr-3 text-emerald-500" />
                  Customer Details: {customerData.customer_number}
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Complete information about this customer and their account.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(customerData.is_active)}
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Customers
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Customer Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Full Name</p>
                        <p className="text-slate-800 font-semibold">
                          {customerData.first_name} {customerData.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Customer Number</p>
                        <p className="text-slate-800 font-semibold">{customerData.customer_number}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Email</p>
                        <p className="text-slate-800 font-semibold">{customerData.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Phone</p>
                        <p className="text-slate-800 font-semibold">{customerData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Address</p>
                      <p className="text-slate-800 font-semibold">
                        {customerData.address}, {customerData.city} {customerData.postal_code}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Registration Date</p>
                        <p className="text-slate-800 font-semibold">{formatDate(customerData.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Last Updated</p>
                        <p className="text-slate-800 font-semibold">{formatDate(customerData.updated_at)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Account Status</p>
                      <div className="mt-1">{getStatusBadge(customerData.is_active)}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href={`/dashboard/meters/add?customer=${customerData.id}`}>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                          <Gauge className="w-4 h-4 mr-2" />
                          Add Meter
                        </Button>
                      </Link>
                      <Link href={`/dashboard/readings/add?customer=${customerData.id}`}>
                        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl">
                          <FileText className="w-4 h-4 mr-2" />
                          Record Reading
                        </Button>
                      </Link>
                      <Link href={`/dashboard/bills/generate?customer=${customerData.id}`}>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Bill
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Customer Actions */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href={`/dashboard/customers/${customerData.id}/edit`}>
                      <Button variant="outline" className="w-full rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                        Edit Customer
                  </Button>
                </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full rounded-xl">
                          <MoreHorizontal className="w-4 h-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Mail className="mr-2 h-4 w-4" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Phone className="mr-2 h-4 w-4" /> Call Customer
                        </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                            </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the customer record and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteCustomer}
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

                {/* Contact Information */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{customerData.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{customerData.phone || 'No phone'}</span>
              </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{customerData.city || 'No city'}</span>
            </div>
                  </CardContent>
                </Card>

                {/* Customer Summary */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Customer Summary</CardTitle>
          </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Customer Since</span>
                      <span className="text-sm font-medium text-slate-800">
                        {formatDate(customerData.created_at)}
                      </span>
                </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="text-sm font-medium text-slate-800 capitalize">
                        {customerData.is_active ? 'Active' : 'Inactive'}
                      </span>
              </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Location</span>
                      <span className="text-sm font-medium text-slate-800">{customerData.city || 'N/A'}</span>
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
