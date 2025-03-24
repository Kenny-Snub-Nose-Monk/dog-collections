"use client"

import { useState, useEffect } from "react"
import { debugLog } from "@/utils/debug-utils"

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    debugLog(`useDebounce: value changed to ${String(value)}`)

    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      debugLog(`useDebounce: setting debounced value to ${String(value)} after ${delay}ms`)
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if the value changes or the component unmounts
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

