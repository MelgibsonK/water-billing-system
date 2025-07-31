"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Loader2, CheckCircle, AlertCircle, X, Mail, Phone, MapPin, MapIcon as City, Home } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db } from "@/lib/supabase"

export default function CustomersPage() {
  const [user, setUser] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null)
  const [addCustomerSuccess, setAddCustomerSuccess] = useState(false)
  
  // View and Edit popup states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [editCustomerError, setEditCustomerError] = useState<string | null>(null)
  const [editCustomerSuccess, setEditCustomerSuccess] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

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

    if (user) {
      loadCustomers()
    }
  }, [user])

  const handleDeleteCustomer = async (id: string) => {
    try {
      // Get customer details before deletion for logging
      const customerToDelete = customers.find(c => c.id === id)
      
      // Delete from database
      const { data, error: dbError } = await db.deleteCustomer(id)
      
      if (dbError) {
        console.error('Database error:', dbError)
        console.error('Error details:', {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code
        })
        // You could add a toast notification here for error
        return
      }

      // Remove from local state
      setCustomers(customers.filter(customer => customer.id !== id))
      
      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_updated',
          description: `Deleted customer: ${customerToDelete?.first_name} ${customerToDelete?.last_name} (${customerToDelete?.customer_number})`,
          details: {
            customer_id: id,
            customer_number: customerToDelete?.customer_number,
            customer_name: `${customerToDelete?.first_name} ${customerToDelete?.last_name}`,
            action: 'deleted'
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      // You could add a toast notification here for error
    }
  }

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsEditModalOpen(true)
    setEditCustomerError(null)
    setEditCustomerSuccess(false)
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditingCustomer(true)
    setEditCustomerError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const customerData = Object.fromEntries(formData.entries())

      // Prepare data for database update
      const updatedCustomer = {
        first_name: customerData.firstName as string,
        last_name: customerData.lastName as string,
        email: customerData.email as string || null,
        phone: customerData.phone as string || null,
        address: customerData.address as string,
        city: customerData.city as string || null,
        postal_code: customerData.postalCode as string || null,
        is_active: customerData.isActive === 'true'
      }

      // Update in database
      const { data, error: dbError } = await db.updateCustomer(selectedCustomer.id, updatedCustomer)

      if (dbError) {
        console.error('Database error:', dbError)
        setEditCustomerError('Failed to update customer. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_updated',
          description: `Updated customer: ${updatedCustomer.first_name} ${updatedCustomer.last_name}`,
          details: {
            customer_id: selectedCustomer.id,
            customer_number: selectedCustomer.customer_number,
            customer_name: `${updatedCustomer.first_name} ${updatedCustomer.last_name}`
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id ? { ...customer, ...updatedCustomer } : customer
      ))
      
      // Show success and close modal
      setEditCustomerSuccess(true)
      setTimeout(() => {
        setIsEditModalOpen(false)
        setEditCustomerSuccess(false)
        setSelectedCustomer(null)
      }, 1500)

    } catch (err) {
      console.error('Error updating customer:', err)
      setEditCustomerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsEditingCustomer(false)
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingCustomer(true)
    setAddCustomerError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const customerData = Object.fromEntries(formData.entries())

      // Generate customer number
      const timestamp = Date.now().toString().slice(-6)
      const customerNumber = `CUST${timestamp}`

      // Prepare data for database
      const newCustomer = {
        customer_number: customerNumber,
        first_name: customerData.firstName as string,
        last_name: customerData.lastName as string,
        email: customerData.email as string || null,
        phone: customerData.phone as string || null,
        address: customerData.address as string,
        city: customerData.city as string || null,
        postal_code: customerData.postalCode as string || null,
        is_active: true
      }

      // Save to database
      const { data, error: dbError } = await db.createCustomer(newCustomer)

      if (dbError) {
        console.error('Database error:', dbError)
        setAddCustomerError('Failed to add customer. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_added',
          description: `Added new customer: ${newCustomer.first_name} ${newCustomer.last_name}`,
          details: {
            customer_id: data.id,
            customer_number: customerNumber,
            customer_name: `${newCustomer.first_name} ${newCustomer.last_name}`
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }

      // Add to local state
      setCustomers([data, ...customers])
      
      // Show success and close modal
      setAddCustomerSuccess(true)
      setTimeout(() => {
        setIsAddModalOpen(false)
        setAddCustomerSuccess(false)
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
      }, 1500)

    } catch (err) {
      console.error('Error adding customer:', err)
      setAddCustomerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsAddingCustomer(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  Customers
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Manage your water utility customers and their information.
                </CardDescription>
              </div>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-6 shadow-lg shadow-emerald-500/25 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-emerald-500" />
                Add New Customer
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Fill in the details to register a new customer.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Success Message */}
                  {addCustomerSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-emerald-700 font-medium">Customer added successfully!</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {addCustomerError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700 font-medium">{addCustomerError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 font-semibold">
                          First Name *
                        </Label>
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          placeholder="John" 
                          required 
                          className="h-11 rounded-xl" 
                          disabled={isAddingCustomer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 font-semibold">
                          Last Name *
                        </Label>
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          placeholder="Doe" 
                          required 
                          className="h-11 rounded-xl" 
                          disabled={isAddingCustomer}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-semibold">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          className="h-11 rounded-xl"
                          disabled={isAddingCustomer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 font-semibold">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+2547XXXXXXXX"
                          required
                          className="h-11 rounded-xl"
                          disabled={isAddingCustomer}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-slate-700 font-semibold">
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="123 Main Street"
                        required
                        rows={2}
                        className="rounded-xl"
                        disabled={isAddingCustomer}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-700 font-semibold">
                          City *
                        </Label>
                        <Input 
                          id="city" 
                          name="city" 
                          placeholder="Nairobi" 
                          required 
                          className="h-11 rounded-xl" 
                          disabled={isAddingCustomer}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-slate-700 font-semibold">
                          Postal Code
                        </Label>
                        <Input 
                          id="postalCode" 
                          name="postalCode" 
                          placeholder="00100" 
                          className="h-11 rounded-xl" 
                          disabled={isAddingCustomer}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                        disabled={isAddingCustomer}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isAddingCustomer}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 disabled:opacity-50"
                      >
                        {isAddingCustomer ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Customer
                          </>
                        )}
              </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* View Customer Details Dialog */}
              <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-emerald-500" />
                      Customer Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      View complete customer information.
                    </DialogDescription>
                  </DialogHeader>

                  {selectedCustomer && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">First Name</Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.first_name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Last Name</Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.last_name}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                            Email Address
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.email || 'Not provided'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                            Phone Number
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.phone || 'Not provided'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold flex items-center">
                          <Home className="w-4 h-4 mr-2 text-emerald-600" />
                          Address
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                          {selectedCustomer.address}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <City className="w-4 h-4 mr-2 text-emerald-600" />
                            City
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.city || 'Not provided'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                            Postal Code
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.postal_code || 'Not provided'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Customer Number</Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedCustomer.customer_number}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Status</Label>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <Badge className={`rounded-full px-2 py-0.5 text-xs ${
                              selectedCustomer.is_active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Date Added</Label>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                          {formatDate(selectedCustomer.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsViewModalOpen(false)}
                          className="rounded-xl"
                        >
                          Close
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsViewModalOpen(false)
                            handleEditCustomer(selectedCustomer)
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Customer
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Customer Dialog */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                      <Edit className="w-5 h-5 mr-2 text-emerald-500" />
                      Edit Customer
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Update customer information.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Success Message */}
                  {editCustomerSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-emerald-700 font-medium">Customer updated successfully!</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {editCustomerError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700 font-medium">{editCustomerError}</p>
                      </div>
                    </div>
                  )}

                  {selectedCustomer && (
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editFirstName" className="text-slate-700 font-semibold">
                            First Name *
                          </Label>
                          <Input 
                            id="editFirstName" 
                            name="firstName" 
                            defaultValue={selectedCustomer.first_name}
                            placeholder="John" 
                            required 
                            className="h-11 rounded-xl" 
                            disabled={isEditingCustomer}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editLastName" className="text-slate-700 font-semibold">
                            Last Name *
                          </Label>
                          <Input 
                            id="editLastName" 
                            name="lastName" 
                            defaultValue={selectedCustomer.last_name}
                            placeholder="Doe" 
                            required 
                            className="h-11 rounded-xl" 
                            disabled={isEditingCustomer}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editEmail" className="text-slate-700 font-semibold flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                            Email Address
                          </Label>
                          <Input
                            id="editEmail"
                            name="email"
                            type="email"
                            defaultValue={selectedCustomer.email || ''}
                            placeholder="john.doe@example.com"
                            className="h-11 rounded-xl"
                            disabled={isEditingCustomer}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editPhone" className="text-slate-700 font-semibold flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                            Phone Number *
                          </Label>
                          <Input
                            id="editPhone"
                            name="phone"
                            type="tel"
                            defaultValue={selectedCustomer.phone || ''}
                            placeholder="+2547XXXXXXXX"
                            required
                            className="h-11 rounded-xl"
                            disabled={isEditingCustomer}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editAddress" className="text-slate-700 font-semibold flex items-center">
                          <Home className="w-4 h-4 mr-2 text-emerald-600" />
                          Address *
                        </Label>
                        <Textarea
                          id="editAddress"
                          name="address"
                          defaultValue={selectedCustomer.address}
                          placeholder="123 Main Street"
                          required
                          rows={2}
                          className="rounded-xl"
                          disabled={isEditingCustomer}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editCity" className="text-slate-700 font-semibold flex items-center">
                            <City className="w-4 h-4 mr-2 text-emerald-600" />
                            City *
                          </Label>
                          <Input 
                            id="editCity" 
                            name="city" 
                            defaultValue={selectedCustomer.city || ''}
                            placeholder="Nairobi" 
                            required 
                            className="h-11 rounded-xl" 
                            disabled={isEditingCustomer}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editPostalCode" className="text-slate-700 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                            Postal Code
                          </Label>
                          <Input 
                            id="editPostalCode" 
                            name="postalCode" 
                            defaultValue={selectedCustomer.postal_code || ''}
                            placeholder="00100" 
                            className="h-11 rounded-xl" 
                            disabled={isEditingCustomer}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editIsActive" className="text-slate-700 font-semibold">
                          Status
                        </Label>
                        <select
                          id="editIsActive"
                          name="isActive"
                          defaultValue={selectedCustomer.is_active.toString()}
                          className="w-full h-11 rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                          disabled={isEditingCustomer}
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditModalOpen(false)}
                          disabled={isEditingCustomer}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isEditingCustomer}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 disabled:opacity-50"
                        >
                          {isEditingCustomer ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Update Customer
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search customers by name, number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                  </div>
                  </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Customers List */}
            {!error && (
              <>
                {customers.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No customers found</h3>
                    <p className="text-slate-600 mb-6">Get started by adding your first customer.</p>
                    <Button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Customer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">
                              {customer.first_name} {customer.last_name}
                            </h3>
                            <Badge className={`rounded-full px-2 py-0.5 text-xs ${
                              customer.is_active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {customer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-slate-600 space-x-4">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1 text-slate-400" />
                              {customer.customer_number}
                            </span>
                            {customer.email && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1 text-slate-400" />
                                {customer.email}
                              </span>
                            )}
                            {customer.phone && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1 text-slate-400" />
                                {customer.phone}
                              </span>
                            )}
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1 text-slate-400" />
                              {customer.city || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Added: {formatDate(customer.created_at)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl hover:bg-slate-100">
                              <MoreHorizontal className="w-4 h-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
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
                                    This action cannot be undone. This will permanently delete the customer record and all associated data.
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
                )}

                {/* Loading indicator for background updates */}
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    <span className="ml-2 text-sm text-slate-600">Updating...</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
