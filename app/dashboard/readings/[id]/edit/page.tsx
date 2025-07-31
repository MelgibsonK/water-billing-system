"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplets, ArrowLeft, CalendarDays, User, Loader2, Save } from "lucide-react"
import { db } from "@/lib/supabase"

export default function EditReadingPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [meters, setMeters] = useState<any[]>([])
  const [readingData, setReadingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { id } = params

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(session))
  }, [router])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load meters for the dropdown
        const { data: metersData, error: metersError } = await db.getMeters()
        if (metersError) {
          console.error('Error loading meters:', metersError)
          setError('Failed to load meters')
          return
        }

        // Load reading data
        const { data: readingDataResult, error: readingError } = await db.getMeterReading(id as string)
        if (readingError) {
          console.error('Error loading reading:', readingError)
          setError('Failed to load reading data')
          return
        }

        setMeters(metersData || [])
        setReadingData(readingDataResult)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      loadData()
    }
  }, [user, id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading reading data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !readingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 w-full overflow-x-hidden relative">
        <DashboardHeader user={user} />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
                <Droplets className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error || 'Reading not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/readings')} 
                className="mt-4 bg-cyan-500 hover:bg-cyan-600"
              >
                Back to Readings
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const updatedData = Object.fromEntries(formData.entries())

    console.log("Updated Reading Data:", updatedData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    alert("Reading updated successfully! (Placeholder action)")
    setIsLoading(false)
    router.push("/dashboard/readings")
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
                  Edit Reading
                </CardTitle>
                <CardDescription className="text-slate-600 text-base mt-1">
                  Update meter reading information.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="rounded-2xl px-6 transition-all duration-300 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Readings
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meterId" className="text-slate-700 font-semibold flex items-center">
                      <Droplets className="w-4 h-4 mr-2 text-cyan-600" />
                      Meter
                    </Label>
                    <Select name="meterId" defaultValue={readingData.meter_id} required>
                      <SelectTrigger id="meterId" className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a meter" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {meters.map((meter) => (
                          <SelectItem key={meter.id} value={meter.id}>
                            {meter.meter_number} ({meter.customers?.first_name} {meter.customers?.last_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readingValue" className="text-slate-700 font-semibold flex items-center">
                      <Droplets className="w-4 h-4 mr-2 text-cyan-600" />
                      Reading Value (m³)
                    </Label>
                    <Input
                      id="readingValue"
                      name="readingValue"
                      type="number"
                      step="0.1"
                      defaultValue={readingData.reading_value}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="readingDate" className="text-slate-700 font-semibold flex items-center">
                      <CalendarDays className="w-4 h-4 mr-2 text-cyan-600" />
                      Reading Date
                    </Label>
                    <Input
                      id="readingDate"
                      name="readingDate"
                      type="date"
                      defaultValue={readingData.reading_date}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recordedBy" className="text-slate-700 font-semibold flex items-center">
                      <User className="w-4 h-4 mr-2 text-cyan-600" />
                      Recorded By
                    </Label>
                    <Input
                      id="recordedBy"
                      name="recordedBy"
                      defaultValue={readingData.recorded_by || ''}
                      placeholder="Your name"
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 font-semibold flex items-center">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                  defaultValue={readingData.notes || ''}
                  placeholder="Any additional notes about this reading..."
                  rows={3}
                      className="rounded-xl"
                    />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating Reading...
                  </>
                ) : (
                  <>
                    Update Reading
                    <Save className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
