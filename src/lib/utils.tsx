import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // Remove falsy values and merge class names
  return twMerge(clsx(inputs))
}
