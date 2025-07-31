"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, UserPlus, FileText, DollarSign, Settings, Droplets, AlertTriangle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { db, RecentActivity as RecentActivityType } from "@/lib/supabase"

export function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const { data } = await db.getRecentActivities()
        if (data) {
          setActivities(data)
        }
      } catch (error) {
        console.error("Failed to load recent activities:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  // Function to get icon and styling based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return {
          icon: DollarSign,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-100",
          bgGradient: "from-emerald-50 to-green-50",
        }
      case 'customer_added':
        return {
          icon: UserPlus,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          bgGradient: "from-blue-50 to-indigo-50",
        }
      case 'reading_recorded':
        return {
          icon: Droplets,
          iconColor: "text-cyan-600",
          iconBg: "bg-cyan-100",
          bgGradient: "from-cyan-50 to-blue-50",
        }
      case 'bill_generated':
        return {
          icon: FileText,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
          bgGradient: "from-purple-50 to-pink-50",
        }
      case 'settings_updated':
        return {
          icon: Settings,
          iconColor: "text-slate-600",
          iconBg: "bg-slate-100",
          bgGradient: "from-slate-50 to-gray-50",
        }
      default:
        return {
          icon: Activity,
          iconColor: "text-slate-600",
          iconBg: "bg-slate-100",
          bgGradient: "from-slate-50 to-gray-50",
        }
    }
  }

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

      <CardHeader className="relative z-10 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-purple-500" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-slate-600 text-base">
          Latest system activities and user actions
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">No recent activities</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const activityIcon = getActivityIcon(activity.activity_type)
              const Icon = activityIcon.icon
              return (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-4 p-4 bg-gradient-to-r ${activityIcon.bgGradient} rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 rounded-2xl ${activityIcon.iconBg} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${activityIcon.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-800">{activity.description}</p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimestamp(activity.created_at)}
                      </div>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-slate-600 mb-2">
                        {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 font-medium">
                      by {activity.user_name || 'System'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
