"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, CalendarDays, MoreHorizontal, Eye, Mail, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState, useEffect } from "react"
import { db } from "@/lib/supabase"

export function BillingOverview() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getBills()
        
        if (error) {
          console.error('Error loading bills:', error)
          setError('Failed to load bills')
          return
        }

        setBills(data || [])
      } catch (err) {
        console.error('Error loading bills:', err)
        setError('Failed to load bills')
      } finally {
        setLoading(false)
      }
    }

    loadBills()
  }, [])

  const handleSendReminder = async (id: string) => {
    try {
      // In a real app, you would call an API to send a reminder
      alert(`Reminder sent for bill ${id}! (Placeholder action)`)
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
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

  if (loading) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Recent Bills
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm mt-1">
                Latest billing activity and outstanding amounts.
              </CardDescription>
            </div>
            <Link href="/dashboard/bills/generate">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4 shadow-lg shadow-purple-500/25 transition-all duration-300">
                <FileText className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            <span className="ml-2 text-slate-600">Loading bills...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Recent Bills
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm mt-1">
                Latest billing activity and outstanding amounts.
              </CardDescription>
            </div>
            <Link href="/dashboard/bills/generate">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4 shadow-lg shadow-purple-500/25 transition-all duration-300">
                <FileText className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-purple-500 hover:bg-purple-600"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const billingStats = {
    totalBills: bills.length,
    pendingBills: bills.filter(bill => bill.status === 'pending').length,
    overdueBills: bills.filter(bill => bill.status === 'overdue').length,
    totalAmount: bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
  }

  const recentBills = bills.slice(0, 4) // Show only 4 most recent

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-2 py-0.5 text-xs">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full px-2 py-0.5 text-xs">
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full px-2 py-0.5 text-xs">
            Overdue
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-2 py-0.5 text-xs">
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs">
            {status}
          </Badge>
        )
    }
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
      <CardHeader className="relative z-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-500" />
              Recent Bills
        </CardTitle>
            <CardDescription className="text-slate-600 text-sm mt-1">
              Latest billing activity and outstanding amounts.
        </CardDescription>
          </div>
          <Link href="/dashboard/bills/generate">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4 shadow-lg shadow-purple-500/25 transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Generate Bill
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {bills.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No bills found</h3>
            <p className="text-slate-600 mb-4">Get started by generating your first bill.</p>
            <Link href="/dashboard/bills/generate">
              <Button className="bg-purple-500 hover:bg-purple-600">
                <FileText className="w-4 h-4 mr-2" />
                Generate First Bill
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                    <p className="text-sm font-medium text-slate-600">Total Bills</p>
                    <p className="text-2xl font-bold text-slate-800">{billingStats.totalBills}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(billingStats.totalAmount)}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pending</p>
                    <p className="text-2xl font-bold text-slate-800">{billingStats.pendingBills}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-4 border border-rose-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Overdue</p>
                    <p className="text-2xl font-bold text-slate-800">{billingStats.overdueBills}</p>
                  </div>
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-rose-600" />
          </div>
          </div>
          </div>
        </div>

            <div className="space-y-3">
            {recentBills.map((bill, index) => (
              <div
                key={bill.id}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {bill.bill_number}
                      </p>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="flex items-center text-xs text-slate-600 space-x-3">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1 text-slate-400" />
                        {formatCurrency(bill.total_amount)}
                      </span>
                      <span className="flex items-center">
                        <CalendarDays className="w-3 h-3 mr-1 text-slate-400" />
                        Due: {formatDate(bill.due_date)}
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1 text-slate-400" />
                        {bill.customers?.first_name} {bill.customers?.last_name}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
                      <Link href={`/dashboard/bills/${bill.id}`}>
                        <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem 
                        onClick={() => handleSendReminder(bill.id)}
                        className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                      >
                        <Mail className="mr-2 h-4 w-4" /> Send Reminder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {bills.length > 4 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/bills">
                  <Button variant="outline" className="rounded-xl">
                    View All Bills ({bills.length})
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
