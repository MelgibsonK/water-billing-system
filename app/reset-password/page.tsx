"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, Loader2, Shield, Zap, Waves } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await auth.updatePassword(formData.password)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      setError("Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* Left Side - Branding & Visual (Desktop Only) */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Large geometric shapes */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-2xl animate-float"></div>
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-300/15 rotate-45 rounded-3xl blur-xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full gap-4 p-8">
              {Array.from({ length: 144 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/20 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 50}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Top Section */}
          <div>
            <div className="flex items-center space-x-4 mb-8">
              {/* Circular frame for desktop logo */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100 flex items-center justify-center mr-3">
                <Image src="/images/tuuru-logo.png" alt="Tuuru Logo" width={64} height={64} />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Tuuru</h1>
                <p className="text-emerald-100 font-medium">Water Management Platform</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Set New Password</h3>
                    <p className="text-emerald-100">Choose a strong, secure password</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Security First</h3>
                    <p className="text-emerald-100">Your account security is our priority</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Quick Access</h3>
                    <p className="text-emerald-100">Get back to managing water services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-emerald-100">
              <Waves className="w-5 h-5" />
              <span className="font-medium">Trusted by water utilities across Kenya</span>
            </div>
            <div className="text-sm text-emerald-200">
              <p>© 2024 Tuuru Water Management. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-2/5 xl:w-1/3 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo & Header */}
          <div className="lg:hidden text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 flex items-center justify-center">
                <Image src="/images/tuuru-logo.png" alt="Tuuru Logo" width={64} height={64} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Tuuru</h1>
              <p className="text-slate-600 font-medium">Water Management Platform</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Reset Password</h2>
            </div>
            <p className="text-slate-600 text-base lg:text-lg">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Password updated successfully! Redirecting you to login...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className="pl-10 pr-10 h-12 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10 h-12 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Update Password</span>
                </div>
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="text-center space-y-4">
            <div className="text-sm text-slate-600">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Sign in here
              </Link>
            </div>
            
            <div className="text-xs text-slate-500 space-y-1">
              <p>Having trouble? Contact support at support@tuuru.com</p>
              <p>Or call us at +254 700 000 000</p>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-700 mb-2">Password Requirements</p>
                <ul className="space-y-1 text-xs">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Avoid common words and patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 