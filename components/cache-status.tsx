"use client"

import { useState, useEffect } from "react"
import { Database } from "lucide-react"

interface CacheStatusProps {
  isCached: boolean
  type: "breeds" | "images"
}

export default function CacheStatus({ isCached, type }: CacheStatusProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isCached) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isCached])

  if (!isCached || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 animate-fade-in z-50">
      <Database size={16} />
      <span className="text-sm">Using cached {type}</span>
    </div>
  )
}

