import axios from 'axios';
import { SavedTrip } from '../models/savedtrip.model.js';
import mongoose from 'mongoose';

const hotelimgcontroller = async (req, res) => {
  const GOOGLE_API_KEY = 'AIzaSyBeHk-GWW25JdXShUzUSvc4bFF3EtFIRyg';
  const { name, city,hotelId } = req.body;

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
    // console.log(hotelId);``
    

    // Step 4: Construct Final Photo URL
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
    // console.log(`Image URL for ${name} in ${city}:`, photoUrl);
    // console.log("Updating photoURL for hotelId:", hotelId);
      const imgurl = await SavedTrip.findOneAndUpdate(

        {userId: req.user.id,
       "hotels.hotels.id": hotelId},
      { $set: { "hotels.hotels.$.photoURL": photoUrl } }, // $ targets the matching array element
      { new: true }
    );
    if (imgurl) {
  const updatedHotel = imgurl.hotels.hotels.find(h => h.id === hotelId);
  // console.log("Updated hotel photoURL:", updatedHotel?.photoURL);
} else {
  console.log("No document found for hotelId:", hotelId);
}
    
  
    
    return res.json({ image: photoUrl });



  } catch (err) {
    console.error('Error in hotelimgcontroller:', err.message);
    return res.json({ image: '/fallback.jpg' });
  }
};
const placecontroller = async (req, res) => {
  const GOOGLE_API_KEY = 'AIzaSyBeHk-GWW25JdXShUzUSvc4bFF3EtFIRyg';
  const { name, city,placeid } = req.body;

  if (!name || !city || !placeid) {
    return res.status(400).json({ error: 'Hotel name and city and placeid are required' });
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
      console.log(`No matching place found for "${name}" in "${city}"`);
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
      //  const imgurl = await SavedTrip.updateOne()

        const imgurl = await SavedTrip.findOneAndUpdate(
           {userId: req.user.id,
       "places.places.placeid":placeid },
      { $set: { "places.places.$.photoURL": photoUrl } }, // $ targets the matching array element
      { new: true }
    );
    if (imgurl) {
  const updatedplace = imgurl.places.places.find(p => p.placeid === placeid);
  // console.log("Updated place photoURL:", updatedplace?.photoURL);
} else {
  console.log("No document found for placeId:", placeId);
}
    
    return res.json({ image: photoUrl });
  


  } catch (err) {
    console.error('Error in hotelimgcontroller:', err.message);
    return res.json({ image: '/fallback.jpg' });
  }
};
const foodcontroller = async (req, res) => {
  const GOOGLE_API_KEY = 'AIzaSyBeHk-GWW25JdXShUzUSvc4bFF3EtFIRyg';
  const { name, city, foodid, hotelId } = req.body;

  if (!name || !city || !foodid || !hotelId) {
    return res.status(400).json({ error: 'Hotel name, city, foodid, and hotelId are required' });
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
      console.log(`No matching place found for "${name}" in "${city}"`);
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

    // Step 5: Update the photoURL for the specific food option in the SavedTrip document
    const imgurl = await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        "hotels.hotels.id": hotelId,
        "hotels.hotels.foodOptions.foodid": foodid,
      },
      {
        $set: {
          "hotels.hotels.$[hotel].foodOptions.$[food].photoURL": photoUrl,
        },
      },
      {
        arrayFilters: [
          { "hotel.id": hotelId },
          { "food.foodid": foodid },
        ],
        new: true,
      }
    );

    if (!imgurl) {
      console.log(`No document found for userId: ${req.user.id}, hotelId: ${hotelId}, foodid: ${foodid}`);
      return res.status(404).json({ error: "Trip, hotel, or food option not found" });
    }

    // Verify the update by finding the updated food option
    const updatedHotel = imgurl.hotels.hotels.find(h => String(h.id) === String(hotelId));
    const updatedFood = updatedHotel?.foodOptions.find(f => String(f.foodid) === String(foodid));
    console.log("✅ Updated food photoURL:", updatedFood?.photoURL);

    return res.json({ image: photoUrl });

  } catch (err) {
    console.error('Error in foodcontroller:', err.message);
    return res.json({ image: '/fallback.jpg' });
  }
};




export { hotelimgcontroller,placecontroller,foodcontroller };
