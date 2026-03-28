/**
 * Backend API base URL — set in .env only for production builds.
 * @see .env.example
 */
const isDev = import.meta.env.DEV;
const trimmed = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export const API_BASE = trimmed || (isDev ? 'http://localhost:5000' : '');

/**
 * Build an absolute URL to your Express API. `path` must include the API prefix, e.g. `/api/v1/users/login`.
 * @param {string} path
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Define it in .env before building for production (see .env.example).'
    );
  }
  return `${API_BASE}${p}`;
}

/** Optional Unsplash client key for city/hotel hero images on the client (never commit real keys). */
export function getUnsplashAccessKey() {
  return String(import.meta.env.VITE_UNSPLASH_ACCESS_KEY ?? '').trim();
}

/**
 * When the Unsplash API key is missing, the request fails, or `/fallback.jpg` is not in `public/`,
 * use this stable images.unsplash.com URL (no Client-ID required for hotlinking these asset URLs).
 */
export const CITY_HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop&q=80';

export const HOTEL_HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
