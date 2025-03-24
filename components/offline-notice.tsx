"use client"

import { useNetworkStatus } from "@/hooks/use-network-status"
import { WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

export default function OfflineNotice() {
  const { isOnline } = useNetworkStatus()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true)
    } else {
      // When coming back online, show the banner for 3 seconds then hide it
      const timer = setTimeout(() => {
        setShowBanner(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showBanner) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-3 z-50 transition-transform duration-300 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            {isOnline ? (
              <>
                <span className="mr-2">●</span>
                <span>You're back online!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 mr-2" />
                <span>You're offline. Some features may be limited.</span>
              </>
            )}
          </div>
          <button onClick={() => setShowBanner(false)} className="text-white hover:text-gray-200" aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

