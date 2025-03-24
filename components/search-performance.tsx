"use client"

import { useState, useEffect } from "react"

interface SearchPerformanceProps {
  searchQuery: string
  filteredCount: number
  totalCount: number
}

export default function SearchPerformance({ searchQuery, filteredCount, totalCount }: SearchPerformanceProps) {
  const [renderCount, setRenderCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Increment render count on each render
  useEffect(() => {
    setRenderCount((prev) => prev + 1)

    // Reset visibility timer on each search change
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isVisible || !searchQuery) return null

  return (
    <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">Search: </span>
          <span className="text-blue-700">"{searchQuery}"</span>
        </div>
        <div>
          <span className="font-medium">Results: </span>
          <span className="text-blue-700">
            {filteredCount} of {totalCount}
          </span>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-600">
        <span>Debounced search prevented excessive filtering operations</span>
      </div>
    </div>
  )
}

