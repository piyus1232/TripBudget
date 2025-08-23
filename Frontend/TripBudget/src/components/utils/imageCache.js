// src/utils/imageCache.js
export const imgCache = {
  hotel: new Map(), // key: `${city}:${hotelId}`
  food: new Map(),  // key: `${hotelId}:${foodId}`
};

export const getCached = (scope, key) => (imgCache[scope].get(key) || null);
export const setCached = (scope, key, url) => imgCache[scope].set(key, url);

// tiny preloader to warm browser cache too
export const preload = (url) => { if (!url) return; const i = new Image(); i.src = url; };
