'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import ImageCarousel from '@/components/image-carousel';
import { getFromCache, saveToCache, CACHE_KEYS } from '@/utils/cache-utils';
import CacheStatus from '@/components/cache-status';
import LazyImage from '@/components/lazy-image';
import ImageLoadTracker from '@/components/image-load-tracker';
import { setQueryParam } from '@/utils/url-utils';
import ShareableLink from '@/components/shareable-link';
import ErrorFallback from '@/components/error-fallback';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { getFriendlyErrorMessage } from '@/utils/error-utils';
import ImageGridSkeleton from '@/components/image-grid-skeleton';
import React from 'react';

export default function BreedPage() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isUsingCache, setIsUsingCache] = useState(false);
  const { isOnline } = useNetworkStatus();

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // 使用 useParams() hook
  const breed = params.breed as string; // 安全地獲取 breed
  const decodedBreed = decodeURIComponent(breed);

  // Get the 'from' parameter to know where the user came from
  const fromPage = searchParams.get('from');

  // Get the image index from URL if present
  useEffect(() => {
    const imageIndex = searchParams.get('image');
    if (imageIndex && !isNaN(Number(imageIndex))) {
      setSelectedImageIndex(Number(imageIndex));
    }
  }, [searchParams]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get images from cache first
      const cacheKey = CACHE_KEYS.BREED_IMAGES(decodedBreed);
      const cachedImages = getFromCache<string[]>(cacheKey);

      if (cachedImages && cachedImages.length > 0) {
        // console.log(`Using cached images for ${decodedBreed}`);
        setImages(cachedImages);
        setIsUsingCache(true);
        setIsLoading(false);
        return;
      }

      // If not in cache and offline, show error
      if (!isOnline) {
        throw new Error("You're offline and no cached images are available");
      }

      // If not in cache, fetch from API
      // console.log(`Fetching images for ${decodedBreed} from API`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(
          `https://dog.ceo/api/breed/${decodedBreed}/images/random/50`,
          {
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Save to cache
          saveToCache(cacheKey, data.message);

          setImages(data.message);
        } else {
          throw new Error(
            'Failed to fetch images: API returned unsuccessful status'
          );
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err) {
      console.error(`Error fetching images for ${decodedBreed}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));

      // If we have cached data, use it as fallback even if there was an error
      const cacheKey = CACHE_KEYS.BREED_IMAGES(decodedBreed);
      const cachedImages = getFromCache<string[]>(cacheKey);

      if (cachedImages && cachedImages.length > 0) {
        console.log(
          `Using cached images for ${decodedBreed} as fallback after error`
        );
        setImages(cachedImages);
        setIsUsingCache(true);
      }
    } finally {
      // Add a small delay to make the skeleton visible even if data loads quickly
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedBreed]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);

    // Update URL with selected image index
    setQueryParam('image', index.toString());
  };

  const handleCloseCarousel = () => {
    setSelectedImageIndex(null);

    // Remove image param from URL
    setQueryParam('image', null);
  };

  const handleGoBack = () => {
    // If we know where the user came from, we can navigate back there
    if (fromPage === 'search') {
      // Go back to the search page, preserving any search query
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push('/');
      }
    } else {
      // Otherwise just use the browser's back functionality
      router.back();
    }
  };

  const handleRetry = () => {
    fetchImages();
  };

  // Determine if we should show error UI
  const showError = error && (!isUsingCache || images.length === 0);
  const hasFallbackData = error && isUsingCache && images.length > 0;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="header sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-x-4">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold capitalize py-4">
              {decodedBreed}
            </h1>
          </div>
          <div className="hidden sm:block">
            <ShareableLink title={`${decodedBreed} Dog Images`} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Show network status warning if offline but we have cached data */}
        {!isOnline && hasFallbackData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <p className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              You're currently offline. Showing cached images.
            </p>
          </div>
        )}

        {isLoading ? (
          <ImageGridSkeleton count={20} />
        ) : showError ? (
          <div className="mt-8">
            <ErrorFallback
              title={`Error loading ${decodedBreed} images`}
              message={getFriendlyErrorMessage(error)}
              onRetry={handleRetry}
              isOffline={!isOnline}
            />
          </div>
        ) : (
          <>
            {hasFallbackData && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
                <p>
                  There was an error fetching the latest images. Showing cached
                  images instead.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {images.map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="image-item rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                  onClick={() => handleImageClick(index)}
                >
                  <LazyImage
                    src={imageUrl || '/placeholder.svg'}
                    alt={`${decodedBreed} dog ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    // Only prioritize the first few images
                    priority={index < 4}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedImageIndex !== null && images.length > 0 && (
        <ImageCarousel
          images={images}
          initialIndex={selectedImageIndex}
          onClose={handleCloseCarousel}
          breedName={decodedBreed}
          onImageChange={index => setQueryParam('image', index.toString())}
        />
      )}

      {isUsingCache && !showError && (
        <CacheStatus isCached={isUsingCache} type="images" />
      )}
      {!isLoading && !showError && (
        <ImageLoadTracker totalImages={images.length} />
      )}
    </div>
  );
}
