"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Droplets, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Total Customers",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active connections",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Monthly Revenue",
      value: "KSh 1.2M",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Current month earnings",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Pending Bills",
      value: "342",
      change: "-5%",
      changeType: "positive" as const, // Changed to positive as per previous context, assuming it's a target reduction
      icon: FileText,
      description: "Awaiting payment",
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Water Usage",
      value: "45.2K m³",
      change: "+3.1%",
      changeType: "neutral" as const,
      icon: Droplets,
      description: "This month usage",
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      title: "Collection Rate",
      value: "87.5%",
      change: "+2.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Payment efficiency",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Overdue Accounts",
      value: "156",
      change: "+15%",
      changeType: "negative" as const,
      icon: AlertTriangle,
      description: "Need attention",
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgGradient} hover:shadow-2xl hover:shadow-${stat.iconColor.split("-")[1]}-500/20 transition-all duration-500 hover:-translate-y-1 rounded-3xl group animate-fade-in w-full`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl`}></div>
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3 relative z-10">
              <CardTitle className="text-xs lg:text-sm font-semibold text-slate-600 group-hover:text-slate-700 transition-colors">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 lg:p-3 rounded-2xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800 mb-1 lg:mb-2 group-hover:text-slate-900 transition-colors">
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs lg:text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                  {stat.description}
                </p>
                <Badge
                  className={`text-xs font-semibold px-2 lg:px-3 py-1 rounded-full ${
                    stat.changeType === "positive"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : stat.changeType === "negative"
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } transition-all duration-300`}
                >
                  {stat.changeType === "positive" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {stat.changeType === "negative" && <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.changeType === "neutral" && <Sparkles className="w-3 h-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
