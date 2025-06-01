'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingScreen() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse-slow" />
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin" />
              <div className="absolute inset-0 rounded-full blur-md opacity-30" />
            </div>
            <p className="text-xl font-medium">
              Loading Bookmarks...
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold">
            Book<span className="text-blue-500">marks</span>
          </h1>
          <p className="text-xl text-white/60">
            Keep your favorite links organized in style
          </p>
        </div>
      </div>
    </div>
  );
} 