'use client';

import { useEffect, useState, useCallback } from 'react';
import BreedList from '@/components/breed-list';
import SearchBar from '@/components/search-bar';
import { getFromCache, saveToCache, CACHE_KEYS } from '@/utils/cache-utils';
import CacheStatus from '@/components/cache-status';
import SearchPerformance from '@/components/search-performance';
import ShareableLink from '@/components/shareable-link';
import { useUrlSearchParams } from '@/hooks/use-url-search-params';
import ErrorFallback from '@/components/error-fallback';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { getFriendlyErrorMessage } from '@/utils/error-utils';
import { AlertTriangle } from 'lucide-react';
import BreedListSkeleton from '@/components/breed-list-skeleton';
import { debugLog } from '@/utils/debug-utils';
import { clearQueryParam } from '@/utils/url-utils';

export default function Home() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  // const [searchCount, setSearchCount] = useState(0)
  const { isOnline } = useNetworkStatus();

  // Use our custom hook to manage URL search params
  const [urlParams, updateUrlParam] = useUrlSearchParams({
    search: '',
  });

  // Derive searchQuery from URL params
  const searchQuery = urlParams.search;

  const fetchBreeds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get breeds from cache first
      const cachedBreeds = getFromCache<string[]>(CACHE_KEYS.BREEDS_LIST);

      if (cachedBreeds) {
        // console.log('Using cached breed list');
        setBreeds(cachedBreeds);
        setIsUsingCache(true);

        // Apply initial filter if search param exists
        if (searchQuery) {
          setFilteredBreeds(
            cachedBreeds.filter(breed =>
              breed.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        } else {
          setFilteredBreeds(cachedBreeds);
        }

        setIsLoading(false);
        return;
      }

      // If not in cache and offline, show error
      if (!isOnline) {
        throw new Error("You're offline and no cached data is available");
      }

      // If not in cache, fetch from API
      // console.log('Fetching breed list from API');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Convert the object of breeds to a flat array
          const breedList = Object.keys(data.message);

          // Save to cache
          saveToCache(CACHE_KEYS.BREEDS_LIST, breedList);

          setBreeds(breedList);

          // Apply initial filter if search param exists
          if (searchQuery) {
            setFilteredBreeds(
              breedList.filter(breed =>
                breed.toLowerCase().includes(searchQuery.toLowerCase())
              )
            );
          } else {
            setFilteredBreeds(breedList);
          }
        } else {
          throw new Error(
            'Failed to fetch breeds: API returned unsuccessful status'
          );
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err) {
      console.error('Error fetching breeds:', err);
      setError(err instanceof Error ? err : new Error(String(err)));

      // If we have cached data, use it as fallback even if there was an error
      const cachedBreeds = getFromCache<string[]>(CACHE_KEYS.BREEDS_LIST);
      if (cachedBreeds) {
        // console.log('Using cached breed list as fallback after error');
        setBreeds(cachedBreeds);
        setIsUsingCache(true);

        if (searchQuery) {
          setFilteredBreeds(
            cachedBreeds.filter(breed =>
              breed.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        } else {
          setFilteredBreeds(cachedBreeds);
        }
      }
    } finally {
      // Add a small delay to make the skeleton visible even if data loads quickly
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  // Only run once on initial load to fetch breeds
  useEffect(() => {
    fetchBreeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filtered breeds when search query changes
  useEffect(() => {
    if (breeds.length > 0) {
      if (searchQuery) {
        const filtered = breeds.filter(breed =>
          breed.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBreeds(filtered);
      } else {
        setFilteredBreeds(breeds);
      }
    }
  }, [searchQuery, breeds]);

  const handleSearch = useCallback(
    (query: string) => {
      debugLog(`Search executed with query: "${query}"`);
      // setSearchCount((prev) => prev + 1)

      // Update URL param, which will trigger the effect to update filtered breeds
      updateUrlParam('search', query || null);
    },
    [updateUrlParam]
  );

  const handleClearSearch = useCallback(() => {
    debugLog('Clear search called');

    // Use both methods to ensure the search is cleared
    // updateUrlParam('search', null);
    clearQueryParam('search');

    // Also update the filtered breeds to show all breeds
    setFilteredBreeds(breeds);
  }, [updateUrlParam, breeds]);

  const handleRetry = useCallback(() => {
    fetchBreeds();
  }, []);

  // Determine if we should show error UI
  const showError = error && (!isUsingCache || breeds.length === 0);
  const hasFallbackData = error && isUsingCache && breeds.length > 0;

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 相對定位容器 */}
        <div className="relative flex justify-center items-center mb-5">
          {/* 標題始終居中 */}
          <h1 className="text-2xl font-bold md:text-3xl text-center py-4">
            Dog Breed Gallery
          </h1>

          {/* ShareableLink 絕對定位在右側 */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden sm:block">
            <ShareableLink title="Dog Breed Gallery" />
          </div>
        </div>

        {/* 在小螢幕上顯示在標題下方的 ShareableLink */}
        <div className="flex justify-center -mt-6 mb-6 sm:hidden">
          <ShareableLink title="Dog Breed Gallery" />
        </div>

        {/* Always show search bar, even in error state if we have fallback data */}
        {(!showError || hasFallbackData) && (
          <SearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        )}

        {/* Show network status warning if offline but we have cached data */}
        {!isOnline && hasFallbackData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <p className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              You're currently offline. Showing cached data.
            </p>
          </div>
        )}

        {/* Add search performance component */}
        {/* {!isLoading && !showError && searchQuery && (
          <SearchPerformance
            searchQuery={searchQuery}
            filteredCount={filteredBreeds.length}
            totalCount={breeds.length}
          />
        )} */}

        {isLoading ? (
          <BreedListSkeleton count={16} />
        ) : showError ? (
          <div className="mt-8">
            <ErrorFallback
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
                  There was an error fetching the latest data. Showing cached
                  results instead.
                </p>
              </div>
            )}
            <BreedList breeds={filteredBreeds} searchQuery={searchQuery} />
          </>
        )}
      </div>
      {isUsingCache && !showError && (
        <CacheStatus isCached={isUsingCache} type="breeds" />
      )}
    </main>
  );
}
