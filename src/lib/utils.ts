import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Determine the public site URL for auth redirects (Netlify/Prod vs Local)
export function getSiteUrl(path: string = ''): string {
  // Prefer explicit env override if provided
  const fromEnv = (import.meta as any)?.env?.VITE_SITE_URL || (import.meta as any)?.env?.VITE_PUBLIC_SITE_URL;
  let base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    base = fromEnv.trim();
  }
  // Ensure no trailing slash on base
  if (base.endsWith('/')) base = base.slice(0, -1);
  // Ensure path starts with slash
  if (path && !path.startsWith('/')) path = '/' + path;
  return base + (path || '');
}
