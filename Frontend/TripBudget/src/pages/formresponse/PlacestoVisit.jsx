import React, { useEffect, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const defaultImage = '/images/default-place.svg';

function PlacestoVisit() {
    const location = useLocation();
 const { data } = location.state || {};
const {destination} = data;
  const places = data?.places?.places || [];

  const [placeImages, setPlaceImages] = useState({});

  useEffect(() => {
    console.log("useEffect triggered, places:", places);

    const fetchPlaceImages = async () => {
      const imageMap = {};

      await Promise.all(
        places.map(async (place) => {
          const queryKey = place.name.trim().toLowerCase();

          try {
            const res = await axios.post('http://localhost:5000/api/place-image', {
              name: place.name,
                  placeid:place.placeid,
              city: destination
            });

            if (res.data.image && typeof res.data.image === 'string') {
              imageMap[queryKey] = res.data.image;
              console.log(`✅ Fetched image for ${place.name}: ${res.data.image}`);
            } else {
              throw new Error('Invalid image URL');
            }
          } catch (err) {
            console.error(`❌ Error fetching image for ${place.name}:`, err.message);
            imageMap[queryKey] = defaultImage;
            console.log(`⚠️ Using fallback image for ${place.name}`);
          }
        })
      );

      console.log("✅ Final placeImages map:", imageMap);
      setPlaceImages(imageMap);
    };

    if (places.length) fetchPlaceImages();
  }, [places, destination]);

  return (
    <div className="mb-10 ml-13">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-6">
        Nearby Places to Visit
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-1">
        {places.length > 0 ? (
          places.map((place, index) => {
            const queryKey = place.name.trim().toLowerCase();
            return (
              <Card
                key={index}
                className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2"
              >
                <img
                  src={placeImages[queryKey] || defaultImage}
                  alt={place.name}
                  className="mb-4 w-full h-36 object-cover rounded-md"
                />
                <h3 className="text-white text-lg font-semibold mb-1">{place.name}</h3>
                <p className="text-gray-400 text-sm">📍 {place.distance}</p>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm col-span-4">
            No places to visit found for this destination.
          </p>
        )}
      </div>
    </div>
  );
}

export default PlacestoVisit;
