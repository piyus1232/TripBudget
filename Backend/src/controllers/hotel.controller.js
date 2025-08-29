import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
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

    const nearbyUrl = `https://priceline-com2.p.rapidapi.com/hotels/nearby?latitude=${coordinates.lat}&longitude=${coordinates.lon}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&radius=${radius}`;

    const response = await axios.get(nearbyUrl, {
      headers: {
        'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
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
const getHotelData = async (cityID, checkIn, checkOut, rooms = 1, adults = 1, maxPrice =18) => {
  if (!cityID || !Number.isInteger(Number(cityID))) throw new Error('Invalid cityID');
  if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) throw new Error('Invalid dates');

  const searchUrl = `https://priceline-com2.p.rapidapi.com/hotels/search?locationId=${cityID}&checkIn=${checkIn}&checkOut=${checkOut}&rooms_number=${rooms}&adults=${adults}&page_number=0&maxPrice=${maxPrice}`;

  const response = await axios.get(searchUrl, {
    headers: {
      'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
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
  const apiKey = process.env.GEOCODE_API_KEY;

  // Use rankby=distance to get closest restaurants, cafes, or dhabas
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1800&type=restaurant&keyword=dhaba|street food|cafe&key=${apiKey}`;

  try {
    const { data } = await axios.get(url);

    // Filter out hotels, map with rating and price info
    const foodOptions = data.results
      .filter(place => !/hotel|motel|resort/i.test(place.name))
      .map(place => ({
        name: place.name,
         foodid: uuidv4(), 
        address: place.vicinity,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0, // 0 = very cheap, 4 = very expensive
        priceText: ["Very Cheap","Cheap","Moderate","Expensive","Very Expensive"][place.price_level || 0]
      }))
      // Sort by cheapest first, then by rating descending
      .sort((a, b) => {
        if(a.priceLevel !== b.priceLevel) return a.priceLevel - b.priceLevel;
        return b.rating - a.rating;
      })
      .slice(0, 12); // top 10 affordable options
      // console.log(foodOptions);
      

    return foodOptions;

  } catch (err) {
    if (err.response?.status === 429) {
      console.error(`Rate limit hit for ${lat},${lon}. Skipping this location.`);
      return [];
    }
    console.error(`Food fetch error for ${lat},${lon}:`, err.message);
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