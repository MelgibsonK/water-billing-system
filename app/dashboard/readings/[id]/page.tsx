"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Droplets,
  ArrowLeft,
  CalendarDays,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Gauge,
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

export default function ReadingDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [readingData, setReadingData] = useState<any>(null)
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
    const loadReadingData = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getMeterReading(id as string)
        
        if (error) {
          console.error('Error loading reading:', error)
          setError('Failed to load reading data')
          return
        }

        setReadingData(data)
      } catch (err) {
        console.error('Error loading reading:', err)
        setError('Failed to load reading data')
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadReadingData()
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
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading reading details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !readingData) {
        return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <Droplets className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Reading not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/readings')} 
                className="mt-4 bg-cyan-500 hover:bg-cyan-600"
              >
                Back to Readings
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteReading = async () => {
    try {
      // In a real app, you would call an API to delete the reading
      alert(`Reading ${readingData.id} deleted! (Placeholder action)`)
      router.push('/dashboard/readings')
    } catch (error) {
      console.error('Error deleting reading:', error)
      alert('Failed to delete reading')
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
                  <Droplets className="w-6 h-6 mr-3 text-cyan-500" />
                  Reading Details: {readingData.id?.slice(0, 8)}...
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Complete information about this meter reading.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 rounded-full px-3 py-1">
                  <Droplets className="w-3 h-3 mr-1" />
                  Recorded
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Readings
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Reading Information */}
              <div className="lg:col-span-2 space-y-6">
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
                      <span className="text-slate-700">Meter: {readingData.meters?.meter_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">Type: {readingData.meters?.meter_type}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        Customer: {readingData.meters?.customers?.first_name} {readingData.meters?.customers?.last_name}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Reading Information */}
                <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-cyan-600" />
                      Reading Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Reading Value</p>
                        <p className="text-slate-800 font-semibold text-2xl">{readingData.reading_value} m³</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Reading Date</p>
                        <p className="text-slate-800 font-semibold">{formatDate(readingData.reading_date)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Recorded By</p>
                        <p className="text-slate-800 font-semibold">{readingData.recorded_by || 'System'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Created</p>
                        <p className="text-slate-800 font-semibold">{formatDate(readingData.created_at)}</p>
                      </div>
                    </div>
                    {readingData.notes && (
                      <div>
                        <p className="text-sm font-medium text-slate-600">Notes</p>
                        <p className="text-slate-800 font-semibold">{readingData.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href={`/dashboard/bills/generate?reading=${readingData.id}`}>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
                          <Droplets className="w-4 h-4 mr-2" />
                          Generate Bill
                        </Button>
                      </Link>
                      <Link href={`/dashboard/readings/${readingData.id}/edit`}>
                        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Reading
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Reading Summary */}
                <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-cyan-600" />
                      Reading Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-600">{readingData.reading_value} m³</p>
                      <p className="text-sm text-slate-600 mt-1">Recorded on {formatDate(readingData.reading_date)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Reading Actions */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href={`/dashboard/readings/${readingData.id}/edit`}>
                      <Button variant="outline" className="w-full rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                        Edit Reading
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
                        <Link href={`/dashboard/bills/generate?reading=${readingData.id}`}>
                          <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                            <Droplets className="mr-2 h-4 w-4" /> Generate Bill
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Eye className="mr-2 h-4 w-4" /> View History
                        </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Reading
                            </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the reading record.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteReading}
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

                {/* Reading Details */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Reading Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Reading ID</span>
                      <span className="text-sm font-medium text-slate-800">{readingData.id?.slice(0, 8)}...</span>
              </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Meter</span>
                      <span className="text-sm font-medium text-slate-800">{readingData.meters?.meter_number}</span>
            </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Value</span>
                      <span className="text-sm font-medium text-slate-800">{readingData.reading_value} m³</span>
                </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Date</span>
                      <span className="text-sm font-medium text-slate-800">{formatDate(readingData.reading_date)}</span>
            </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Recorded By</span>
                      <span className="text-sm font-medium text-slate-800">{readingData.recorded_by || 'System'}</span>
                </div>
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
                        {readingData.meters?.customers?.first_name} {readingData.meters?.customers?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{readingData.meters?.customers?.customer_number}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{readingData.meters?.meter_type}</span>
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
