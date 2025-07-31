"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  LogOut,
  Menu,
  Zap,
  Home,
  Users,
  Gauge,
  BarChart3,
  FileText,
  CreditCard,
  TrendingUp,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"

interface DashboardHeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname() // Get current pathname

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
      document.documentElement.style.overflow = 'hidden'
      document.body.classList.add('no-scrollbar')
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
      document.body.classList.remove('no-scrollbar')
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.documentElement.style.overflow = ''
      document.body.classList.remove('no-scrollbar')
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    try {
      // Clear all session data
      localStorage.removeItem("admin_session")
      sessionStorage.clear()
      
      // Force a hard redirect to prevent any client-side routing issues
      window.location.href = "/login"
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force redirect
      window.location.href = "/login"
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Meters", href: "/dashboard/meters", icon: Gauge },
    { name: "Readings", href: "/dashboard/readings", icon: BarChart3 },
    { name: "Bills", href: "/dashboard/bills", icon: FileText },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Reports", href: "/dashboard/reports", icon: TrendingUp },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center min-w-0">
            <div className="flex items-center flex-shrink-0">
              {/* Circular frame for desktop logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/25">
                <Image src="/images/tuuru-logo.png" alt="Tuuru Logo" width={40} height={40} />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Tuuru
                </span>
                <div className="flex items-center">
                  <Zap className="w-3 h-3 text-amber-500 mr-1" />
                  <span className="text-xs text-slate-500 font-medium">Water Excellence</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-2xl transition-all duration-300 flex items-center space-x-2 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Menu and Mobile Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* User Menu (Desktop Only) */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-2xl hover:bg-slate-100/80 transition-all duration-300"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="tuuru-gradient text-white font-semibold text-sm">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-2xl border-slate-200 bg-white/95 backdrop-blur-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem className="p-3 rounded-xl mx-2 my-1 hover:bg-slate-100/80 transition-all duration-200">
                    <Settings className="mr-3 h-4 w-4 text-slate-600" />
                    <span className="text-slate-700">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="p-3 rounded-xl mx-2 my-1 hover:bg-rose-50 transition-all duration-200 text-rose-600 hover:text-rose-700"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button (Sheet Trigger) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-9 w-9 rounded-2xl hover:bg-slate-100/80 transition-all duration-300"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[250px] sm:w-[300px] bg-white/95 backdrop-blur-xl border-l border-slate-200/50 p-0 flex flex-col overflow-hidden"
              >
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
                  <div className="flex items-center">
                    {/* Circular frame for mobile logo */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-100 flex items-center justify-center mr-2">
                      <Image src="/images/tuuru-logo.png" alt="Tuuru Logo" width={32} height={32} />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Tuuru
                    </span>
                  </div>
                  <SheetClose asChild></SheetClose>
                </div>
                {/* User Profile in Mobile Menu */}
                <div className="p-4 border-b border-slate-200/50 flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="tuuru-gradient text-white font-semibold text-base">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {navigation.map((item) => {
                    const IconComponent = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-4 border-t border-slate-200/50">
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }} 
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
