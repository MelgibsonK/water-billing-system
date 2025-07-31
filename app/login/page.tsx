"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Zap, Waves, CheckCircle, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { auth, db } from "@/lib/supabase"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()

  // Only check session if user is already logged in (for page refresh scenarios)
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Only check if there's a valid admin session (user refreshed page while logged in)
        const adminSession = localStorage.getItem("admin_session")
        if (adminSession) {
          try {
            const sessionData = JSON.parse(adminSession)
            if (sessionData && sessionData.id && sessionData.email) {
              // User is already logged in, redirect to dashboard
              router.push("/dashboard")
              return
            }
          } catch (parseError) {
            // Clear invalid session data
            localStorage.removeItem("admin_session")
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    // Only check if user might be already logged in (page refresh)
    const timer = setTimeout(checkExistingSession, 100)
    return () => clearTimeout(timer)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First, attempt to sign in with Supabase Auth
      const { data, error } = await auth.signIn(formData.email, formData.password)
      
      if (error) {
        console.error('Auth error:', error)
        setError("Invalid credentials. Please check your email and password.")
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("Login failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Try to get user profile from our database
      let userData = null
      let userError = null
      
      try {
        const result = await db.getUserByEmail(formData.email)
        userData = result.data
        userError = result.error
      } catch (err) {
        console.error('Database error:', err)
        userError = err
      }

      // If user doesn't exist in our database, create them
      if (userError || !userData) {
        console.log('User not found in database, creating profile...')
        
        try {
          // Create user profile manually
          const createResult = await db.createUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: data.user.user_metadata?.role || 'user',
            is_active: true
          })
          
          if (createResult.error) {
            console.error('Failed to create user profile:', createResult.error)
            // Continue anyway - the user can still login
          } else {
            userData = createResult.data
          }
        } catch (err) {
          console.error('Error creating user profile:', err)
          // Continue anyway - the user can still login
        }
      }

      // If we still don't have user data, create a minimal profile
      if (!userData) {
        userData = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || '',
          role: data.user.user_metadata?.role || 'user',
          is_active: true,
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      // Check if user is active
      if (!userData.is_active) {
        setError("Your account has been deactivated. Please contact your administrator.")
        setIsLoading(false)
        return
      }

      // Update last login time
      try {
      await db.updateUser(userData.id, { last_login: new Date().toISOString() })
      } catch (err) {
        console.error('Failed to update last login:', err)
        // Continue anyway
      }
      
      // Log activity
      try {
      await db.logActivity({
        user_id: userData.id,
        activity_type: 'login',
        description: 'User logged in successfully',
        details: { email: formData.email, ip_address: 'client_ip' }
      })
      } catch (err) {
        console.error('Failed to log activity:', err)
        // Continue anyway
      }

      // Store session data
      localStorage.setItem("admin_session", JSON.stringify({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      }))
      
      // Navigate immediately
      router.push("/dashboard")
    } catch (err) {
      console.error('Login error:', err)
      setError("Login failed. Please try again.")
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

  // Show loading screen while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 tuuru-gradient rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Loading...</h2>
            <p className="text-slate-600">Please wait</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
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

              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
                    Smart Water
                    <br />
                    <span className="text-emerald-200">Management</span>
                  </h2>
                  <p className="text-xl text-emerald-100 leading-relaxed max-w-lg">
                    Streamline your water billing operations with our intelligent platform designed for modern utilities.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    { icon: Zap, text: "Real-time Analytics" },
                    { icon: Shield, text: "Secure & Reliable" },
                    { icon: Waves, text: "Smart Billing System" },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 animate-fade-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-emerald-200" />
                      </div>
                      <span className="text-emerald-100 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-white/30 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-emerald-100 font-medium">Trusted by utilities</p>
                  <p className="text-emerald-200 text-sm">Managing customers worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Desktop Login Form */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 items-center justify-center p-8 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/3 to-teal-500/3 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-emerald-500/10 border border-white/50 mb-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-4 shadow-lg shadow-emerald-500/25">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Welcome back
                </h2>
                <p className="text-slate-600 text-sm">Sign in to access your dashboard</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                      Email address
                    </Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-14 px-4 rounded-2xl border-2 border-slate-200 bg-white/70 focus:bg-white focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder:text-slate-400 group-hover:border-slate-300"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-slate-700 font-semibold flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-emerald-600" />
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-14 px-4 pr-14 rounded-2xl border-2 border-slate-200 bg-white/70 focus:bg-white focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder:text-slate-400 group-hover:border-slate-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-emerald-50 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-500" />
                        )}
                      </Button>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded-lg focus:ring-emerald-500 transition-all duration-200"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <Alert className="rounded-2xl border-rose-200 bg-rose-50/80 backdrop-blur-sm">
                    <AlertDescription className="text-rose-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              
              <p className="text-xs text-slate-500">© 2024 Tuuru. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Mobile Design - Full Screen */}
        <div className="lg:hidden w-full h-full relative overflow-hidden">
          {/* Mobile Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
            {/* Animated elements for mobile */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-32 right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal-300/15 rounded-2xl blur-xl rotate-45"></div>
          </div>

          {/* Mobile Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center text-white">
              {/* Circular frame for mobile logo */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <Image src="/images/tuuru-logo.png" alt="Tuuru Logo" width={80} height={80} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Tuuru</h1>
              <p className="text-emerald-100 text-lg font-medium">Water Management Platform</p>
            </div>

            {/* Mobile Login Card */}
            <div className="flex-1 bg-white rounded-t-[2rem] px-6 py-8 shadow-2xl flex flex-col justify-between">
              <div className="max-w-sm mx-auto w-full">
                {/* Mobile Form Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
                  <p className="text-slate-600 text-sm">Sign in to continue</p>
                </div>

                {/* Mobile Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="mobile-email" className="text-slate-700 font-semibold text-sm">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="mobile-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-11 pl-10 pr-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile-password" className="text-slate-700 font-semibold text-sm">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="mobile-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-11 pl-10 pr-12 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-slate-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Forgot?
                    </Link>
                  </div>

                  {error && (
                    <Alert className="rounded-2xl border-rose-200 bg-rose-50 text-sm">
                      <AlertDescription className="text-rose-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Mobile Footer */}
              <div className="mt-6 text-center flex-shrink-0 space-y-2">
                
                <p className="text-xs text-slate-500">© 2024 Tuuru. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
