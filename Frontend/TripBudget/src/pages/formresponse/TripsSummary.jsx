import React, { useEffect, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  getUnsplashAccessKey,
  CITY_HERO_FALLBACK_IMAGE,
} from '../../conf/api.js';

function TripsSummary({ planData }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }); // Outputs "10 Aug"
  };

  const location = useLocation();
  const navigate = useNavigate();
  const data = planData ?? location.state?.data;

  if (!data) {
    return (
      <div className="ml-0 sm:ml-4 md:ml-10 mb-10 rounded-2xl bg-[#1f1a2e] border border-white/10 p-6 max-w-lg">
        <p className="text-gray-300 mb-4">No trip plan loaded. This page needs data from &quot;Plan my trip&quot; (or refresh cleared it).</p>
        <button
          type="button"
          onClick={() => navigate('/plantrip')}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500"
        >
          Plan a trip
        </button>
      </div>
    );
  }

  const { destination, startDate, returnDate, totalfare, travelers, farePending } = data;
  const fstartDate = formatDate(startDate);
  const freturnDate = formatDate(returnDate);

  const [cityImage, setCityImage] = useState(CITY_HERO_FALLBACK_IMAGE);

  useEffect(() => {
    const fetchCityImage = async () => {
      const accessKey = getUnsplashAccessKey();
      if (!accessKey) {
        setCityImage(CITY_HERO_FALLBACK_IMAGE);
        return;
      }
      try {
        const res = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: `${destination}`.trim(),
            per_page: 1,
            orientation: 'landscape',
          },
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        });

        const imageUrl = res.data.results[0]?.urls?.regular;
        setCityImage(imageUrl || CITY_HERO_FALLBACK_IMAGE);
      } catch (error) {
        // 401 = wrong/missing Unsplash Access Key (use "Access Key" from dashboard, not Secret)
        if (error.response?.status !== 401) {
          console.error('Error fetching city image:', error);
        }
        setCityImage(CITY_HERO_FALLBACK_IMAGE);
      }
    };

    if (destination) {
      fetchCityImage();
    }
  }, [destination]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-0 sm:ml-4 md:ml-10 mb-10">
      {/* Left: Trip Info Box */}
      <div className="flex-[1.8] bg-[#1f1a2e] p-6 rounded-2xl shadow-md w-full md:w-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-green-300 mb-2">
          Trip to {destination}
        </h1>
        <p className="text-gray-400 mb-1">{`${fstartDate} - ${freturnDate}`}</p>
                <p className="text-gray-400 mb-1">{` ${travelers} people`}</p>
        <p className="text-lg font-semibold text-green-400">₹{Math.round(totalfare)}</p>
        {farePending ? (
          <p className="text-xs text-amber-400/90 mt-1">Estimate — train fares still loading</p>
        ) : null}
      </div>

      {/* Right: City Image from Unsplash */}
      <div className="flex-1">
        <Card className="shadow-md ml-0 sm:ml-4 md:ml-8">
          <img
            src={cityImage}
            alt={destination}
            className="h-45 w-full object-cover rounded-xl"
            onError={(e) => {
              e.currentTarget.src = CITY_HERO_FALLBACK_IMAGE;
            }}
          />
        </Card>
      </div>
    </div>
  );
}

export default TripsSummary;
