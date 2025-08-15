import React, { useEffect, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function HotelWithFood() {
  const location = useLocation();
  const { data } = location.state || {};
  const { destination } = data || {};
  const [hotelImages, setHotelImages] = useState({});
  const [foodImages, setFoodImages] = useState({});

  const hotels = data?.hotels?.hotels || [];
  const defaultImage = './hotel.avif'; // fallback

  useEffect(() => {
    const fetchHotelImages = async () => {
      const hotelImgMap = {};
      const foodImgMap = {};

      await Promise.all(
        hotels.map(async (hotel) => {
          try {
            // Fetch hotel image
            const hotelRes = await axios.post(
              'http://localhost:5000/api/hotel-image',
              { name: hotel.name, city: destination },
              { withCredentials: true }
            );

            hotelImgMap[hotel.name] =
              hotelRes.data.image && typeof hotelRes.data.image === 'string'
                ? hotelRes.data.image
                : defaultImage;

            // Fetch images for each food option
            if (hotel.foodOptions?.length) {
              await Promise.all(
                hotel.foodOptions.map(async (food) => {
                  try {
                    const foodRes = await axios.post(
                      'http://localhost:5000/api/hotel-image',
                      { name: food.name, city: destination },
                      { withCredentials: true }
                    );

                    foodImgMap[food.name] =
                      foodRes.data.image && typeof foodRes.data.image === 'string'
                        ? foodRes.data.image
                        : defaultImage;
                  } catch {
                    foodImgMap[food.name] = defaultImage;
                  }
                })
              );
            }
          } catch (err) {
            console.error(`❌ Error fetching image for ${hotel.name}:`, err.message);
            hotelImgMap[hotel.name] = defaultImage;
          }
        })
      );

      setHotelImages(hotelImgMap);
      setFoodImages(foodImgMap);
    };

    if (hotels.length) fetchHotelImages();
  }, [hotels, destination]);

  return (
    <div className="p-10 min-h-screen">
      {hotels.slice(2).slice(1,3).map((hotel) => (
        <div key={hotel.id} className="mb-14">
          {/* Hotel Header */}
          <div className="flex items-center mb-6">
            <img
              src={hotelImages[hotel.name] || defaultImage}
              alt={hotel.name}
              className="w-20 h-20 object-cover rounded mr-4"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{hotel.name}</h2>
              <p className="text-gray-400 text-sm">{hotel.address}</p>
            </div>
          </div>

          {/* Nearby Food Options */}
          <h3 className="text-lg text-teal-400 font-semibold mb-4">
            Nearby Food Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotel.foodOptions?.slice(0, 6).map((food, idx) => (
              <Card key={idx} className="p-0 bg-[#2b2540] hover:shadow-xl transition-all">
                <div className="w-full h-32">
                  <img
                    src={foodImages[food.name] || defaultImage}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-white font-semibold text-sm">{food.name}</h4>
                  <p className="text-gray-400 text-xs">{food.address}</p>
                  <p className="text-yellow-400 text-xs mt-1">⭐ {food.rating}</p>
                  <span className="text-gray-400 text-xs bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                    {food.priceText}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HotelWithFood;
