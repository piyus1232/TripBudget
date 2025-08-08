import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/utils/Card';
import { useLocation } from 'react-router-dom';

function SuggestedRecommendation() {
  const location = useLocation();
  const { data } = location.state || {};
  const [expandedHotels, setExpandedHotels] = useState({});

  const hotels = data.hotels?.hotels || [];
  const [hotelImages, setHotelImages] = useState({});
  const { source, destination, startDate, returnDate } = data;
  const defaultImage = './hotel.avif'; // Define default image path

  useEffect(() => {
    console.log("useEffect triggered, hotels:", hotels);

    const fetchHotelImages = async () => {
      const imageMap = {};

      await Promise.all(
        hotels.map(async (hotel) => {
          try {
            const res = await axios.post('http://localhost:5000/api/hotel-image', {
              name: hotel.name,
              city: destination
            });

            // Ensure the response contains a valid image URL
            if (res.data.image && typeof res.data.image === 'string') {
              imageMap[hotel.name] = res.data.image;
              console.log(`✅ Fetched image for ${hotel.name}: ${res.data.image}`);
            } else {
              throw new Error('Invalid image URL');
            }
          } catch (err) {
            console.error(`❌ Error fetching image for ${hotel.name}:`, err.message);
            imageMap[hotel.name] = defaultImage;
            console.log(`⚠️ Using fallback image for ${hotel.name}`);
          }
        })
      );

      console.log("✅ Final hotelImages map:", imageMap);
      setHotelImages(imageMap);
    };

    if (hotels.length) fetchHotelImages();
  }, [hotels]);

  // Handle client-side image loading errors
  const handleImageError = (hotelName) => {
    setHotelImages((prev) => ({
      ...prev,
      [hotelName]: defaultImage,
    }));
  };
  const toggleReadMore = (hotelName) => {
  setExpandedHotels((prev) => ({
    ...prev,
    [hotelName]: !prev[hotelName],
  }));
};


  return (
    <div className="mb-10 ml-7">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-10">
        Suggested Accommodations
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-7">
        {hotels.length > 0 ? (
          hotels.map((hotel, index) => (
            <Card
              key={index}
              className="p-0 flex flex-col overflow-hidden bg-[#1f1a2e] hover:shadow-xl transition-all"
            >
              <div className="w-full h-40">
                <img
                  src={hotelImages[hotel.name] || defaultImage}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(hotel.name)}
                />
              </div>
              <div className="p-5">
                <h3 className="text-white text-lg font-semibold mb-1">
                  {hotel.name}
                </h3>
                <p className="text-gray-400 text-sm mb-1">{hotel.hoteltype}</p>
                <p className="text-green-400 text-sm font-medium">
                  ₹{Math.round(parseFloat(hotel.price) * 87.68)}{' '}
                  <span className="text-gray-400">per night</span>
                </p>
              <p className="text-gray-300 text-sm mt-2">
  <span className="inline-block">
    📍 {expandedHotels[hotel.name] ? hotel.address : `${hotel.address.slice(0, 30)}`}
  </span>
  {hotel.address.length > 30 && (
    <button
      className="ml-1 text-teal-400 hover:underline text-xs"
      onClick={() => toggleReadMore(hotel.name)}
    >
      {expandedHotels[hotel.name] ? 'Show less' : 'Read more'}
    </button>
  )}
</p>


              </div>
            </Card>
          ))
        ) : (
          <p className="text-white ml-10">No hotel recommendations found.</p>
        )}
      </div>
    </div>
  );
}

export default SuggestedRecommendation;