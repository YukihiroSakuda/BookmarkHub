'use client';

import { BookHeart, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-energy rounded-full blur-2xl opacity-50 animate-pulse-slow" />
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-energy-purple" />
              <div className="absolute inset-0 bg-gradient-energy rounded-full blur-md opacity-30" />
            </div>
            <p className="text-xl font-medium bg-gradient-energy bg-clip-text text-transparent">
              Loading Bookmarks...
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className='flex gap-1'>
            <h1 className="text-5xl font-bold bg-gradient-energy bg-clip-text text-transparent">
              BookmarkHub
            </h1>
            <BookHeart 
              size={48} 
              className="text-[#db2aa9]"
            />
          </div>
          <p className="text-xl text-white/60">
            Keep your favorite links organized in style
          </p>
        </div>
      </div>
    </div>
  );
} 