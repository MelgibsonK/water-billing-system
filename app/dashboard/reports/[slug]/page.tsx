"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, Droplets, Users, FileText, PieChart, Gauge, Loader2 } from "lucide-react"
import { db } from "@/lib/supabase"

export default function ReportDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { slug } = params

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true)
        
        // Load different data based on report type
        switch (slug) {
          case 'revenue-overview':
            const { data: payments, error: paymentsError } = await db.getPayments()
            if (paymentsError) throw paymentsError
            
            // Calculate current month's revenue
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
            
            const currentMonthPayments = payments?.filter(payment => 
              payment.payment_date >= startOfMonth && payment.payment_date <= endOfMonth
            ) || []
            
            const totalRevenue = currentMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
            const revenueByMethod = currentMonthPayments.reduce((acc, payment) => {
              const method = payment.payment_method || 'unknown'
              acc[method] = (acc[method] || 0) + (payment.amount || 0)
              return acc
            }, {} as any) || {}
            
            setReportData({
              title: "Revenue Overview",
              description: "Detailed breakdown of income from payments for the current month.",
              icon: DollarSign,
              totalRevenue,
              revenueByMethod,
              recentPayments: currentMonthPayments.slice(0, 5)
            })
            break

          case 'water-usage-trends':
            const { data: readings, error: readingsError } = await db.getMeterReadings()
            if (readingsError) throw readingsError
            
            const totalUsage = readings?.reduce((sum, reading) => sum + (reading.reading_value || 0), 0) || 0
            const avgUsage = readings && readings.length > 0 ? totalUsage / readings.length : 0
            
            setReportData({
              title: "Water Usage Trends",
              description: "Analysis of water consumption patterns across different customer segments and timeframes.",
              icon: Droplets,
              totalUsage,
              avgUsage,
              totalReadings: readings?.length || 0,
              recentReadings: readings?.slice(0, 5) || []
            })
            break

          case 'customer-demographics':
            const { data: customers, error: customersError } = await db.getCustomers()
            if (customersError) throw customersError
            
            const activeCustomers = customers?.filter(c => c.is_active).length || 0
            const customersByCity = customers?.reduce((acc, customer) => {
              const city = customer.city || 'Unknown'
              acc[city] = (acc[city] || 0) + 1
              return acc
            }, {} as any) || {}
            
            setReportData({
              title: "Customer Demographics",
              description: "Insights into your customer base, including location, connection status, and account types.",
              icon: Users,
              totalCustomers: customers?.length || 0,
              activeCustomers,
              customersByCity,
              recentCustomers: customers?.slice(0, 5) || []
            })
            break

          case 'billing-status':
            const { data: bills, error: billsError } = await db.getBills()
            if (billsError) throw billsError
            
            const billsByStatus = bills?.reduce((acc, bill) => {
              const status = bill.status || 'unknown'
              acc[status] = (acc[status] || 0) + 1
              return acc
            }, {} as any) || {}
            
            const totalBilled = bills?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
            
            setReportData({
              title: "Billing Status Report",
              description: "Comprehensive summary of all bills, categorised by their payment status (paid, pending, overdue).",
              icon: FileText,
              totalBills: bills?.length || 0,
              totalBilled,
              billsByStatus,
              recentBills: bills?.slice(0, 5) || []
            })
            break

          case 'payment-method-analysis':
            const { data: allPayments, error: allPaymentsError } = await db.getPayments()
            if (allPaymentsError) throw allPaymentsError
            
            const paymentsByMethod = allPayments?.reduce((acc, payment) => {
              const method = payment.payment_method || 'unknown'
              acc[method] = (acc[method] || 0) + 1
              return acc
            }, {} as any) || {}
            
            const totalPayments = allPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
            
            setReportData({
              title: "Payment Method Analysis",
              description: "Breakdown of payments received through various methods such as cash, online transfers, and mobile money.",
              icon: PieChart,
              totalPayments,
              totalTransactions: allPayments?.length || 0,
              paymentsByMethod,
              recentPayments: allPayments?.slice(0, 5) || []
            })
            break

          case 'meter-health-performance':
            const { data: meters, error: metersError } = await db.getMeters()
            if (metersError) throw metersError
            
            const activeMeters = meters?.filter(m => m.is_active).length || 0
            const metersByType = meters?.reduce((acc, meter) => {
              const type = meter.meter_type || 'Unknown'
              acc[type] = (acc[type] || 0) + 1
              return acc
            }, {} as any) || {}
            
            setReportData({
              title: "Meter Health & Performance",
              description: "Overview of meter installations, maintenance status, and performance metrics.",
              icon: Gauge,
              totalMeters: meters?.length || 0,
              activeMeters,
              metersByType,
              recentMeters: meters?.slice(0, 5) || []
            })
            break

          default:
            setError('Report not found')
            return
        }
      } catch (err) {
        console.error('Error loading report data:', err)
        setError('Failed to load report data')
      } finally {
        setLoading(false)
      }
    }

    if (user && slug) {
      loadReportData()
    }
  }, [user, slug])

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
              <p className="text-slate-600 font-medium">Loading report data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Report not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/reports')} 
                className="mt-4 bg-purple-500 hover:bg-purple-600"
              >
                Back to Reports
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
      <DashboardHeader user={user} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
        <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  <reportData.icon className="w-6 h-6 mr-3 text-purple-500" />
                  {reportData.title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  {reportData.description}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/reports')}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Reports
                </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportData.totalRevenue !== undefined && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(reportData.totalRevenue)}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                )}

                {reportData.totalUsage !== undefined && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Usage</p>
                        <p className="text-2xl font-bold text-slate-800">{reportData.totalUsage.toFixed(1)} m³</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {reportData.totalCustomers !== undefined && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Customers</p>
                        <p className="text-2xl font-bold text-slate-800">{reportData.totalCustomers}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                )}

                {reportData.totalBills !== undefined && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Bills</p>
                        <p className="text-2xl font-bold text-slate-800">{reportData.totalBills}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </div>
                )}

                {reportData.totalPayments !== undefined && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Payments</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(reportData.totalPayments)}</p>
                      </div>
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <PieChart className="w-6 h-6 text-cyan-600" />
                      </div>
                    </div>
                  </div>
                )}

                {reportData.totalMeters !== undefined && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Meters</p>
                        <p className="text-2xl font-bold text-slate-800">{reportData.totalMeters}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Gauge className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Breakdown Charts */}
                {(reportData.revenueByMethod || reportData.billsByStatus || reportData.paymentsByMethod || reportData.customersByCity || reportData.metersByType) && (
                  <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-800">Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(reportData.revenueByMethod || reportData.billsByStatus || reportData.paymentsByMethod || reportData.customersByCity || reportData.metersByType || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="font-medium text-slate-700 capitalize">{key}</span>
                            <span className="text-slate-600 font-semibold">{value as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                {(reportData.recentPayments || reportData.recentReadings || reportData.recentCustomers || reportData.recentBills || reportData.recentMeters) && (
                  <Card className="border-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(reportData.recentPayments || reportData.recentReadings || reportData.recentCustomers || reportData.recentBills || reportData.recentMeters || []).slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-medium text-slate-700">
                                {item.payment_number || item.meter_number || item.customer_number || item.bill_number || `Item ${index + 1}`}
                              </p>
                              <p className="text-sm text-slate-500">
                                {item.amount ? formatCurrency(item.amount) : 
                                 item.reading_value ? `${item.reading_value} m³` :
                                 item.first_name ? `${item.first_name} ${item.last_name}` :
                                 item.total_amount ? formatCurrency(item.total_amount) :
                                 item.meter_type || 'N/A'}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {item.payment_date || item.reading_date || item.created_at || item.generated_at || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
