"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, FileText, Search, CalendarDays, Filter, Download, Users } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function GenerateCustomReportPage() {
  const [user, setUser] = useState<any>(null)
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
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading custom report generator...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would trigger a backend process
    // to generate the report based on form inputs.
    alert("Custom report generation initiated! (This is a placeholder action)")
    // Optionally, navigate to a reports list or a success page
    // router.push('/dashboard/reports');
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
                  <Settings className="w-6 h-6 mr-3 text-green-500" />
                  Generate Custom Report
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Configure parameters to generate a tailored report.
                </CardDescription>
              </div>
              <Link href="/dashboard/reports" passHref>
                <Button variant="outline" className="rounded-2xl px-6 transition-all duration-300 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Reports
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type" className="text-slate-700 font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                      Report Type
                    </Label>
                    <Select>
                      <SelectTrigger id="report-type" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="billing-summary">Billing Summary</SelectItem>
                        <SelectItem value="customer-activity">Customer Activity</SelectItem>
                        <SelectItem value="meter-readings-log">Meter Readings Log</SelectItem>
                        <SelectItem value="payment-reconciliation">Payment Reconciliation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" />
                      Start Date
                    </Label>
                    <Input id="start-date" type="date" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" />
                      End Date
                    </Label>
                    <Input id="end-date" type="date" className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-id" className="text-slate-700 font-semibold flex items-center">
                      <Users className="w-4 h-4 mr-2 text-emerald-600" />
                      Customer ID (Optional)
                    </Label>
                    <Input id="customer-id" placeholder="e.g., CUST001" className="h-12 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filters" className="text-slate-700 font-semibold flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                      Additional Filters
                    </Label>
                    <Textarea
                      id="filters"
                      placeholder="e.g., status: overdue, amount > 1000"
                      rows={4}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Download className="mr-2 h-5 w-5" />
                Generate Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
