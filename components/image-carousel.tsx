"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react"
import LazyImage from "./lazy-image"
import { createUrlWithParams } from "@/utils/url-utils"
import KeyboardNavigationHint from "./keyboard-navigation-hint"

interface ImageCarouselProps {
  images: string[]
  initialIndex: number
  onClose: () => void
  breedName: string
  onImageChange?: (index: number) => void
}

export default function ImageCarousel({ images, initialIndex, onClose, breedName, onImageChange }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [shareTooltip, setShareTooltip] = useState(false)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        // Prevent default to avoid scrolling
        e.preventDefault()
        if (!isAnimating) {
          handlePrev()
        }
      } else if (e.key === "ArrowRight") {
        // Prevent default to avoid scrolling
        e.preventDefault()
        if (!isAnimating) {
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Prevent scrolling while modal is open
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [onClose, isAnimating])

  const handlePrev = () => {
    if (isAnimating) return

    setDirection("left")
    setIsAnimating(true)

    setTimeout(() => {
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
      setCurrentIndex(newIndex)
      if (onImageChange) onImageChange(newIndex)
      setIsAnimating(false)
    }, 300)
  }

  const handleNext = () => {
    if (isAnimating) return

    setDirection("right")
    setIsAnimating(true)

    setTimeout(() => {
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
      setCurrentIndex(newIndex)
      if (onImageChange) onImageChange(newIndex)
      setIsAnimating(false)
    }, 300)
  }

  // Prevent click events from bubbling to the overlay
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Share current image view
  const handleShare = () => {
    const shareUrl = createUrlWithParams(window.location.href, {
      image: currentIndex.toString(),
    })

    if (navigator.share) {
      navigator
        .share({
          title: `${breedName} Dog Image`,
          url: shareUrl,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareTooltip(true)
        setTimeout(() => setShareTooltip(false), 2000)
      })
    }
  }

  // Preload adjacent images
  const preloadIndices = [
    currentIndex,
    (currentIndex + 1) % images.length,
    (currentIndex - 1 + images.length) % images.length,
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="carousel-container p-4 md:p-8" onClick={handleContentClick}>
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-6 text-white z-10">
          <h2 className="text-xl font-semibold capitalize md:text-2xl">{breedName}</h2>
          <div className="flex items-center">
            <span className="mr-4 text-sm md:text-base">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={handleShare}
              className="text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors mr-2 relative"
              aria-label="Share this image"
            >
              <Share2 size={20} />
              {shareTooltip && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                  URL copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
              aria-label="Close carousel"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <div
            className={`
              transition-transform duration-300 ease-in-out
              ${isAnimating && direction === "left" ? "translate-x-full opacity-0" : ""}
              ${isAnimating && direction === "right" ? "-translate-x-full opacity-0" : ""}
            `}
          >
            {/* Main carousel image - always load with priority */}
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${breedName} dog ${currentIndex + 1}`}
              width={1200}
              height={1200}
              className="carousel-image max-h-[80vh] md:max-h-[85vh]"
              priority
            />
          </div>
        </div>

        <button
          onClick={handlePrev}
          className="carousel-nav left-4 md:left-8 bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} className="md:h-8 md:w-8" />
        </button>

        <button
          onClick={handleNext}
          className="carousel-nav right-4 md:right-8 bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={24} className="md:h-8 md:w-8" />
        </button>

        {/* Thumbnail navigation for larger screens */}
        <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center space-x-2 px-4">
          <div className="flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg overflow-x-auto max-w-full">
            {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((img, idx) => {
              const actualIdx = Math.max(0, currentIndex - 2) + idx
              return (
                <button
                  key={img}
                  onClick={() => {
                    setCurrentIndex(actualIdx)
                    if (onImageChange) onImageChange(actualIdx)
                  }}
                  className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden ${
                    actualIdx === currentIndex ? "ring-2 ring-white" : "opacity-70"
                  }`}
                >
                  <LazyImage
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${actualIdx + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    // Prioritize the visible thumbnails
                    priority={preloadIndices.includes(actualIdx)}
                  />
                </button>
              )
            })}
          </div>
        </div>
        {/* Keyboard navigation hint */}
        <KeyboardNavigationHint />
      </div>
    </div>
  )
}

