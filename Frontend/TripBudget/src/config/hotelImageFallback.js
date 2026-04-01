/** Same pool as Backend/src/utils/unsplashImage.js — stable hash picks a distinct stock image per hotel. */
const HOTEL_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  "https://images.unsplash.com/photo-1596436889106-35cc8a84c4ba?w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9ad703b?w=800&q=80",
  "https://images.unsplash.com/photo-1615460549969-fa0c7101a8a1?w=800&q=80",
  "https://images.unsplash.com/photo-1590073844006-33379778a09d?w=800&q=80",
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210cc?w=800&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
  "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
];

function hashStr(s) {
  let h = 0;
  const str = String(s ?? "");
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Distinct placeholder per hotel when no API image yet (matches server-side pool). */
export function poolHotelImageUrl(hotelId, hotelName = "") {
  const i = hashStr(`${hotelId}:${hotelName}`) % HOTEL_IMAGE_POOL.length;
  return HOTEL_IMAGE_POOL[i];
}

/** Reject relative paths like `/hotel.avif` (not in Vite public) and bad values. */
export function isUsableRemoteImageUrl(url) {
  if (url == null || typeof url !== "string") return false;
  const t = url.trim();
  return t.startsWith("https://") || t.startsWith("http://");
}

/** Always return a loadable https URL for hotel cards. */
export function ensureHotelImageUrl(url, hotelId, hotelName = "") {
  if (isUsableRemoteImageUrl(url)) return url.trim();
  return poolHotelImageUrl(hotelId ?? hotelName, hotelName);
}
