"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Gauge, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Loader2, CheckCircle, AlertCircle, CalendarDays, MapPin, User } from "lucide-react"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db } from "@/lib/supabase"

export default function MetersPage() {
  const [user, setUser] = useState<any>(null)
  const [meters, setMeters] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal states
  const [isAddMeterOpen, setIsAddMeterOpen] = useState(false)
  const [isAddingMeter, setIsAddingMeter] = useState(false)
  const [addMeterSuccess, setAddMeterSuccess] = useState(false)
  const [addMeterError, setAddMeterError] = useState<string | null>(null)
  
  // View and Edit popup states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState<any>(null)
  const [isEditingMeter, setIsEditingMeter] = useState(false)
  const [editMeterError, setEditMeterError] = useState<string | null>(null)
  const [editMeterSuccess, setEditMeterSuccess] = useState(false)
  
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
    const loadMeters = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getMeters()
        
        if (error) {
          console.error('Error loading meters:', error)
          setError('Failed to load meters')
          return
        }

        setMeters(data || [])
      } catch (err) {
        console.error('Error loading meters:', err)
        setError('Failed to load meters')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadMeters()
    }
  }, [user])

  const handleDeleteMeter = async (id: string) => {
    try {
      // Get meter details before deletion for logging
      const meterToDelete = meters.find(m => m.id === id)
      
      // In a real app, you would call an API to delete the meter
      // For now, just remove from local state
      setMeters(meters.filter(meter => meter.id !== id))
      
      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_added',
          description: `Deleted meter: ${meterToDelete?.meter_number}`,
          details: {
            meter_id: id,
            meter_number: meterToDelete?.meter_number,
            meter_type: meterToDelete?.meter_type,
            action: 'deleted'
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }
    } catch (error) {
      console.error('Error deleting meter:', error)
      // You could add a toast notification here for error
    }
  }

  const handleViewMeter = (meter: any) => {
    setSelectedMeter(meter)
    setIsViewModalOpen(true)
  }

  const handleEditMeter = (meter: any) => {
    setSelectedMeter(meter)
    setIsEditModalOpen(true)
    setEditMeterError(null)
    setEditMeterSuccess(false)
  }

  const handleUpdateMeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditingMeter(true)
    setEditMeterError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const meterData = Object.fromEntries(formData.entries())

      // Prepare data for database update
      const updatedMeter = {
        meter_number: meterData.meterNumber as string,
        meter_type: meterData.meterType as string,
        customer_id: meterData.customerId as string,
        installation_date: meterData.installationDate as string,
        last_reading: parseFloat(meterData.lastReading as string) || 0,
        last_reading_date: meterData.lastReadingDate as string || null,
        is_active: meterData.isActive === 'true'
      }

      // Update in database
      const { data, error: dbError } = await db.updateMeter(selectedMeter.id, updatedMeter)

      if (dbError) {
        console.error('Database error:', dbError)
        setEditMeterError('Failed to update meter. Please try again.')
        return
      }

      // Log activity
      try {
        await db.logActivity({
          user_id: user.id,
          activity_type: 'customer_added',
          description: `Updated meter: ${updatedMeter.meter_number}`,
          details: {
            meter_id: selectedMeter.id,
            meter_number: updatedMeter.meter_number,
            meter_type: updatedMeter.meter_type
          }
        })
      } catch (activityError) {
        console.error('Activity logging error:', activityError)
        // Don't fail the operation if activity logging fails
      }

      // Update local state
      setMeters(meters.map(meter => 
        meter.id === selectedMeter.id ? { ...meter, ...updatedMeter } : meter
      ))
      
      // Show success and close modal
      setEditMeterSuccess(true)
      setTimeout(() => {
        setIsEditModalOpen(false)
        setEditMeterSuccess(false)
        setSelectedMeter(null)
      }, 1500)

    } catch (err) {
      console.error('Error updating meter:', err)
      setEditMeterError('An unexpected error occurred. Please try again.')
    } finally {
      setIsEditingMeter(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredMeters = meters.filter(meter =>
    meter.meter_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.meter_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Load customers for the modal dropdown
  useEffect(() => {
    const loadCustomers = async () => {
      if (isAddMeterOpen) {
        try {
          const { data, error } = await db.getCustomers()
          if (!error && data) {
            setCustomers(data)
          }
        } catch (err) {
          console.error('Error loading customers:', err)
        }
      }
    }

    loadCustomers()
  }, [isAddMeterOpen])

  const handleAddMeter = async (formData: FormData) => {
    try {
      setIsAddingMeter(true)
      setAddMeterError(null)

      const meterData = {
        meter_number: formData.get('meterNumber') as string,
        meter_type: formData.get('meterType') as string,
        customer_id: formData.get('customerId') as string,
        installation_date: formData.get('installationDate') as string,
        last_reading: 0,
        last_reading_date: null,
        is_active: true
      }

      const { data, error } = await db.createMeter(meterData)
      
      if (error) {
        console.error('Error creating meter:', error)
        setAddMeterError('Failed to create meter. Please try again.')
        return
      }

      // Log activity
      await db.logActivity({
        user_id: user.id,
        activity_type: 'customer_added',
        description: `Added new meter: ${meterData.meter_number}`,
        details: { meter_id: data?.id, meter_number: meterData.meter_number }
      })

      setAddMeterSuccess(true)
      
      // Refresh meters list
      const { data: newMeters, error: loadError } = await db.getMeters()
      if (!loadError && newMeters) {
        setMeters(newMeters)
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsAddMeterOpen(false)
        setAddMeterSuccess(false)
        setAddMeterError(null)
      }, 2000)

    } catch (err) {
      console.error('Error creating meter:', err)
      setAddMeterError('Failed to create meter. Please try again.')
    } finally {
      setIsAddingMeter(false)
    }
  }

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
                  <Gauge className="w-6 h-6 mr-3 text-blue-500" />
                  Meters
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Manage water meters and their readings.
                </CardDescription>
              </div>
              <Dialog open={isAddMeterOpen} onOpenChange={setIsAddMeterOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-6 shadow-lg shadow-blue-500/25 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Meter
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Meter</DialogTitle>
                    <DialogDescription>
                      Add a new water meter to your system.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {addMeterSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✓ Meter added successfully!</p>
                    </div>
                  )}
                  
                  {addMeterError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">{addMeterError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAddMeter(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meterNumber" className="text-right">
                          Meter Number
                        </Label>
                        <Input
                          id="meterNumber"
                          name="meterNumber"
                          className="col-span-3"
                          placeholder="Enter meter number"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meterType" className="text-right">
                          Meter Type
                        </Label>
                        <Select name="meterType" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a meter type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="water">Water Meter</SelectItem>
                            <SelectItem value="gas">Gas Meter</SelectItem>
                            <SelectItem value="electricity">Electricity Meter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customerId" className="text-right">
                          Customer
                        </Label>
                        <Select name="customerId" required>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.first_name} {customer.last_name} - {customer.customer_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="installationDate" className="text-right">
                          Installation Date
                        </Label>
                        <Input
                          id="installationDate"
                          name="installationDate"
                          type="date"
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddMeterOpen(false)}
                        disabled={isAddingMeter}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isAddingMeter}
                      >
                        {isAddingMeter ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isAddingMeter ? 'Adding...' : 'Add Meter'}
                </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* View Meter Details Dialog */}
              <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-500" />
                      Meter Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      View complete meter information.
                    </DialogDescription>
                  </DialogHeader>

                  {selectedMeter && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                            Meter Number
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedMeter.meter_number}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            Meter Type
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedMeter.meter_type}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Customer
                        </Label>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                          {selectedMeter.customers?.first_name} {selectedMeter.customers?.last_name} ({selectedMeter.customers?.customer_number})
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                            Installation Date
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {formatDate(selectedMeter.installation_date)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                            Last Reading
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedMeter.last_reading || 0} m³
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                            Last Reading Date
                          </Label>
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                            {selectedMeter.last_reading_date ? formatDate(selectedMeter.last_reading_date) : 'Not recorded'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">Status</Label>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <Badge className={`rounded-full px-2 py-0.5 text-xs ${
                              selectedMeter.is_active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {selectedMeter.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Date Added</Label>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
                          {formatDate(selectedMeter.created_at)}
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
                            handleEditMeter(selectedMeter)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Meter
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Meter Dialog */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                      <Edit className="w-5 h-5 mr-2 text-blue-500" />
                      Edit Meter
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Update meter information.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Success Message */}
                  {editMeterSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <p className="text-emerald-700 font-medium">Meter updated successfully!</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {editMeterError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700 font-medium">{editMeterError}</p>
                      </div>
                    </div>
                  )}

                  {selectedMeter && (
                    <form onSubmit={handleUpdateMeter} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editMeterNumber" className="text-slate-700 font-semibold flex items-center">
                            <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                            Meter Number *
                          </Label>
                          <Input 
                            id="editMeterNumber" 
                            name="meterNumber" 
                            defaultValue={selectedMeter.meter_number}
                            placeholder="MTR0001" 
                            required 
                            className="h-11 rounded-xl" 
                            disabled={isEditingMeter}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editMeterType" className="text-slate-700 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            Meter Type *
                          </Label>
                          <Select name="meterType" defaultValue={selectedMeter.meter_type} required>
                            <SelectTrigger className="h-11 rounded-xl" disabled={isEditingMeter}>
                              <SelectValue placeholder="Select meter type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Digital Water Meter">Digital Water Meter</SelectItem>
                              <SelectItem value="Smart Water Meter">Smart Water Meter</SelectItem>
                              <SelectItem value="Standard Water Meter">Standard Water Meter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editCustomerId" className="text-slate-700 font-semibold flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Customer *
                        </Label>
                        <Select name="customerId" defaultValue={selectedMeter.customer_id} required>
                          <SelectTrigger className="h-11 rounded-xl" disabled={isEditingMeter}>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.first_name} {customer.last_name} ({customer.customer_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editInstallationDate" className="text-slate-700 font-semibold flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                            Installation Date *
                          </Label>
                          <Input 
                            id="editInstallationDate" 
                            name="installationDate" 
                            type="date"
                            defaultValue={selectedMeter.installation_date}
                            required 
                            className="h-11 rounded-xl" 
                            disabled={isEditingMeter}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editLastReading" className="text-slate-700 font-semibold flex items-center">
                            <Gauge className="w-4 h-4 mr-2 text-blue-600" />
                            Last Reading
                          </Label>
                          <Input
                            id="editLastReading"
                            name="lastReading"
                            type="number"
                            step="0.1"
                            defaultValue={selectedMeter.last_reading || 0}
                            placeholder="0.0"
                            className="h-11 rounded-xl"
                            disabled={isEditingMeter}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editLastReadingDate" className="text-slate-700 font-semibold flex items-center">
                          <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                          Last Reading Date
                        </Label>
                        <Input
                          id="editLastReadingDate"
                          name="lastReadingDate"
                          type="date"
                          defaultValue={selectedMeter.last_reading_date || ''}
                          className="h-11 rounded-xl"
                          disabled={isEditingMeter}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editIsActive" className="text-slate-700 font-semibold">
                          Status
                        </Label>
                        <select
                          id="editIsActive"
                          name="isActive"
                          defaultValue={selectedMeter.is_active.toString()}
                          className="w-full h-11 rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isEditingMeter}
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
                          disabled={isEditingMeter}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isEditingMeter}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 disabled:opacity-50"
                        >
                          {isEditingMeter ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Update Meter
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
                  placeholder="Search meters by number, type, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Gauge className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Meters List */}
            {!error && (
              <>
                {meters.length === 0 && !loading ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Gauge className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No meters found</h3>
                    <p className="text-slate-600 mb-6">Get started by adding your first meter.</p>
                    <Button 
                      onClick={() => setIsAddMeterOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Meter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMeters.map((meter, index) => (
                      <div
                        key={meter.id}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <Gauge className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">
                              {meter.meter_number}
                            </h3>
                            <Badge className={`rounded-full px-2 py-0.5 text-xs ${
                              meter.is_active 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {meter.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                  </div>
                          <div className="flex items-center text-sm text-slate-600 space-x-4">
                            <span className="flex items-center">
                              <Gauge className="w-3 h-3 mr-1 text-slate-400" />
                              {meter.meter_type}
                            </span>
                            <span className="flex items-center">
                              <Gauge className="w-3 h-3 mr-1 text-slate-400" />
                              {meter.customers?.first_name} {meter.customers?.last_name}
                            </span>
                            <span className="flex items-center">
                              <Gauge className="w-3 h-3 mr-1 text-slate-400" />
                              Last: {meter.last_reading || 0} m³
                            </span>
                  </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Installed: {formatDate(meter.installation_date)}
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
                              onClick={() => handleViewMeter(meter)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100"
                              onClick={() => handleEditMeter(meter)}
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
                                    This action cannot be undone. This will permanently delete the meter record and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMeter(meter.id)}
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
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
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
