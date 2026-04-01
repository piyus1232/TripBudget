import axios from 'axios';

/** Diverse hotel exteriors (Unsplash CDN) — used when no API key or API fails. Each hotel picks by hash so cards differ. */
const HOTEL_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  'https://images.unsplash.com/photo-1596436889106-35cc8a84c4ba?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9ad703b?w=800&q=80',
  'https://images.unsplash.com/photo-1615460549969-fa0c7101a8a1?w=800&q=80',
  'https://images.unsplash.com/photo-1590073844006-33379778a09d?w=800&q=80',
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb210cc?w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80',
];

/** Diverse restaurant / food shots — per food item by hash */
const FOOD_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
];

function hashStr(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function poolHotelUrl(hotelId, hotelName) {
  const i = hashStr(`${hotelId}:${hotelName}`) % HOTEL_IMAGE_POOL.length;
  return HOTEL_IMAGE_POOL[i];
}

function poolFoodUrl(foodid, foodName) {
  const i = hashStr(`${foodid}:${foodName}`) % FOOD_IMAGE_POOL.length;
  return FOOD_IMAGE_POOL[i];
}

function scoreHotelAlt(text) {
  if (!text) return 0;
  const t = text.toLowerCase();
  let s = 0;
  if (/\b(hotel|resort|lodging|hospitality|suite)\b/.test(t)) s += 3;
  if (/\b(building|facade|exterior|architecture|entrance|lobby)\b/.test(t)) s += 2;
  if (/\b(garage|parking lot|warehouse|factory)\b/.test(t)) s -= 8;
  return s;
}

function scoreFoodAlt(text) {
  if (!text) return 0;
  const t = text.toLowerCase();
  let s = 1;
  if (/\b(restaurant|dining|food|meal|dish|cuisine|plate)\b/.test(t)) s += 3;
  if (/\b(garage|parking)\b/.test(t)) s -= 6;
  return s;
}

/**
 * One distinct image per hotel: API (if key) picks by index; else rotating static pool.
 */
export async function fetchUnsplashHotelImage(city, hotelId, hotelName = '') {
  const seed = `${hotelId}:${hotelName}:${city}`;
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  const cityPart = (city || 'travel').trim();

  if (!key) {
    return poolHotelUrl(hotelId, hotelName);
  }

  const page = 1 + (hashStr(seed) % 5);
  const queries = [
    `hotel building exterior ${cityPart}`,
    `boutique hotel facade ${cityPart}`,
    `resort hotel architecture`,
    `luxury hotel lobby exterior`,
  ];
  const q = queries[hashStr(seed) % queries.length];

  try {
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: q,
        per_page: 30,
        page,
        orientation: 'landscape',
      },
      headers: { Authorization: `Client-ID ${key}` },
      timeout: 12000,
    });
    const results = data?.results || [];
    if (!results.length) return poolHotelUrl(hotelId, hotelName);

    const scored = results.map((r, idx) => ({
      url: r.urls?.regular || r.urls?.small,
      sc: scoreHotelAlt(r.alt_description || r.description || ''),
      idx,
    }));
    scored.sort((a, b) => b.sc - a.sc);
    const decent = scored.filter((x) => x.sc >= 0);
    const pool = decent.length ? decent : scored;
    const pick = pool[hashStr(seed) % pool.length];
    return pick?.url || poolHotelUrl(hotelId, hotelName);
  } catch (e) {
    console.warn('Unsplash hotel:', e.message);
    return poolHotelUrl(hotelId, hotelName);
  }
}

export async function fetchUnsplashRestaurantImage(foodName, city, foodid) {
  const seed = `${foodid}:${foodName}:${city}`;
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  const cityPart = (city || '').trim();

  if (!key) {
    return poolFoodUrl(foodid, foodName);
  }

  const page = 1 + (hashStr(seed) % 4);
  const queries = [
    `restaurant dining food ${cityPart}`,
    `fine dining plate`,
    `restaurant interior food`,
  ];
  const q = queries[hashStr(seed) % queries.length];

  try {
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query: q, per_page: 25, page },
      headers: { Authorization: `Client-ID ${key}` },
      timeout: 12000,
    });
    const results = data?.results || [];
    if (!results.length) return poolFoodUrl(foodid, foodName);

    const scored = results.map((r) => ({
      url: r.urls?.regular || r.urls?.small,
      sc: scoreFoodAlt(r.alt_description || r.description || ''),
    }));
    scored.sort((a, b) => b.sc - a.sc);
    const pool = scored.filter((x) => x.sc >= 0).length
      ? scored.filter((x) => x.sc >= 0)
      : scored;
    const pick = pool[hashStr(seed) % pool.length];
    return pick?.url || poolFoodUrl(foodid, foodName);
  } catch (e) {
    console.warn('Unsplash restaurant:', e.message);
    return poolFoodUrl(foodid, foodName);
  }
}

/** Stable HTTPS fallbacks for controllers (never use relative `/hotel.avif` on the API response). */
export { poolHotelUrl, poolFoodUrl };
