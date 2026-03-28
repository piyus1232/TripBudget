import { SavedTrip } from '../models/savedtrip.model.js';
import { fetchWikipediaPlaceImage } from '../utils/wikipediaImage.js';
import {
  fetchUnsplashHotelImage,
  fetchUnsplashRestaurantImage,
} from '../utils/unsplashImage.js';
import { placeFallbackUrl } from '../utils/placeFallbackImages.js';

const FALLBACK_HOTEL = '/hotel.avif';
const FALLBACK_FOOD = '/hotel.avif';

const hotelimgcontroller = async (req, res) => {
  const { name, city, hotelId } = req.body;

  if (!name || !city) {
    return res.status(400).json({ error: 'Hotel name and city are required' });
  }

  try {
    const url =
      (await fetchUnsplashHotelImage(city, hotelId, name)) || FALLBACK_HOTEL;

    await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'hotels.hotels.id': hotelId,
      },
      { $set: { 'hotels.hotels.$.photoURL': url } },
      { new: true }
    );

    return res.json({ image: url, source: url.startsWith('http') ? 'unsplash' : 'fallback' });
  } catch (err) {
    console.error('Error in hotelimgcontroller:', err.message);
    return res.json({ image: FALLBACK_HOTEL });
  }
};

const placecontroller = async (req, res) => {
  const { name, city, placeid, lat, lng } = req.body;

  if (!name || !city || !placeid) {
    return res.status(400).json({ error: 'Place name, city and placeid are required' });
  }

  const fallback = '/fallback.jpg';

  try {
    const wikiUrl = await fetchWikipediaPlaceImage(name, city, {
      lat,
      lng,
    });
    const photoUrl = wikiUrl || fallback;

    await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'places.places.placeid': placeid,
      },
      { $set: { 'places.places.$.photoURL': photoUrl } },
      { new: true }
    );

    return res.json({ image: photoUrl, source: wikiUrl ? 'wikipedia' : 'fallback' });
  } catch (err) {
    console.error('Error in placecontroller:', err.message);
    return res.json({ image: fallback });
  }
};

const foodcontroller = async (req, res) => {
  const { name, city, foodid, hotelId } = req.body;

  if (!name || !city || !foodid || !hotelId) {
    return res.status(400).json({
      error: 'Food name, city, foodid, and hotelId are required',
    });
  }

  try {
    const url =
      (await fetchUnsplashRestaurantImage(name, city, foodid)) || FALLBACK_FOOD;

    const imgurl = await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'hotels.hotels.id': hotelId,
        'hotels.hotels.foodOptions.foodid': foodid,
      },
      {
        $set: {
          'hotels.hotels.$[hotel].foodOptions.$[food].photoURL': url,
        },
      },
      {
        arrayFilters: [{ 'hotel.id': hotelId }, { 'food.foodid': foodid }],
        new: true,
      }
    );

    if (!imgurl) {
      return res.status(404).json({ error: 'Trip, hotel, or food option not found' });
    }

    return res.json({ image: url, source: url.startsWith('http') ? 'unsplash' : 'fallback' });
  } catch (err) {
    console.error('Error in foodcontroller:', err.message);
    return res.json({ image: FALLBACK_FOOD });
  }
};

/** One request for all places — avoids N useEffects / Strict Mode races */
const placesBatchController = async (req, res) => {
  const { city, places: placeList } = req.body;
  if (!city || !Array.isArray(placeList) || !placeList.length) {
    return res.status(400).json({ error: 'city and places[] required' });
  }

  const images = {};
  try {
    for (let i = 0; i < placeList.length; i++) {
      const p = placeList[i];
      const id = String(p.placeid || (p.name || '').trim().toLowerCase());
      let wikiUrl = null;
      try {
        wikiUrl = await fetchWikipediaPlaceImage(p.name, city, {
          lat: p.lat,
          lng: p.lng,
        });
      } catch (e) {
        console.warn('wiki place', p.name, e.message);
      }
      const fallback = placeFallbackUrl(p.placeid, p.name);
      const photoUrl = wikiUrl || fallback;
      images[id] = photoUrl;
      if (i < placeList.length - 1) {
        await new Promise((r) => setTimeout(r, 400));
      }
      if (p.placeid && req.user?.id) {
        await SavedTrip.findOneAndUpdate(
          { userId: req.user.id, 'places.places.placeid': p.placeid },
          { $set: { 'places.places.$.photoURL': photoUrl } },
          { new: true }
        ).catch(() => {});
      }
    }
    return res.json({ images });
  } catch (err) {
    console.error('placesBatchController:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

export {
  hotelimgcontroller,
  placecontroller,
  foodcontroller,
  placesBatchController,
};
