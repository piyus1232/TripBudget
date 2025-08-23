// SuggestedRecommendation.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/utils/Card';
import { useLocation, useNavigate } from 'react-router-dom';
import { imgCache, getCached, setCached, preload } from '../../../src/components/utils/imageCache.js';

function SuggestedRecommendation() {
  const location = useLocation();
  const { data } = location.state || {};
  const navigate = useNavigate();

  const hotels = data?.hotels?.hotels || [];
  const destination = data?.destination;
  const defaultImage = './hotel.avif';

  const [hotelImages, setHotelImages] = useState(() => {
    // prime from cache synchronously for instant paint
    const map = {};
    for (const h of hotels) {
      const key = `${destination}:${h.id}`;
      map[h.name] = getCached('hotel', key) || null;
    }
    return map;
  });

  const [foodImages, setFoodImages] = useState({}); // name -> url

  // Fetch missing hotel images (skip cached)
  useEffect(() => {
    if (!hotels.length || !destination) return;
    (async () => {
      const updates = {};
      await Promise.all(hotels.map(async (hotel) => {
        const cacheKey = `${destination}:${hotel.id}`;
        const cached = getCached('hotel', cacheKey);
        if (cached) return; // already have it

        try {
          const res = await axios.post('http://localhost:5000/api/hotel-image', {
            name: hotel.name, hotelId: hotel.id, city: destination,
          }, { withCredentials: true });

          const url = (res.data?.image && typeof res.data.image === 'string')
            ? res.data.image : defaultImage;

          setCached('hotel', cacheKey, url);
          preload(url);
          updates[hotel.name] = url;
        } catch {
          setCached('hotel', cacheKey, defaultImage);
          updates[hotel.name] = defaultImage;
        }
      }));
      if (Object.keys(updates).length) {
        setHotelImages(prev => ({ ...prev, ...updates }));
      }
    })();
  }, [hotels, destination]);

  // Preload all food images for all hotels (cached)
  useEffect(() => {
    if (!hotels.length || !destination) return;
    (async () => {
      const updates = {};
      await Promise.all(hotels.map(async (hotel) => {
        const foods = hotel.foodOptions || [];
        await Promise.all(foods.map(async (food) => {
          const key = `${hotel.id}:${food.foodid}`;
          const cached = getCached('food', key);
          if (cached) {
            updates[food.name] = cached;
            return;
          }
          try {
            const res = await axios.post('http://localhost:5000/api/foodimage', {
              name: food.name, foodid: food.foodid, hotelId: hotel.id, city: destination,
            }, { withCredentials: true });

            const url = (res.data?.image && typeof res.data.image === 'string')
              ? res.data.image : defaultImage;

            setCached('food', key, url);
            preload(url);
            updates[food.name] = url;
          } catch {
            setCached('food', key, defaultImage);
            updates[food.name] = defaultImage;
          }
        }));
      }));
      if (Object.keys(updates).length) {
        setFoodImages(prev => ({ ...prev, ...updates }));
      }
    })();
  }, [hotels, destination]);

  return (
    <div className="mb-10 ml-7">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-10">
        Suggested Accommodations
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-7">
        {hotels.length ? hotels.map((hotel, index) => {
          const hotelImg = hotelImages[hotel.name] || defaultImage;

          return (
            <Card key={index}
              className="h-full p-0 flex flex-col justify-between overflow-hidden bg-[#1f1a2e] hover:shadow-xl transition-all">
              <div className="w-full h-44">
                <img
                  src={hotelImg}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="min-h-[64px] flex flex-col gap-1">
                  <h3 className="text-white text-lg font-semibold line-clamp-2">
                    {hotel.name}
                  </h3>
                </div>

                <p className="text-green-400 text-sm font-medium tabular-nums">
                  ₹{Math.round(parseFloat(hotel.price) * 87.68)}
                  <span className="text-gray-400"> per night</span>
                </p>

                <button
                  className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 
                             text-white font-semibold rounded-xl shadow-md 
                             hover:shadow-xl hover:scale-105 transition-all text-xs"
                  onClick={() => {
                    // build a small map of ONLY this hotel's food images (already cached/preloaded)
                    const currentFoodMap = {};
                    (hotel.foodOptions || []).forEach((f) => {
                      const key = `${hotel.id}:${f.foodid}`;
                      currentFoodMap[f.name] = getCached('food', key) || foodImages[f.name] || defaultImage;
                    });

                    const hotelKey = `${destination}:${hotel.id}`;
                    const hotelImage = getCached('hotel', hotelKey) || hotelImg;

                    navigate(`/hotelfood/${hotel.id}`, {
                      state: {
                        hotel,
                        destination,
                        hotelImage,                 // 👈 pass preloaded hotel image
                        preloadedFoodImages: currentFoodMap, // 👈 pass this hotel's food images
                      },
                    });
                  }}
                >
                  View Hotel & Nearby Food
                </button>
              </div>
            </Card>
          );
        }) : (
          <p className="text-white ml-10">No hotel recommendations found.</p>
        )}
      </div>
    </div>
  );
}

export default SuggestedRecommendation;
