import { SavedTrip } from '../models/savedtrip.model.js';
import { fetchWikipediaPlaceImage } from '../utils/wikipediaImage.js';
import {
  fetchUnsplashHotelImage,
  fetchUnsplashRestaurantImage,
  poolHotelUrl,
  poolFoodUrl,
} from '../utils/unsplashImage.js';
import { placeFallbackUrl } from '../utils/placeFallbackImages.js';

const FALLBACK_HOTEL = poolHotelUrl('0', 'hotel');
const FALLBACK_FOOD = poolFoodUrl('0', 'food');

const hotelimgcontroller = async (req, res) => {
  const { name, city, hotelId } = req.body;

  if (!name || !city) {
    return res.status(400).json({ error: 'Hotel name and city are required' });
  }

  try {
    const url =
      (await fetchUnsplashHotelImage(city, hotelId, name)) || FALLBACK_HOTEL;

    const safeUrl =
      typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
        ? url
        : poolHotelUrl(String(hotelId ?? '0'), name);

    await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'hotels.hotels.id': hotelId,
      },
      { $set: { 'hotels.hotels.$.photoURL': safeUrl } },
      { new: true }
    );

    return res.json({
      image: safeUrl,
      source: safeUrl.startsWith('http') ? 'unsplash' : 'fallback',
    });
  } catch (err) {
    console.error('Error in hotelimgcontroller:', err.message);
    return res.json({
      image: poolHotelUrl(String(req.body?.hotelId ?? '0'), req.body?.name || 'Hotel'),
    });
  }
};

const placecontroller = async (req, res) => {
  const { name, city, placeid, lat, lng } = req.body;

  if (!name || !city || !placeid) {
    return res.status(400).json({ error: 'Place name, city and placeid are required' });
  }

  try {
    const wikiUrl = await fetchWikipediaPlaceImage(name, city, {
      lat,
      lng,
    });
    const safe =
      wikiUrl && String(wikiUrl).startsWith('http')
        ? wikiUrl
        : placeFallbackUrl(placeid, name);

    await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'places.places.placeid': placeid,
      },
      { $set: { 'places.places.$.photoURL': safe } },
      { new: true }
    );

    return res.json({ image: safe, source: wikiUrl ? 'wikipedia' : 'fallback' });
  } catch (err) {
    console.error('Error in placecontroller:', err.message);
    return res.json({ image: placeFallbackUrl(req.body?.placeid, req.body?.name) });
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

    const safeFood =
      typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
        ? url
        : poolFoodUrl(String(foodid ?? '0'), name);

    const imgurl = await SavedTrip.findOneAndUpdate(
      {
        userId: req.user.id,
        'hotels.hotels.id': hotelId,
        'hotels.hotels.foodOptions.foodid': foodid,
      },
      {
        $set: {
          'hotels.hotels.$[hotel].foodOptions.$[food].photoURL': safeFood,
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

    return res.json({
      image: safeFood,
      source: safeFood.startsWith('http') ? 'unsplash' : 'fallback',
    });
  } catch (err) {
    console.error('Error in foodcontroller:', err.message);
    return res.json({
      image: poolFoodUrl(String(req.body?.foodid ?? '0'), req.body?.name || 'Food'),
    });
  }
};

/** One request for all places — Wikipedia lookups run in parallel (no artificial delay). */
const placesBatchController = async (req, res) => {
  const { city, places: placeList } = req.body;
  if (!city || !Array.isArray(placeList) || !placeList.length) {
    return res.status(400).json({ error: 'city and places[] required' });
  }

  try {
    const rows = await Promise.all(
      placeList.map(async (p) => {
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
        const photoUrl =
          wikiUrl && String(wikiUrl).startsWith('http') ? wikiUrl : fallback;
        return { id, photoUrl, placeid: p.placeid };
      })
    );

    const images = {};
    for (const r of rows) {
      images[r.id] = r.photoUrl;
    }

    if (req.user?.id) {
      await Promise.all(
        rows
          .filter((r) => r.placeid)
          .map((r) =>
            SavedTrip.findOneAndUpdate(
              { userId: req.user.id, 'places.places.placeid': r.placeid },
              { $set: { 'places.places.$.photoURL': r.photoUrl } },
              { new: true }
            ).catch(() => {})
          )
      );
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
