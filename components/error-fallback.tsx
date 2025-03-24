"use client"

import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorFallbackProps {
  title?: string
  message: string
  onRetry?: () => void
  showHomeButton?: boolean
  showRetryButton?: boolean
  isOffline?: boolean
}

export default function ErrorFallback({
  title = "Something went wrong",
  message,
  onRetry,
  showHomeButton = true,
  showRetryButton = true,
  isOffline = false,
}: ErrorFallbackProps) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 p-3 rounded-full">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{isOffline ? "You're offline" : title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
        {showHomeButton && (
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        )}
      </div>
    </div>
  )
}

