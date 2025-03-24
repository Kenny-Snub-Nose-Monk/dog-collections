"use client"

import { useState, useEffect } from "react"
import { Database } from "lucide-react"

interface ImageLoadTrackerProps {
  totalImages: number
}

export default function ImageLoadTracker({ totalImages }: ImageLoadTrackerProps) {
  const [loadedImages, setLoadedImages] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleImageLoad = () => {
      setLoadedImages((prev) => prev + 1)
    }

    // Listen for custom events from LazyImage component
    window.addEventListener("lazyImageLoaded", handleImageLoad)

    // Hide after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    return () => {
      window.removeEventListener("lazyImageLoaded", handleImageLoad)
      clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-50">
      <Database size={16} />
      <span className="text-sm">
        Loaded: {loadedImages} / {totalImages} images
      </span>
    </div>
  )
}

