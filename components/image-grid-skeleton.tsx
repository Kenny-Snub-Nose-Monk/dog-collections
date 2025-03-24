import UISkeleton from "./ui-skeleton"

interface ImageGridSkeletonProps {
  count?: number
}

export default function ImageGridSkeleton({ count = 20 }: ImageGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="image-item">
          <UISkeleton className="w-full aspect-square" />
        </div>
      ))}
    </div>
  )
}

