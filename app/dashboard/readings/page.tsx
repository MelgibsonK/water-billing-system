"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Droplets, PlusCircle, CalendarDays, User, MoreHorizontal, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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

export default function ReadingsPage() {
  const [user, setUser] = useState<any>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [meters, setMeters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isRecordReadingOpen, setIsRecordReadingOpen] = useState(false)
  const [isRecordingReading, setIsRecordingReading] = useState(false)
  const [recordReadingSuccess, setRecordReadingSuccess] = useState(false)
  const [recordReadingError, setRecordReadingError] = useState<string | null>(null)
  const [showRecordedBy, setShowRecordedBy] = useState(false)
  const [selectedMeterId, setSelectedMeterId] = useState<string>('')
  
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

  useEffect(() => {
    const loadReadings = async () => {
      try {
        setLoading(true)
        const { data, error } = await db.getMeterReadings()
        
        if (error) {
          console.error('Error loading readings:', error)
          setError('Failed to load readings')
          return
        }

        setReadings(data || [])
      } catch (err) {
        console.error('Error loading readings:', err)
        setError('Failed to load readings')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadReadings()
    }
  }, [user])

  // Load meters for the modal dropdown
  useEffect(() => {
    const loadMeters = async () => {
      if (isRecordReadingOpen) {
        try {
          const { data, error } = await db.getMeters()
          if (!error && data) {
            setMeters(data)
          }
        } catch (err) {
          console.error('Error loading meters:', err)
        }
      }
    }

    loadMeters()
  }, [isRecordReadingOpen])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading readings data...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteReading = async (id: string) => {
    try {
      // In a real app, you would call an API to delete the reading
      // For now, we'll just remove it from the local state
      setReadings((prev) => prev.filter((reading) => reading.id !== id))
      alert(`Reading ${id} deleted! (Placeholder action)`)
    } catch (error) {
      console.error('Error deleting reading:', error)
      alert('Failed to delete reading')
    }
  }

  const handleRecordReading = async (formData: FormData) => {
    try {
      setIsRecordingReading(true)
      setRecordReadingError(null)

      // Debug form data
      console.log('Form data entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      console.log('Selected meter ID from state:', selectedMeterId)
      console.log('User name:', user?.name)

      const readingData = {
        meter_id: formData.get('meterId') as string,
        reading_value: parseFloat(formData.get('readingValue') as string),
        reading_date: formData.get('readingDate') as string,
        recorded_by: showRecordedBy ? user.id : null,
        notes: formData.get('notes') as string || null
      }

      console.log('Sending reading data:', readingData)
      console.log('showRecordedBy state:', showRecordedBy)
      console.log('Meter ID type:', typeof readingData.meter_id)
      console.log('Recorded by type:', typeof readingData.recorded_by)

      const { data, error } = await db.createMeterReading(readingData)
      
      if (error) {
        console.error('Error creating reading:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        setRecordReadingError(`Failed to record reading: ${error.message}`)
        return
      }

      // Log activity
      await db.logActivity({
        user_id: user.id,
        activity_type: 'reading_recorded',
        description: `Recorded new reading: ${readingData.reading_value} m³`,
        details: { reading_id: data?.id, meter_id: readingData.meter_id, reading_value: readingData.reading_value }
      })

      setRecordReadingSuccess(true)
      
      // Refresh readings list
      const { data: newReadings, error: loadError } = await db.getMeterReadings()
      if (!loadError && newReadings) {
        setReadings(newReadings)
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsRecordReadingOpen(false)
        setRecordReadingSuccess(false)
        setRecordReadingError(null)
        setShowRecordedBy(false)
        setSelectedMeterId('')
      }, 2000)

    } catch (err) {
      console.error('Error recording reading:', err)
      setRecordReadingError('Failed to record reading. Please try again.')
    } finally {
      setIsRecordingReading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading readings...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-cyan-500 hover:bg-cyan-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
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
                  <Droplets className="w-6 h-6 mr-3 text-cyan-500" />
                  Meter Readings
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Record and view all meter readings. {readings.length} reading{readings.length !== 1 ? 's' : ''} found.
                </CardDescription>
              </div>
              <Dialog open={isRecordReadingOpen} onOpenChange={setIsRecordReadingOpen}>
                <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl px-6 shadow-lg shadow-cyan-500/25 transition-all duration-300">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Record New Reading
                </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Reading</DialogTitle>
                    <DialogDescription>
                      Record a new meter reading for a customer.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {recordReadingSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✓ Reading recorded successfully!</p>
                    </div>
                  )}
                  
                  {recordReadingError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">{recordReadingError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    
                    // Validate that a meter is selected
                    if (!selectedMeterId) {
                      setRecordReadingError('Please select a meter')
                      return
                    }
                    
                    const formData = new FormData(e.currentTarget)
                    // Add the selected meter ID to form data since Select doesn't work with FormData
                    formData.set('meterId', selectedMeterId)
                    handleRecordReading(formData)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meterId" className="text-right">
                          Meter
                        </Label>
                        <Select 
                          value={selectedMeterId}
                          onValueChange={setSelectedMeterId}
                          required
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a meter" />
                          </SelectTrigger>
                          <SelectContent>
                            {meters.map((meter) => (
                              <SelectItem key={meter.id} value={meter.id}>
                                {meter.meter_number} - {meter.customers?.first_name} {meter.customers?.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="meterId" value={selectedMeterId} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="readingValue" className="text-right">
                          Reading Value (m³)
                        </Label>
                        <Input
                          id="readingValue"
                          name="readingValue"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          placeholder="Enter reading value"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="readingDate" className="text-right">
                          Reading Date
                        </Label>
                        <Input
                          id="readingDate"
                          name="readingDate"
                          type="date"
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-span-4 flex items-center justify-center space-x-2">
                          <Checkbox 
                            id="showRecordedBy" 
                            checked={showRecordedBy}
                            onCheckedChange={(checked) => setShowRecordedBy(checked as boolean)}
                          />
                          <Label htmlFor="showRecordedBy" className="text-sm">
                            Record who took this reading
                          </Label>
                        </div>
                      </div>
                      {showRecordedBy && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="recordedBy" className="text-right">
                            Recorded By
                          </Label>
                          <Input
                            id="recordedBy"
                            name="recordedBy"
                            className="col-span-3"
                            value={user?.name || ''}
                            readOnly
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          className="col-span-3"
                          placeholder="Add any notes for this reading"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsRecordReadingOpen(false)}
                        disabled={isRecordingReading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isRecordingReading}
                      >
                        {isRecordingReading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Droplets className="w-4 h-4 mr-2" />
                        )}
                        {isRecordingReading ? 'Recording...' : 'Record Reading'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {readings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No readings found</h3>
                <p className="text-slate-600 mb-4">Get started by recording your first meter reading.</p>
                <Button 
                  onClick={() => setIsRecordReadingOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Record First Reading
                </Button>
              </div>
            ) : (
              readings.map((reading, index) => (
              <div
                key={reading.id}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-800 truncate">Reading #{reading.id.slice(-6)}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-3 py-1">
                        Recorded
                      </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                      Meter: {reading.meters?.meter_number} 
                      ({reading.meters?.customers?.first_name} {reading.meters?.customers?.last_name})
                  </p>
                  <div className="flex items-center text-sm text-slate-600 mb-1">
                    <CalendarDays className="w-3 h-3 mr-2 text-slate-400" />
                      <span>Date: {formatDate(reading.reading_date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Droplets className="w-3 h-3 mr-2 text-slate-400" />
                    <span>
                        Reading: <span className="font-semibold text-cyan-600">{reading.reading_value} m³</span>
                    </span>
                  </div>
                    {reading.notes && (
                      <p className="text-xs text-slate-500 mt-1">
                        Notes: {reading.notes}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Recorded: {formatDate(reading.created_at)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-2xl hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                    <Link href={`/dashboard/readings/${reading.id}`} passHref>
                      <DropdownMenuItem className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-100">
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/dashboard/readings/${reading.id}/edit`} passHref>
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
                            This action cannot be undone. This will permanently delete the meter reading.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReading(reading.id)}
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
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
