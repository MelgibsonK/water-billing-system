"use client"

import { useEffect, useState } from "react"
import { Sparkles, Waves } from "lucide-react"

interface PreloaderProps {
  isVisible: boolean
  onComplete?: () => void
}

export function Preloader({ isVisible, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isVisible) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onComplete?.()
            }, 0)
            return 100
          }
          return prev + 10
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo and Branding */}
        <div className="space-y-4">
          <div className="w-20 h-20 tuuru-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Tuuru
            </h1>
            <p className="text-slate-600 font-medium">Water Management Platform</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Loading dashboard...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob-1"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob-2"></div>
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cyan-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob-3"></div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Preloader for specific pages
export function DashboardPreloader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mx-auto animate-pulse">
          <Waves className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Loading Dashboard</h2>
          <p className="text-slate-600">Please wait while we prepare your data...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    </div>
  )
} 