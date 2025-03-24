"use client"

import { useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export default function DebounceTest() {
  const [inputValue, setInputValue] = useState("")
  const debouncedValue = useDebounce(inputValue, 300)

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-2">Debounce Test</h3>
      <div className="mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border p-2 rounded"
          placeholder="Type to test debounce"
        />
      </div>
      <div className="text-sm">
        <div>Input Value: "{inputValue}"</div>
        <div>Debounced Value: "{debouncedValue}"</div>
        <div>Status: {inputValue === debouncedValue ? "Idle" : "Debouncing..."}</div>
      </div>
    </div>
  )
}

