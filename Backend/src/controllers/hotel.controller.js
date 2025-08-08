import axios from 'axios';

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

  return { lat: response.data[0].lat, lon: response.data[0].lon };
};

// Get cityID from Priceline nearby API
const getCityID = async (coordinates, checkIn, checkOut, rooms, adults, radius) => {
  const nearbyUrl = `https://priceline-com2.p.rapidapi.com/hotels/nearby?latitude=${coordinates.lat}&longitude=${coordinates.lon}&radius=${radius}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}`;
  const response = await axios.get(nearbyUrl, {
    headers: {
      'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
      'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
    },
  });

  if (!response.data?.status && response.data?.errors) {
    throw new Error(`Priceline API error: ${JSON.stringify(response.data.errors)}`);
  }

  const cityData = response.data?.data?.exactMatch?.matchedCity;
  if (!cityData || !cityData.cityID) {
    throw new Error('No matching city found in Priceline API');
  }

  return cityData.cityID;
};

// Get hotel data from Priceline search API
const getHotelData = async (cityID, checkIn, checkOut, rooms, adults) => {
  const searchUrl = `https://priceline-com2.p.rapidapi.com/hotels/search?locationId=${cityID}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&sortorder=PRICE`;
  const response = await axios.get(searchUrl, {
    headers: {
      'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
      'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
    },
  });

  if (!response.data?.status && response.data?.errors) {
    throw new Error(`Priceline API error: ${JSON.stringify(response.data.errors)}`);
  }

  const hotelData = response.data?.data;
  if (!hotelData || !hotelData.hotels) {
    throw new Error('No hotel data found in Priceline API response');
  }

  return hotelData;
};

// Process hotel data to get formatted results
const processHotels = (hotelData) => {
  const hotels = hotelData.hotels
    .filter(hotel => hotel.ratesSummary?.minPrice && !isNaN(parseFloat(hotel.ratesSummary.minPrice)))
    .sort((a, b) => parseFloat(a.ratesSummary.minPrice) - parseFloat(b.ratesSummary.minPrice))
    .slice(0, 8)
    .map(hotel => ({
      name: hotel.name,
      price: parseFloat(hotel.ratesSummary.minPrice).toFixed(2),
      starRating: hotel.starRating || 0,
      address: hotel.location?.address?.addressLine1 || 'N/A',
      amenities: hotel.hotelFeatures?.hotelAmenities?.map(a => a.name) || [],
    }));

  if (hotels.length === 0) {
    throw new Error('No hotels with valid prices found');
  }

  return {
    hotels,
    totalRecords: hotelData.meta?.totalRecords || hotels.length,
  };
};

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
};