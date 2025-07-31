import { Loader2 } from "lucide-react"

interface InstantLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function InstantLoading({ message = "Updating...", size = "md" }: InstantLoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  return (
    <div className="flex items-center justify-center py-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-500`} />
      <span className="ml-2 text-sm text-slate-600">{message}</span>
    </div>
  )
} 