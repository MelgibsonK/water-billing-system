"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card" // Removed CardHeader, CardDescription, CardTitle
import { UserPlus, FileText, Droplets, CreditCard, Gauge } from "lucide-react" // Removed Zap

interface QuickActionsProps {
  onAddCustomer?: () => void
  onAddMeter?: () => void
  onRecordReading?: () => void
  onProcessPayment?: () => void
  onGenerateBills?: () => void
}

export function QuickActions({ 
  onAddCustomer, 
  onAddMeter,
  onRecordReading, 
  onProcessPayment, 
  onGenerateBills 
}: QuickActionsProps) {
  const actions = [
    {
      title: "Add Customer",
      icon: UserPlus,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      onClick: onAddCustomer,
    },
    {
      title: "Add Meter",
      icon: Gauge,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      onClick: onAddMeter,
    },
    {
      title: "Record Reading",
      icon: Droplets,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-100",
      onClick: onRecordReading,
    },
    {
      title: "Process Payment",
      icon: CreditCard,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      onClick: onProcessPayment,
    },
    {
      title: "Generate Bills",
      icon: FileText,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      onClick: onGenerateBills,
    },
  ]

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl w-full">
      {/* Removed CardHeader with title and description */}
      <CardContent className="p-4 lg:p-6">
        {" "}
        {/* Adjusted padding for better spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-2 lg:p-3 space-y-1 bg-slate-50/50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`p-2 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${action.iconColor}`} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 text-sm lg:text-base group-hover:text-slate-900 transition-colors">
                    {action.title}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
