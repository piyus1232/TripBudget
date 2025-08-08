import axios from 'axios';

const hotelimgcontroller = async (req, res) => {
  const GOOGLE_API_KEY = 'AIzaSyBeHk-GWW25JdXShUzUSvc4bFF3EtFIRyg';
  const { name, city } = req.body;

  if (!name || !city) {
    return res.status(400).json({ error: 'Hotel name and city are required' });
  }

  try {
    // Step 0: Get city lat/lng using Geocoding API
    const geoRes = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: city,
          key: GOOGLE_API_KEY,
        },
      }
    );

    const location = geoRes.data.results?.[0]?.geometry?.location;
    if (!location) return res.json({ image: '/fallback.jpg' });

    const { lat, lng } = location;

    // Step 1: Find Place ID using Find Place API with location bias
    const query = `${name} ${city}`;
    const searchRes = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: query,
          inputtype: 'textquery',
          fields: 'place_id,name,formatted_address',
          locationbias: `point:${lat},${lng}`,
          key: GOOGLE_API_KEY,
        },
      }
    );

    const candidate = searchRes.data.candidates?.[0];

    // Step 2: Check if the address contains the city
    if (!candidate || !candidate.formatted_address.toLowerCase().includes(city.toLowerCase())) {
      console.log(`No matching hotel found for "${name}" in "${city}"`);
      return res.json({ image: '/fallback.jpg' });
    }

    const placeId = candidate.place_id;

    // Step 3: Get Photo Reference
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photo&key=${GOOGLE_API_KEY}`;
    const detailsRes = await axios.get(detailsUrl);
    const photoRef = detailsRes.data.result?.photos?.[0]?.photo_reference;

    if (!photoRef) return res.json({ image: '/fallback.jpg' });

    // Step 4: Construct Final Photo URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
    // console.log(`Image URL for ${name} in ${city}:`, photoUrl);
    return res.json({ image: photoUrl });

  } catch (err) {
    console.error('Error in hotelimgcontroller:', err.message);
    return res.json({ image: '/fallback.jpg' });
  }
};

export { hotelimgcontroller };
