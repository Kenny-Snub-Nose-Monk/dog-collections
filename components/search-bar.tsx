'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Search, X, PawPrint } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { debugLog } from '@/utils/debug-utils';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearch,
  onClear,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedValue = useDebounce(inputValue, 300); // 300ms debounce delay
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const prevSearchQuery = useRef(searchQuery);

  // Update input value when searchQuery prop changes
  useEffect(() => {
    // Only update if the searchQuery has actually changed
    if (searchQuery !== prevSearchQuery.current) {
      debugLog(
        `SearchQuery changed: ${prevSearchQuery.current} -> ${searchQuery}`
      );
      setInputValue(searchQuery);
      prevSearchQuery.current = searchQuery;
    }
  }, [searchQuery]);

  // Call onSearch with the debounced value
  useEffect(() => {
    // Skip the first render to avoid overriding the URL when component mounts
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    debugLog(
      `Debounced value: ${debouncedValue}, Search query: ${searchQuery}`
    );

    // Only trigger search if the debounced value is different from the current searchQuery
    if (debouncedValue !== searchQuery) {
      debugLog(`Triggering search with: ${debouncedValue}`);
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, searchQuery]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    debugLog(`Input changed: ${inputValue} -> ${newValue}`);
    setInputValue(newValue);
  };

  const handleClear = () => {
    debugLog('Search cleared');

    setInputValue('');
    // Ensure we call onClear to reset the URL parameter
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Determine if we should show the "Searching..." indicator
  const isSearching = inputValue !== debouncedValue;

  return (
    <div className="search-container w-full max-w-md mx-auto mb-6 md:mb-8">
      <div className="relative group">
        {/* 搜索圖標 */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 transition-all duration-300 group-hover:text-amber-600 group-focus-within:text-amber-600">
          <Search size={20} className="group-focus-within:hidden" />
          <PawPrint size={20} className="hidden group-focus-within:block" />
        </div>

        {/* 輸入框 */}
        <input
          ref={inputRef}
          type="text"
          className="w-full p-3.5 pl-12 pr-12 bg-amber-50 border-2 border-amber-200 rounded-full shadow-md outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 transition-all placeholder-amber-400"
          placeholder={
            isFocused ? 'Type a dog breed...' : 'Woof! Search for breeds...'
          }
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
        />

        {/* 清除按鈕 */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X
              size={20}
              className="hover:rotate-90 transition-transform duration-300"
            />
          </button>
        )}
        <div
          className={`absolute left-4 top-full mt-2 text-xs text-amber-700 flex items-center transition-opacity duration-200 ${
            isSearching ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="w-2 h-2 bg-amber-500 rounded-full mr-1.5 animate-ping"></div>
          <span className="font-medium">Searching...</span>
        </div>
      </div>
    </div>
  );
}
