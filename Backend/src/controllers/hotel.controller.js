import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { googlePlacesRapidApiKey } from '../utils/googlePlacesRapidApiKey.js';
// Validate input parameters
const validateInputs = (city, checkIn, checkOut, rooms, adults, radius) => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City name is required' };
  }
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'checkIn and checkOut dates are required' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return { isValid: false, error: 'Invalid date format (YYYY-MM-DD required)' };
  }

  if (isNaN(rooms) || rooms < 1 || isNaN(adults) || adults < 1 || isNaN(radius) || radius < 0) {
    return { isValid: false, error: 'Invalid numeric parameters' };
  }

  return { isValid: true };
};

// Get coordinates from Nominatim API
const getCoordinates = async (city) => {
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
  const response = await axios.get(geocodeUrl, {
    headers: { 'User-Agent': 'HotelController/1.0' },
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('City not found');
  }
  console.log(response.data[0].lat);
  return { lat: response.data[0].lat, lon: response.data[0].lon };


};

// Get cityID from Priceline nearby API

const getCityID = async (coordinates, checkIn, checkOut, rooms = 1, adults = 1, radius = 10) => {
  try {
    if (!checkIn || !checkOut) {
      throw new Error('checkIn and checkOut dates are required');
    }
    console.log(coordinates.lat, coordinates.lon);

    const nearbyUrl = `https://priceline-com2.p.rapidapi.com/hotels/nearby?latitude=${coordinates.lat}&longitude=${coordinates.lon}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&radius=${radius}`;

    const response = await axios.get(nearbyUrl, {
      headers: {
        'X-Rapidapi-Key': 'ee670953cbmsh3011f1f40f5f6dep1be1f2jsncd77d713da88',
        'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
      },
    });

    if (!response.data || (response.data.status === 'error' && response.data.errors)) {
      throw new Error(`Priceline API error: ${JSON.stringify(response.data.errors)}`);
    }

    const cityData = response.data?.matchedCity || response.data?.data?.exactMatch?.matchedCity;

    if (!cityData || !cityData.cityID) {
      throw new Error('No matching city found in Priceline API');
    }

    return cityData.cityID;
  } catch (error) {
    console.error('Error fetching city ID:', error.message);
    throw error;
  }
};
const getHotelData = async (cityID, checkIn, checkOut, rooms = 1, adults = 1, maxPrice = 18) => {
  if (!cityID || !Number.isInteger(Number(cityID))) throw new Error('Invalid cityID');
  if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) throw new Error('Invalid dates');

  const searchUrl = `https://priceline-com2.p.rapidapi.com/hotels/search?locationId=${cityID}&checkIn=${checkIn}&checkOut=${checkOut}&rooms_number=${rooms}&adults=${adults}&page_number=0&maxPrice=${maxPrice}`;

  const response = await axios.get(searchUrl, {
    headers: {
      'X-Rapidapi-Key': 'ee670953cbmsh3011f1f40f5f6dep1be1f2jsncd77d713da88',
      'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
    },
  });

  const hotelData = response.data.data;

  if (!hotelData || !hotelData.hotels) throw new Error('No hotel data found');

  return hotelData;
};


// Process hotel data to get formatted results
const processHotels = (hotelData, maxPrice = 10000) => {
  const hotels = hotelData.hotels
    .filter(hotel => hotel.ratesSummary?.minPrice && !isNaN(parseFloat(hotel.ratesSummary.minPrice)))
    .filter(hotel => parseFloat(hotel.ratesSummary.minPrice) <= maxPrice) // filter expensive hotels
    .sort((a, b) => parseFloat(a.ratesSummary.minPrice) - parseFloat(b.ratesSummary.minPrice))
    .slice(0, 12)
    .map(hotel => ({
      name: hotel.name,
      latitude: hotel.location.latitude,
      longitude: hotel.location.longitude,
      id: hotel.hotelId,
      price: parseFloat(hotel.ratesSummary.minPrice).toFixed(2),
      starRating: hotel.starRating || 0,
      address: hotel.location?.address?.addressLine1 || 'N/A',
      amenities: hotel.hotelFeatures?.hotelAmenities?.map(a => a.name) || [],
    }));

  if (hotels.length === 0) throw new Error('No hotels found within price range');

  return {
    hotels,
    totalRecords: hotelData.meta?.totalRecords || hotels.length,
  };
};




/** RapidAPI / Google both return `results` at top level; some proxies nest under `data`. */
function extractNearbySearchResults(data) {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data?.results)) return data.data.results;
  if (Array.isArray(data.data) && data.data.length && data.data[0]?.name) return data.data;
  return [];
}

/** Google can tag whole hotels as `restaurant` (in-house dining); those rows still include `lodging`. */
const FOOD_PLACE_TYPES = new Set([
  "restaurant",
  "meal_takeaway",
  "meal_delivery",
  "cafe",
  "bakery",
  "food",
]);

