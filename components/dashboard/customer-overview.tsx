"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MapPin, Phone, Mail, MoreHorizontal, UserPlus, Star, Eye, Edit, Trash2, Loader2 } from "lucide-react"
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
import Link from "next/link"
import { useState, useEffect } from "react"
import { db } from "@/lib/supabase"

export function CustomerOverview() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getCustomers()
        
        if (error) {
          console.error('Error loading customers:', error)
          setError('Failed to load customers')
          return
        }

        setCustomers(data || [])
      } catch (err) {
        console.error('Error loading customers:', err)
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const handleDeleteCustomer = async (id: string) => {
    try {
      // In a real app, you would call an API to delete the customer
      setCustomers((prev) => prev.filter((customer) => customer.id !== id))
      alert(`Customer ${id} deleted! (Placeholder action)`)
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
    }
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
                <Users className="w-5 h-5 mr-2 text-emerald-500" />
                Recent Customers
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm mt-1">
                Latest customer registrations and activity.
              </CardDescription>
            </div>
            <Link href="/dashboard/customers/add">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 shadow-lg shadow-emerald-500/25 transition-all duration-300">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="ml-2 text-slate-600">Loading customers...</span>
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
                <Users className="w-5 h-5 mr-2 text-emerald-500" />
                Recent Customers
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm mt-1">
                Latest customer registrations and activity.
              </CardDescription>
            </div>
            <Link href="/dashboard/customers/add">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 shadow-lg shadow-emerald-500/25 transition-all duration-300">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-emerald-500 hover:bg-emerald-600"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const customerStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.is_active).length,
    newThisMonth: customers.filter(c => {
      const joinDate = new Date(c.created_at)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length
  }

  const recentCustomers = customers.slice(0, 4) // Show only 4 most recent

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
      <CardHeader className="relative z-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-emerald-500" />
              Recent Customers
        </CardTitle>
            <CardDescription className="text-slate-600 text-sm mt-1">
              Latest customer registrations and activity.
        </CardDescription>
          </div>
          <Link href="/dashboard/customers/add">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 shadow-lg shadow-emerald-500/25 transition-all duration-300">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No customers found</h3>
            <p className="text-slate-600 mb-4">Get started by adding your first customer.</p>
            <Link href="/dashboard/customers/add">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Customer
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-800">{customerStats.totalCustomers}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-slate-800">{customerStats.activeCustomers}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">New This Month</p>
                    <p className="text-2xl font-bold text-slate-800">{customerStats.newThisMonth}</p>
                </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

            <div className="space-y-3">
              {recentCustomers.map((customer, index) => (
              <div
                key={customer.id}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                  <Avatar className="h-10 w-10 ring-2 ring-emerald-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm">
                      {`${customer.first_name} ${customer.last_name}`
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {customer.first_name} {customer.last_name}
                      </p>
                      {customer.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-2 py-0.5 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full px-2 py-0.5 text-xs">
                          Inactive
                        </Badge>
                      )}
                  </div>
                    <div className="flex items-center text-xs text-slate-600 space-x-3">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" />
                        {customer.email || 'No email'}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" />
                        {customer.phone || 'No phone'}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {customer.city || 'No city'}
                      </span>
                  </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Joined: {formatDate(customer.created_at)}
                    </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
                      <Link href={`/dashboard/customers/${customer.id}`}>
                      <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </Link>
                      <Link href={`/dashboard/customers/${customer.id}/edit`}>
                      <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

            {customers.length > 4 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/customers">
                  <Button variant="outline" className="rounded-xl">
                    View All Customers ({customers.length})
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
