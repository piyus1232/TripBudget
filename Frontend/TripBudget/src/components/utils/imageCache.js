// src/utils/imageCache.js
const STORAGE_KEY = 'tripbudget:imageCache:v1';
const MAX_ENTRIES_PER_SCOPE = 800;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export const imgCache = {
  hotel: new Map(), // key: `${city}:${hotelId}`
  food: new Map(),
  place: new Map(), // key: `${destination}:${placeId}`
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function persist() {
  if (!canUseStorage()) return;
  try {
    const payload = {
      hotel: Array.from(imgCache.hotel.entries()),
      food: Array.from(imgCache.food.entries()),
      place: Array.from(imgCache.place.entries()),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / JSON errors
  }
}

function trimScope(scope) {
  const m = imgCache[scope];
  while (m.size > MAX_ENTRIES_PER_SCOPE) {
    const first = m.keys().next().value;
    m.delete(first);
  }
}

function hydrate() {
  if (!canUseStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    ['hotel', 'food', 'place'].forEach((scope) => {
      const rows = Array.isArray(parsed?.[scope]) ? parsed[scope] : [];
      const now = Date.now();
      for (const item of rows) {
        if (!Array.isArray(item) || item.length < 2) continue;
        const [key, rec] = item;
        if (!rec?.url) continue;
        if (now - (rec.savedAt || 0) > CACHE_TTL_MS) continue;
        imgCache[scope].set(key, rec);
      }
      trimScope(scope);
    });
  } catch {
    // ignore bad cache data
  }
}

hydrate();

export const getCached = (scope, key) => {
  const rec = imgCache?.[scope]?.get(key);
  if (!rec) return null;
  const now = Date.now();
  if (now - (rec.savedAt || 0) > CACHE_TTL_MS) {
    imgCache[scope].delete(key);
    persist();
    return null;
  }
  return rec.url || null;
};

export const setCached = (scope, key, url) => {
  if (!imgCache?.[scope] || !key || !url) return;
  imgCache[scope].set(key, { url, savedAt: Date.now() });
  trimScope(scope);
  persist();
};

// tiny preloader to warm browser cache too
export const preload = (url) => {
  if (!url || typeof Image === 'undefined') return;
  const i = new Image();
  i.src = url;
};
