'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { debugLog } from '@/utils/debug-utils';

export function useUrlSearchParams<T extends Record<string, string>>(
  defaultValues: T
): [T, (name: keyof T, value: string | null) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isUpdatingRef = useRef(false);
  const lastSearchParamsRef = useRef<URLSearchParams | null>(null);

  const [params, setParams] = useState<T>(() => {
    // Initialize with default values, overridden by URL params if they exist
    const initialParams = { ...defaultValues };

    // Update with any values from the URL
    Object.keys(defaultValues).forEach(key => {
      const value = searchParams.get(key);
      if (value !== null) {
        initialParams[key as keyof T] = value as T[keyof T];
      }
    });

    return initialParams;
  });

  // Update the URL when params change
  useEffect(() => {
    // Prevent circular updates
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });

    const search = newSearchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    debugLog(`Updating URL to: ${url}`);

    // Use replaceState to avoid adding to browser history
    window.history.replaceState({ path: url }, '', url);

    // Save a copy of the current searchParams for comparison
    lastSearchParamsRef.current = newSearchParams;
  }, [params, pathname]);

  // Listen for URL changes and update params
  useEffect(() => {
    // Optimize: Check if searchParams really changed
    const searchParamsString = searchParams.toString();
    const lastSearchParamsString = lastSearchParamsRef.current
      ? lastSearchParamsRef.current.toString()
      : '';

    if (searchParamsString === lastSearchParamsString) {
      return; // If current URL params are the same as last updated, skip processing
    }

    const newParams = { ...defaultValues };
    let hasChanged = false;

    // Get params from URL
    for (const key of Object.keys(defaultValues)) {
      const value = searchParams.get(key);
      if (value !== null) {
        if (params[key as keyof T] !== value) {
          newParams[key as keyof T] = value as T[keyof T];
          hasChanged = true;
        } else {
          newParams[key as keyof T] = params[key as keyof T];
        }
      }
    }

    if (hasChanged) {
      debugLog(`URL params changed, updating state`, newParams);
      isUpdatingRef.current = true;
      setParams(newParams);
    }
  }, [searchParams, defaultValues, params]);

  // Function to update a single param
  const updateParam = useCallback(
    (name: keyof T, value: string | null) => {
      debugLog(`updateParam called: ${String(name)} = ${value}`);

      // Set update flag to prevent circular updates
      isUpdatingRef.current = true;

      setParams(prev => {
        const newValue = value === null ? defaultValues[name] : value;

        if (prev[name] === newValue) {
          return prev;
        }

        return {
          ...prev,
          [name]: newValue,
        };
      });
    },
    [defaultValues]
  );

  return [params, updateParam];
}
