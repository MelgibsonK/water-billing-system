"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  BarChart,
  PieChart,
  Users,
  DollarSign,
  Droplets,
  FileText,
  Search,
  ArrowRight,
  PlusCircle,
} from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading reports data...</p>
        </div>
      </div>
    )
  }

  const reports = [
    {
      title: "Revenue Overview",
      description: "Detailed breakdown of income from bills and payments.",
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      slug: "revenue-overview", // Added slug for dynamic routing
    },
    {
      title: "Water Usage Trends",
      description: "Analyze consumption patterns over time.",
      icon: Droplets,
      gradient: "from-cyan-500 to-blue-500",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      slug: "water-usage-trends", // Added slug for dynamic routing
    },
    {
      title: "Customer Demographics",
      description: "Insights into your customer base and their distribution.",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      slug: "customer-demographics", // Added slug for dynamic routing
    },
    {
      title: "Billing Status Report",
      description: "Summary of paid, pending, and overdue bills.",
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      slug: "billing-status", // Added slug for dynamic routing
    },
    {
      title: "Payment Method Analysis",
      description: "Breakdown of payments by method (cash, online, etc.).",
      icon: PieChart,
      gradient: "from-rose-500 to-red-500",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      slug: "payment-method-analysis", // Added slug for dynamic routing
    },
    {
      title: "Meter Health & Performance",
      description: "Monitor meter status and identify issues.",
      icon: BarChart,
      gradient: "from-indigo-500 to-violet-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      slug: "meter-health", // Added slug for dynamic routing
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
      <DashboardHeader user={user} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
        <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                  Analytics & Reports
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Generate and view various operational reports.
                </CardDescription>
              </div>
              <Link href="/dashboard/reports/generate-custom" passHref>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl px-6 shadow-lg shadow-green-500/25 transition-all duration-300">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Generate Custom Report
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, index) => {
              const Icon = report.icon
              return (
                <Link
                  key={index}
                  href={`/dashboard/reports/${report.slug}`} // Dynamic link
                  className={`relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 rounded-3xl group animate-fade-in flex flex-col p-6`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <div className={`w-full h-full bg-gradient-to-br ${report.gradient} rounded-full blur-2xl`}></div>
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${report.iconBg} group-hover:scale-110 transition-transform duration-300 mb-4`}
                  >
                    <Icon className={`h-6 w-6 ${report.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-slate-600 flex-1">{report.description}</p>
                  <Button variant="ghost" size="sm" className="mt-4 self-end text-emerald-600 hover:bg-emerald-50">
                    View Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
