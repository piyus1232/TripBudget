/** Mirrors Backend/src/utils/placeFallbackImages.js — instant per-place images while Wikipedia batch loads. */
const PLACE_FALLBACK_POOL = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
  "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "https://images.unsplash.com/photo-1565008576549-ede32a0e3cd0?w=800&q=80",
  "https://images.unsplash.com/photo-1552832230-c0197dd771b5?w=800&q=80",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
];

function hash(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++)
    h = (Math.imul(31, h) + String(s).charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function placeFallbackUrl(placeId, placeName) {
  return PLACE_FALLBACK_POOL[hash(`${placeId}:${placeName}`) % PLACE_FALLBACK_POOL.length];
}
