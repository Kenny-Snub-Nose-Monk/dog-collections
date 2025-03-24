"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { ImageOff } from "lucide-react"
import UISkeleton from "./ui-skeleton"

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  onClick?: () => void
  priority?: boolean
  fallbackSrc?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  onClick,
  priority = false,
  fallbackSrc = "/placeholder.svg",
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, hasIntersected } = useIntersectionObserver({
    rootMargin: "200px", // Load images 200px before they enter the viewport
  })

  // If priority is true, we don't need to lazy load
  const shouldLoad = priority || hasIntersected

  const handleImageLoad = () => {
    setIsLoaded(true)
    setHasError(false)

    // Dispatch a custom event that our tracker can listen for
    const event = new CustomEvent("lazyImageLoaded")
    window.dispatchEvent(event)
  }

  const handleImageError = () => {
    setHasError(true)
    setIsLoaded(true)

    // Dispatch a custom event for error tracking if needed
    const event = new CustomEvent("lazyImageError", { detail: { src } })
    window.dispatchEvent(event)
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {shouldLoad ? (
        <>
          {!hasError ? (
            <>
              <Image
                src={src || "/placeholder.svg"}
                alt={alt}
                width={width}
                height={height}
                className={`
                  transition-opacity duration-300 
                  ${isLoaded ? "opacity-100" : "opacity-0"}
                  ${className}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={priority}
              />
              {!isLoaded && (
                <div className="absolute inset-0">
                  <UISkeleton className="w-full h-full" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
              <ImageOff className="h-8 w-8 mb-2" />
              <span className="text-xs">Failed to load</span>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0">
          <UISkeleton className="w-full h-full" />
        </div>
      )}
    </div>
  )
}