/** Bars, clubs, liquor retail — user asked for veg dining, not alcohol venues. */
const ALCOHOL_EXCLUDED_TYPES = new Set([
  "bar",
  "liquor_store",
  "night_club",
  "winery",
  "brewery",
]);

function filterToFoodPlaces(rows) {
  return rows.filter((place) => {
    const types = place.types;
    if (!Array.isArray(types) || types.length === 0) return true;
    if (types.includes("lodging")) return false;
    if (types.some((t) => ALCOHOL_EXCLUDED_TYPES.has(t))) return false;
    return types.some((t) => FOOD_PLACE_TYPES.has(t));
  });
}

function dedupePlacesById(rows) {
  const out = [];
  const seen = new Set();
  for (const p of rows) {
    const id = p.place_id;
    if (id) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    out.push(p);
  }
  return out;
}

function mapFoodRows(rows) {
  return rows.map((place) => ({
    foodid: uuidv4(),
    name: place.name || "Restaurant",
    address: place.vicinity || place.formatted_address || "N/A",
    rating: place.rating || 0,
    priceLevel: place.price_level ?? 0,
    priceText: ["Very Cheap", "Cheap", "Moderate", "Expensive", "Very Expensive"][
      place.price_level ?? 0
    ],
  }));
}

const NEARBY_FOOD_RADIUS = 2500;
const MIN_FOOD_RESULTS_BEFORE_EXTRA_TYPES = 6;

async function rapidNearbySearch(location, placeType, keyword) {
  const rapidKey = googlePlacesRapidApiKey();
  if (!rapidKey) return { rows: [], status: null, body: null };
  const params = {
    location,
    radius: NEARBY_FOOD_RADIUS,
    type: placeType,
    language: "en",
  };
  if (keyword) params.keyword = keyword;
  const response = await axios.get(
    "https://google-map-places.p.rapidapi.com/maps/api/place/nearbysearch/json",
    {
      params,
      headers: {
        "X-RapidAPI-Key": rapidKey,
        "X-RapidAPI-Host": "google-map-places.p.rapidapi.com",
      },
      timeout: 15000,
    }
  );
  const body = response.data;
  return {
    rows: extractNearbySearchResults(body),
    status: body?.status,
    body,
  };
}

async function rapidTextSearch(query, location) {
  try {
    const rapidKey = googlePlacesRapidApiKey();
    if (!rapidKey) return { rows: [], status: null, body: null };
    const response = await axios.get(
      "https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json",
      {
        params: {
          query,
          location,
          radius: NEARBY_FOOD_RADIUS,
          language: "en",
        },
        headers: {
          "X-RapidAPI-Key": rapidKey,
          "X-RapidAPI-Host": "google-map-places.p.rapidapi.com",
        },
        timeout: 15000,
      }
    );
    const body = response.data;
    return {
      rows: extractNearbySearchResults(body),
      status: body?.status,
      body,
    };
  } catch (e) {
    console.warn("[food] Rapid text search failed:", query, e.response?.data || e.message);
    return { rows: [], status: null, body: null };
  }
}

async function googleOfficialNearbySearch(location, placeType, key, keyword) {
  const params = {
    location,
    radius: NEARBY_FOOD_RADIUS,
    type: placeType,
    key,
  };
  if (keyword) params.keyword = keyword;
  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    { params, timeout: 15000 }
  );
  return { rows: extractNearbySearchResults(res.data), data: res.data };
}

async function googleOfficialTextSearch(query, location, key) {
  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
    {
      params: {
        query,
        location,
        radius: NEARBY_FOOD_RADIUS,
        key,
      },
      timeout: 15000,
    }
  );
  return { rows: extractNearbySearchResults(res.data), data: res.data };
}

function mergeSortAndMapFood(rows) {
  const filtered = filterToFoodPlaces(rows);
  filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return mapFoodRows(filtered.slice(0, 12));
}

/**
 * Nearby veg-friendly food for a hotel coordinate (no bars / liquor venues).
 * 1) RapidAPI Google Places proxy (needs GOOGLE_PLACES_RAPIDAPI_KEY or RAPIDAPI_KEY)
 * 2) Fallback: official Places if GOOGLE_API_KEY is set
 *
 * Biases toward vegetarian via keyword + text search; excludes `lodging` and alcohol-related types.
 */
