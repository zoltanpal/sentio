import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // Remove falsy values and merge class names
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return `${Math.floor(diff / 1440)} day ago`;
}