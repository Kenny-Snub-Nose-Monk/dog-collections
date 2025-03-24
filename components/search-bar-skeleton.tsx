import UISkeleton from "./ui-skeleton"

export default function SearchBarSkeleton() {
  return (
    <div className="search-container w-full max-w-md mx-auto mb-6 md:mb-8">
      <UISkeleton className="w-full h-12 rounded-lg" />
    </div>
  )
}

