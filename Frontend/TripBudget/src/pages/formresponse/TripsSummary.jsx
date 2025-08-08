import React, { useEffect, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function TripsSummary() {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }); // Outputs "10 Aug"
  };

  const location = useLocation();
  const { data } = location.state || {};
  const { source, destination, startDate, returnDate,totalfare,travelers } = data;
  const fstartDate = formatDate(startDate);
  const freturnDate = formatDate(returnDate);

  const [cityImage, setCityImage] = useState('');

  // ✅ Fetch image using Unsplash API
  useEffect(() => {
    const fetchCityImage = async () => {
      try {
        const accessKey = 'NVjdai-Dk_oAYXw8IJdEjHl-YUO981OzO-jkAutoZ_o'; // Replace with your key

        const res = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: `  ${destination}`,
            per_page: 1,
            orientation: 'landscape',
          },
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        });

        const imageUrl = res.data.results[0]?.urls?.regular;
        setCityImage(imageUrl || '/fallback.jpg'); // fallback if not found
      } catch (error) {
        console.error("Error fetching city image:", error);
        setCityImage('/fallback.jpg'); // fallback image on error
      }
    };

    if (destination) {
      fetchCityImage();
    }
  }, [destination]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-10 mb-10">
      {/* Left: Trip Info Box */}
      <div className="flex-[1.8] bg-[#1f1a2e] p-6 rounded-2xl shadow-md w-full md:w-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-green-300 mb-2">
          Trip to {destination}
        </h1>
        <p className="text-gray-400 mb-1">{`${fstartDate} - ${freturnDate}`}</p>
                <p className="text-gray-400 mb-1">{` ${travelers} people`}</p>
        <p className="text-lg font-semibold text-green-400">₹{Math.round(totalfare)}</p>
      </div>

      {/* Right: City Image from Unsplash */}
      <div className="flex-1">
        <Card className="shadow-md ml-18">
          <img
            src={cityImage}
            alt={destination}
            className="h-45 w-full object-cover rounded-xl"
          />
        </Card>
      </div>
    </div>
  );
}

export default TripsSummary;
