"use client"

import { useState, useEffect } from "react"

export default function KeyboardNavigationHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000) // Hide after 5 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg flex items-center gap-4 z-50 animate-fade-in">
      <div className="flex items-center gap-1">
        <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">←</kbd>
        <span className="text-sm">Previous</span>
      </div>
      <div className="flex items-center gap-1">
        <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">→</kbd>
        <span className="text-sm">Next</span>
      </div>
      <div className="flex items-center gap-1">
        <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">ESC</kbd>
        <span className="text-sm">Close</span>
      </div>
    </div>
  )
}

