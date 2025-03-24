interface SkeletonProps {
  className?: string
  variant?: "rectangular" | "circular" | "text"
  width?: string | number
  height?: string | number
}

export default function UISkeleton({ className = "", variant = "rectangular", width, height }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200"

  const variantClasses = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
  }

  const styleObj = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={styleObj} />
}