async function getNearbyFoodOptions(lat, lon) {
  const nlat = Number(lat);
  const nlon = Number(lon);
  if (!Number.isFinite(nlat) || !Number.isFinite(nlon)) {
    console.warn("[food] invalid lat/lon:", lat, lon);
    return [];
  }
  const location = `${nlat},${nlon}`;

  const tryRapid = async () => {
    try {
      if (!googlePlacesRapidApiKey()) {
        console.error(
          "[food] No RapidAPI key — set GOOGLE_PLACES_RAPIDAPI_KEY or RAPIDAPI_KEY in .env"
        );
        return [];
      }
      const [vegNearby, vegText, pureVegText] = await Promise.all([
        rapidNearbySearch(location, "restaurant", "vegetarian"),
        rapidTextSearch("vegetarian restaurant", location),
        rapidTextSearch("pure veg restaurant", location),
      ]);

      let rows = dedupePlacesById([
        ...filterToFoodPlaces(vegNearby.rows),
        ...filterToFoodPlaces(vegText.rows),
        ...filterToFoodPlaces(pureVegText.rows),
      ]);

      if (rows.length < MIN_FOOD_RESULTS_BEFORE_EXTRA_TYPES) {
        const [cafes, takeaways] = await Promise.all([
          rapidNearbySearch(location, "cafe"),
          rapidNearbySearch(location, "meal_takeaway"),
        ]);
        rows = dedupePlacesById([
          ...rows,
          ...filterToFoodPlaces(cafes.rows),
          ...filterToFoodPlaces(takeaways.rows),
        ]);
      }

      if (rows.length === 0) {
        const broad = await rapidNearbySearch(location, "restaurant");
        rows = filterToFoodPlaces(broad.rows);
        const st = broad.status;
        if (st && st !== "ZERO_RESULTS" && st !== "OK") {
          console.warn(
            "[food] RapidAPI Places (broad):",
            st,
            broad.body?.error_message || broad.body?.message || ""
          );
        }
      }

      if (rows.length > 0) return mergeSortAndMapFood(rows);

      const st = vegNearby.status;
      if (st && st !== "ZERO_RESULTS") {
        console.warn(
          "[food] RapidAPI Places:",
          st,
          vegNearby.body?.error_message || vegNearby.body?.message || ""
        );
      }
    } catch (e) {
      console.error("[food] Rapid request failed:", e.response?.data || e.message);
    }
    return [];
  };

  const tryGoogleOfficial = async () => {
    try {
      const key = process.env.GOOGLE_API_KEY?.trim();
      if (!key) return [];

      const textFail = (label) => (e) => {
        console.warn(`[food] Google text search (${label}):`, e.message);
        return { rows: [], data: null };
      };

      const [vegNearby, vt, pv] = await Promise.all([
        googleOfficialNearbySearch(location, "restaurant", key, "vegetarian"),
        googleOfficialTextSearch("vegetarian restaurant", location, key).catch(
          textFail("vegetarian")
        ),
        googleOfficialTextSearch("pure veg restaurant", location, key).catch(
          textFail("pure veg")
        ),
      ]);

      let rows = dedupePlacesById([
        ...filterToFoodPlaces(vegNearby.rows),
        ...filterToFoodPlaces(vt.rows),
        ...filterToFoodPlaces(pv.rows),
      ]);

      if (rows.length < MIN_FOOD_RESULTS_BEFORE_EXTRA_TYPES) {
        const [cafes, takeaways] = await Promise.all([
          googleOfficialNearbySearch(location, "cafe", key),
          googleOfficialNearbySearch(location, "meal_takeaway", key),
        ]);
        rows = dedupePlacesById([
          ...rows,
          ...filterToFoodPlaces(cafes.rows),
          ...filterToFoodPlaces(takeaways.rows),
        ]);
      }

      if (rows.length === 0) {
        const broad = await googleOfficialNearbySearch(location, "restaurant", key);
        rows = filterToFoodPlaces(broad.rows);
      }

      const st = vegNearby.data?.status;
      if (st && st !== "OK" && st !== "ZERO_RESULTS") {
        console.warn("[food] Google Places:", st, vegNearby.data?.error_message || "");
      }
      return rows.length ? mergeSortAndMapFood(rows) : [];
    } catch (e) {
      console.error("[food] Google fallback failed:", e.response?.data || e.message);
      return [];
    }
  };

  const rapid = await tryRapid();
  if (rapid.length > 0) return rapid;
  return tryGoogleOfficial();
}

// export { getNearbyFoodOptions };






// Main controller function
const getNearbyHotels = async (req, res) => {
  const { city, checkIn, checkOut, rooms = 1, adults = 2, radius = 10 } = req.body;

  try {
    // Validate inputs
    const validation = validateInputs(city, checkIn, checkOut, rooms, adults, radius);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Get coordinates
    const coordinates = await getCoordinates(city);

    // Get cityID
    const cityID = await getCityID(coordinates, checkIn, checkOut, rooms, adults, radius);

    // Get hotel data
    const hotelData = await getHotelData(cityID, checkIn, checkOut, rooms, adults);

    // Process and format hotel data
    const result = processHotels(hotelData);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching hotels:', error.message);
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: `Error fetching data from API: ${error.response.data?.message || error.message}`,
      });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
};

export {
  getNearbyHotels,
  validateInputs,
  getCoordinates,
  getCityID,
  getHotelData,
  processHotels,
  getNearbyFoodOptions
};