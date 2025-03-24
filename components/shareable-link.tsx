'use client';

import { useEffect, useState, useRef } from 'react';
import { Share2, Check, Copy, ChevronDown } from 'lucide-react';

interface ShareableLinkProps {
  url?: string;
  title?: string;
}

export default function ShareableLink({ url, title }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || '');
  const [shareTitle, setShareTitle] = useState(title || '');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 在客戶端安全地設置 URL 和標題
    if (!url) setShareUrl(window.location.href);
    if (!title) setShareTitle(document.title);
  }, [url, title]);

  // 點擊外部時關閉下拉菜單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShareToX = () => {
    const text = encodeURIComponent(`${shareTitle}`);
    const shareLink = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareLink}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const handleShareToThreads = () => {
    // Threads 沒有直接的分享 API，但我們可以打開 Threads 網站
    window.open('https://www.threads.net', '_blank');
    // 提示用戶複製連結後分享
    handleCopy();
    setShowShareMenu(false);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      // @ts-ignore: document.execCommand is deprecated but still widely supported
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Share 按鈕與下拉菜單 */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleShare}
          className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3.5 py-1.5 rounded-full border-2 border-amber-200 transition-all hover:shadow-md group"
          aria-label="Share this page"
        >
          <Share2
            size={16}
            className="text-amber-500 group-hover:scale-110 transition-transform"
          />
          <span className="font-medium text-sm">Woof! Share</span>
          <ChevronDown
            size={14}
            className={`text-amber-500 transition-transform ${
              showShareMenu ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showShareMenu && (
          <div className="absolute mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
            <button
              onClick={handleShareToX}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-2">𝕏</span> Share to X.com
            </button>
            <button
              onClick={handleShareToThreads}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-2">◯</span> Share to Threads
            </button>
          </div>
        )}
      </div>

      {/* Copy Link 按鈕 */}
      <button
        onClick={handleCopy}
        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border-2 transition-all hover:shadow-md group ${
          copied
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
        }`}
        aria-label="Copy link"
      >
        {copied ? (
          <Check
            size={16}
            className="text-green-500 group-hover:scale-110 transition-transform"
          />
        ) : (
          <Copy
            size={16}
            className="text-purple-500 group-hover:scale-110 transition-transform"
          />
        )}
        <span className="font-medium text-sm">
          {copied ? 'Saved to paw!' : 'Copy Link'}
        </span>
      </button>
    </div>
  );
}
