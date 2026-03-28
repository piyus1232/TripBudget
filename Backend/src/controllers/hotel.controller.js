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




async function getNearbyFoodOptions(lat, lon) {
  try {
    const rapidKey = googlePlacesRapidApiKey();
    if (!rapidKey) {
      console.error("getNearbyFoodOptions: GOOGLE_PLACES_RAPIDAPI_KEY not set");
      return [];
    }
    const response = await axios.get(
      "https://google-map-places.p.rapidapi.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lon}`,
          radius: 1800,
          type: "restaurant",
          keyword: "dhaba street food cafe",
          language: "en",
        },
        headers: {
          "X-RapidAPI-Key": rapidKey,
          "X-RapidAPI-Host": "google-map-places.p.rapidapi.com",
        },
      }
    );
    return response.data.results.map(place => ({
      foodid: uuidv4(),                    // ✅ REQUIRED FIX
      name: place.name,
      address: place.vicinity || "N/A",
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      priceText: ["Very Cheap", "Cheap", "Moderate", "Expensive", "Very Expensive"][place.price_level || 0],
    }));
  } catch (error) {
    console.error("Food API error:", error.response?.data || error.message);
    return [];
  }
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