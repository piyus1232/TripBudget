import axios from 'axios';

const getNearbyHotels = async (req, res) => {
  const { city, checkIn, checkOut, rooms = 1, adults = 2, radius = 10 } = req.body;

  // Validate inputs
  if (!city || city.trim() === '') {
    return res.status(400).json({ error: 'City name is required' });
  }
  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut dates are required' });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD required)' });
  }

  // Validate numeric parameters
  if (isNaN(rooms) || rooms < 1 || isNaN(adults) || adults < 1 || isNaN(radius) || radius < 0) {
    return res.status(400).json({ error: 'Invalid numeric parameters' });
  }

  try {
    // Step 1: Get latitude and longitude from Nominatim API
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const geocodeResponse = await axios.get(geocodeUrl, {
      headers: { 'User-Agent': 'HotelController/1.0' },
    });

    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const coordinates = { lat: geocodeResponse.data[0].lat, lon: geocodeResponse.data[0].lon };

    // Step 2: Call Priceline /hotels/nearby to get cityID
    const nearbyUrl = `https://priceline-com2.p.rapidapi.com/hotels/nearby?latitude=${coordinates.lat}&longitude=${coordinates.lon}&radius=${radius}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}`;
    const nearbyResponse = await axios.get(nearbyUrl, {
      headers: {
        'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
        'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
      },
    });

    // Check for API errors
    if (!nearbyResponse.data?.status && nearbyResponse.data?.errors) {
      return res.status(400).json({ error: 'Priceline API error', details: nearbyResponse.data.errors });
    }

    // Extract cityID
    const responseData = nearbyResponse.data?.data;
    if (!responseData) {
      return res.status(500).json({ error: 'Invalid response from Priceline API' });
    }

    const cityData = responseData.exactMatch?.matchedCity;
    if (!cityData || !cityData.cityID) {
      return res.status(404).json({ error: 'No matching city found in Priceline API' });
    }

    const cityID = cityData.cityID;

    // Step 3: Call Priceline /hotels/search to get hotel data
    const searchUrl = `https://priceline-com2.p.rapidapi.com/hotels/search?locationId=${cityID}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&sortorder=PRICE`;
    const hotelResponse = await axios.get(searchUrl, {
      headers: {
        'X-Rapidapi-Key': process.env.RAPIDAPI_KEY,
        'X-Rapidapi-Host': 'priceline-com2.p.rapidapi.com',
      },
    });

    // Check for API errors
    if (!hotelResponse.data?.status && hotelResponse.data?.errors) {
      return res.status(400).json({ error: 'Priceline API error', details: hotelResponse.data.errors });
    }

    // Extract hotel data
    const hotelData = hotelResponse.data?.data;
    if (!hotelData || !hotelData.hotels) {
      return res.status(500).json({ error: 'No hotel data found in Priceline API response' });
    }

    // Get 3–4 cheapest hotels with valid prices, sorted by price
    const hotels = hotelData.hotels
      .filter(hotel => hotel.ratesSummary?.minPrice && !isNaN(parseFloat(hotel.ratesSummary.minPrice)))
      .sort((a, b) => parseFloat(a.ratesSummary.minPrice) - parseFloat(b.ratesSummary.minPrice))
      .slice(0, 4)
      .map(hotel => ({
        name: hotel.name,
        price: parseFloat(hotel.ratesSummary.minPrice).toFixed(2),
        starRating: hotel.starRating || 0,
        address: hotel.location?.address?.addressLine1 || 'N/A',
        amenities: hotel.hotelFeatures?.hotelAmenities?.map(a => a.name) || [],
      }));

    if (hotels.length === 0) {
      return res.status(404).json({ error: 'No hotels with valid prices found' });
    }

    res.status(200).json({
      hotels,
      totalRecords: hotelData.meta?.totalRecords || hotels.length,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error.message);
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: `Error fetching data from API: ${error.response.data?.message || error.message}`,
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export { getNearbyHotels };