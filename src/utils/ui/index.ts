import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch {
    return '/default-favicon.png';
  }
}

export function getThumbnailUrl(url: string): string {
  // TODO: OGP画像の取得を実装
  return getFaviconUrl(url);
} 