import React from "react";
import { useLocation } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import Card from "../../components/utils/Card";
import axios from "axios";
function FullResponse() {
  const location = useLocation();
  const { trip } = location.state || {};
  const { id } = useParams();
  const [cityImage, setCityImage] = useState('');
    const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }); // Outputs "10 Aug"
  };
   const fstartDate = formatDate(trip?.startDate);
  const freturnDate = formatDate(trip?.returnDate);

  useEffect(() => {
    const fetchCityImage = async () => {
      try {
        const accessKey = 'NVjdai-Dk_oAYXw8IJdEjHl-YUO981OzO-jkAutoZ_o'; // Replace with your key

        const res = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: `${trip?.destination}`,
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

    if (trip?.destination) {
      fetchCityImage();
    }
  }, [trip?.destination]);


  return (
    <div className="min-h-screen bg-[#171221] text-white flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-[#2a233f]">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12">
        {/* ======== Trips Summary ======== */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-10 mb-10">
      {/* Left: Trip Info Box */}
      <div className="flex-[1.8] bg-[#1f1a2e] p-6 rounded-2xl shadow-md w-full md:w-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-green-300 mb-2">
          Trip to {trip?.destination}
        </h1>
        <p className="text-gray-400 mb-1">{`${fstartDate} - ${freturnDate}`}</p>
        <p className="text-gray-400 mb-1">{`${trip?.travelers} people`}</p>
        <p className="text-lg font-semibold text-green-400">₹{Math.round(trip?.totalfare)}</p>
      </div>

      {/* Right: City Image */}
      <div className="flex-1">
        <Card className="shadow-md ml-18">
          <img
            src={cityImage}
            alt={trip?.destination}
            className="h-45 w-full object-cover rounded-xl"
          />
        </Card>
      </div>
    </div>

      

        {/* ======== Train Recommendation ======== */}
     {/* ======== Train Recommendation ======== */}
<section className="p-6 rounded-2xl shadow-md mb-1 ml-7">
  <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6">
    Top Train Recommendations
  </h2>


  {(() => {
    // --- Helper to convert "09.25" to "09:25 AM" ---
    const formatRailwayTime = (timeStr) => {
      if (!timeStr) return "N/A";
      const [hours, minutes] = timeStr.split('.').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    // --- Helper to calculate duration, even across midnight ---
    const calculateDuration = (startStr, endStr) => {
      if (!startStr || !endStr) return "N/A";
      const [startH, startM] = startStr.split('.').map(Number);
      const [endH, endM] = endStr.split('.').map(Number);

      const start = new Date(0, 0, 0, startH, startM);
      let end = new Date(0, 0, 0, endH, endM);

      if (end <= start) {
        end.setDate(end.getDate() + 1); // handle overnight trains
      }

      const diffMs = end - start;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${diffHrs}h ${diffMins}m`;
    };

    const outboundTrains = [
      trip?.cheapestOutTrain,
      trip?.secondCheapestOutTrain
    ].filter(Boolean);

    const returnTrains = [
      trip?.cheapestReturnTrain,
      trip?.secondCheapestReturnTrain
    ].filter(Boolean);

    return (
      <>
        {/* 🚆 Outbound Trains */}
        <h3 className="text-xl font-semibold text-white mb-2">
          🚆 Outbound Trains (To Destination)
        </h3>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
            <thead className="bg-[#353045] text-white">
              <tr>
                <th className="px-6 py-3">Train Name</th>
                <th className="px-6 py-3">Departure & Arrival</th>
                <th className="px-6 py-3">Fare</th>
                <th className="px-6 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {outboundTrains.map((train, index) => (
                <tr key={index} className="border-t border-[#444056]">
                  <td className="px-6 py-4 text-green-400 font-medium">
                    {train?.train_base?.train_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {`${formatRailwayTime(train?.train_base?.from_time)} - ${formatRailwayTime(train?.train_base?.to_time)}`}
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    ₹{train?.fare?.fare?.totalFare?.general?.SL || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {calculateDuration(train?.train_base?.from_time, train?.train_base?.to_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🚆 Return Trains */}
        <h3 className="text-xl font-semibold text-white mb-2">
          🚆 Return Trains (Back to Source)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
            <thead className="bg-[#353045] text-white">
              <tr>
                <th className="px-6 py-3">Train Name</th>
                <th className="px-6 py-3">Departure & Arrival</th>
                <th className="px-6 py-3">Fare</th>
                <th className="px-6 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {returnTrains.map((train, index) => (
                <tr key={index} className="border-t border-[#444056]">
                  <td className="px-6 py-4 text-green-400 font-medium">
                    {train?.train_base?.train_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {`${formatRailwayTime(train?.train_base?.from_time)} - ${formatRailwayTime(train?.train_base?.to_time)}`}
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    ₹{train?.fare?.fare?.totalFare?.general?.SL || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {calculateDuration(train?.train_base?.from_time, train?.train_base?.to_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  })()}
</section>


        {/* ======== Suggested Hotels ======== */}
        {/* ======== Suggested Hotels ======== */}
<section className="mb-10 ml-7">
  <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-10">
    Suggested Accommodations
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-7">
    {trip?.hotels?.hotels?.length > 0 ? (
      trip.hotels.hotels.map((hotel, index) => {
        const defaultImage = "./hotel.avif";
        const [expanded, setExpanded] = React.useState(false);

        return (
          <div
            key={index}
            className="p-0 flex flex-col overflow-hidden bg-[#1f1a2e] hover:shadow-xl transition-all rounded-lg"
          >
            {/* Hotel Image */}
            <div className="w-full h-40">
              <img
                src={hotel.photoURL || "/hotel.avif"}
                alt={hotel.name}
                className="w-full h-full object-cover"
                // onError={(e) => (e.target.src = "/images/default-place.svg")}
              />
            </div>

            {/* Hotel Info */}
            <div className="p-5">
              <h3 className="text-white text-lg font-semibold mb-1">
                {hotel.name}
              </h3>
              <p className="text-gray-400 text-sm mb-1">{hotel.hoteltype}</p>
              <p className="text-green-400 text-sm font-medium">
                ₹{hotel.price ? Math.round(parseFloat(hotel.price) * 87.68) : "N/A"}{" "}
                <span className="text-gray-400">per night</span>
              </p>

              {/* Address with Read More */}
              <p className="text-gray-300 text-sm mt-2">
                <span className="inline-block">
                  📍 {expanded ? hotel.address : hotel.address?.slice(0, 30)}
                </span>
                {hotel.address?.length > 30 && (
                  <button
                    className="ml-1 text-teal-400 hover:underline text-xs"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </p>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-white ml-10">No hotel recommendations found.</p>
    )}
  </div>
</section>


        {/* ======== Places to Visit ======== */}
       {/* ======== Places to Visit ======== */}
<section className="mb-10 ml-13">
  <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-6">
    Nearby Places to Visit
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-1">
    {trip?.places?.places?.length > 0 ? (
      trip.places.places.map((place, index) => {
        return (
          <div
            key={index}
            className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2 rounded-lg"
          >
            <img
              src={place.photoURL || "/images/default-place.svg"}
              alt={place.name}
              className="mb-4 w-full h-36 object-cover rounded-md"
            />
            <h3 className="text-white text-lg font-semibold mb-1">{place.name}</h3>
            <p className="text-gray-400 text-sm">📍 {place.distance || "N/A"}</p>
          </div>
        );
      })
    ) : (
      <p className="text-gray-400 text-sm col-span-4">
        No places to visit found for this destination.
      </p>
    )}
  </div>
</section>


      </div>
    </div>
  );
}

export default FullResponse;
