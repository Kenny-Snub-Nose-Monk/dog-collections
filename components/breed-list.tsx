'use client';

import { useRouter } from 'next/navigation';
import { createUrlWithParams } from '@/utils/url-utils';
import { useState } from 'react';

interface BreedListProps {
  breeds: string[];
  searchQuery: string;
}

export default function BreedList({ breeds, searchQuery }: BreedListProps) {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleBreedClick = (breed: string) => {
    // Get the current search query from the URL
    const searchQuery = new URLSearchParams(window.location.search).get(
      'search'
    );

    // Create URL with current search parameters preserved
    const breedUrl = createUrlWithParams(
      `/breed/${encodeURIComponent(breed)}`,
      {
        // We need to explicitly include the search parameter
        search: searchQuery || null,
        from: 'search',
      }
    );

    router.push(breedUrl);
  };

  // 從 GCP 獲取狗狗大頭貼的 URL
  const getBreedImageUrl = (breed: string) => {
    // 將品種名稱轉為小寫並去除空格，以符合檔案命名規則
    const formattedBreed = breed.toLowerCase().replace(/\s+/g, '');
    return `https://storage.googleapis.com/tomofun/dog_avastar/${formattedBreed}.webp`;
  };

  // Generate a consistent color for each breed
  const getBreedColor = (breed: string) => {
    const colors = [
      'bg-red-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-teal-200',
      'bg-orange-200',
    ];

    // Simple hash function to get a consistent index
    const index =
      breed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // 處理圖片載入錯誤
  const handleImageError = (breed: string) => {
    setImageErrors(prev => ({ ...prev, [breed]: true }));
  };

  if (breeds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No breeds found matching "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {breeds.map(breed => (
          <div
            key={breed}
            className="breed-item rounded-lg hover:shadow-md transition-all"
            onClick={() => handleBreedClick(breed)}
          >
            <div className="flex items-center p-3">
              {!imageErrors[breed] ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={getBreedImageUrl(breed)}
                    alt={breed}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(breed)}
                  />
                </div>
              ) : (
                <div
                  className={`breed-avatar w-10 h-10 rounded-full flex items-center justify-center ${getBreedColor(
                    breed
                  )}`}
                >
                  <div className="text-lg font-bold text-gray-700">
                    {breed.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <span className="capitalize ml-4">{breed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
