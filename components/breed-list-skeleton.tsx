import UISkeleton from "./ui-skeleton"

interface BreedListSkeletonProps {
  count?: number
}

export default function BreedListSkeleton({ count = 12 }: BreedListSkeletonProps) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="breed-item rounded-lg">
            <div className="flex items-center p-3">
              <UISkeleton variant="circular" className="breed-avatar" />
              <UISkeleton className="h-5 w-24 ml-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

