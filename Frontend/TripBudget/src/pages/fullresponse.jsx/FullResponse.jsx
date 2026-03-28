import React from "react";
import { useLocation } from "react-router-dom";
import SideBar from "../../components/SideBar/SideBar";
import { useParams,useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import Card from "../../components/utils/Card";
import axios from "axios";
import { getUnsplashAccessKey, CITY_HERO_FALLBACK_IMAGE } from "../../conf/api.js";
import { HotelPickerModal } from "../formresponse/PlacestoVisit";

/** HTTPS so it always loads; ./hotel.avif breaks on routes like /full-trip/:id */
const SAVED_HOTEL_FALLBACK =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
const SAVED_PLACE_FALLBACK =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";

function FullResponse() {
  const location = useLocation();
  const { trip } = location.state || {};
  const { id } = useParams();
  const [cityImage, setCityImage] = useState(CITY_HERO_FALLBACK_IMAGE);
  const navigate = useNavigate();

  const hotelsList = trip?.hotels?.hotels || [];
  const destinationName = trip?.destination || "";
  const [activeHotel, setActiveHotel] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);

  useEffect(() => {
    setActiveHotel(hotelsList[0] || null);
    setPendingPlace(null);
    setPickerOpen(false);
  }, [trip?._id]);

  const goPlaceRoutes = (place, hotel) => {
    navigate(`/place/${encodeURIComponent(place.placeid || place.name)}`, {
      state: {
        place,
        destination: destinationName,
        hotel,
        hotels: hotelsList,
      },
    });
  };

  const onGetRoutes = (place) => {
    if (!hotelsList.length) return;
    if (!activeHotel) {
      setPendingPlace(place);
      setPickerOpen(true);
      return;
    }
    goPlaceRoutes(place, activeHotel);
  };

  const onSelectHotel = (hotel) => {
    setActiveHotel(hotel);
    setPickerOpen(false);
    if (pendingPlace) {
      const p = pendingPlace;
      setPendingPlace(null);
      goPlaceRoutes(p, hotel);
    }
  };
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
      const accessKey = getUnsplashAccessKey();
      if (!accessKey) {
        setCityImage(CITY_HERO_FALLBACK_IMAGE);
        return;
      }
      try {
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
        setCityImage(imageUrl || CITY_HERO_FALLBACK_IMAGE);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Error fetching city image:", error);
        }
        setCityImage(CITY_HERO_FALLBACK_IMAGE);
      }
    };

    if (trip?.destination) {
      fetchCityImage();
    }
  }, [trip?.destination]);


  return (
    <div className="min-h-screen bg-[#171221] text-white flex flex-col sm:flex-row w-full max-w-[100vw] min-w-0">
      <SideBar />

      <div className="flex-1 min-w-0 overflow-y-auto pt-14 sm:pt-0 ml-0 sm:ml-[280px] md:ml-[300px] px-4 sm:px-6 py-6 space-y-12">
        {/* ======== Trips Summary ======== */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-0 sm:ml-4 md:ml-10 mb-10">
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
        <Card className="shadow-md ml-0 sm:ml-4 md:ml-8">
          <img
            src={cityImage}
            alt={trip?.destination}
            className="h-45 w-full object-cover rounded-xl"
            onError={(e) => {
              e.currentTarget.src = CITY_HERO_FALLBACK_IMAGE;
            }}
          />
        </Card>
      </div>
    </div>

      

        {/* ======== Train Recommendation ======== */}
     {/* ======== Train Recommendation ======== */}
<section className="p-4 sm:p-6 rounded-2xl shadow-md mb-1 ml-0 sm:ml-3 md:ml-7">
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
<section className="mb-10 ml-0 sm:ml-3 md:ml-7">
  <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-0 sm:ml-4 md:ml-10">
    Suggested Accommodations
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-0 sm:ml-3 md:ml-7">
    {trip?.hotels?.hotels?.length > 0 ? (
      trip.hotels.hotels.map((hotel, index) => {
        const [expanded, setExpanded] = React.useState(false);
        const hotelSrc =
          hotel.photoURL &&
          String(hotel.photoURL).startsWith("http") &&
          !String(hotel.photoURL).includes("/place/photo")
            ? hotel.photoURL
            : SAVED_HOTEL_FALLBACK;

        return (
          <div
            key={index}
            className="p-0 flex flex-col overflow-hidden bg-[#1f1a2e] hover:shadow-xl transition-all rounded-lg"
          >
            {/* Hotel Image — Google Place URLs often 403 after save; onError → stock */}
            <div className="w-full h-40 bg-[#252038]">
              <img
                src={hotelSrc}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = SAVED_HOTEL_FALLBACK;
                }}
              />
            </div>

            {/* Hotel Info */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-white text-lg font-semibold mb-1">
                {hotel.name}
              </h3>
              <p className="text-gray-400 text-sm mb-1">{hotel.hoteltype}</p>
              <p className="text-green-400 text-sm font-medium">
                ₹{hotel.price ? Math.round(parseFloat(hotel.price) * 87.68) : "N/A"}{" "}
                <span className="text-gray-400">per night</span>
              </p>

              {/* Address with Read More */}
              <p className="text-gray-300 text-sm mt-2 mb-4">
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

              {/* ✅ New Button */}
              <button
                className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 
                           text-white font-semibold rounded-xl shadow-md 
                           hover:shadow-xl hover:scale-105 transition-all text-xs"
                onClick={() =>
                  navigate(`/hotelsavedfood/${hotel.id}`, {
                    state: { hotel },
                  })
                }
              >
                View Hotel & Nearby Food
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-white ml-0 sm:ml-4 md:ml-10">No hotel recommendations found.</p>
    )}
  </div>
</section>



        {/* ======== Places to Visit (same map / routes as plan generation) ======== */}
<section className="mb-10 ml-0 sm:ml-4 md:ml-10">
  <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-3 md:ml-6 mb-2">
    <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3">
      Nearby Places to Visit
    </h2>
    {hotelsList.length > 0 ? (
      activeHotel ? (
        <button
          type="button"
          className="ml-2 text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-200 hover:bg-white/15"
          onClick={() => setPickerOpen(true)}
          title="Change origin hotel"
        >
          From: {activeHotel.name}
        </button>
      ) : (
        <button
          type="button"
          className="ml-2 text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-200 hover:bg-white/15"
          onClick={() => setPickerOpen(true)}
        >
          Choose hotel
        </button>
      )
    ) : null}
  </div>
  <p className="text-gray-500 text-xs ml-0 sm:ml-3 md:ml-6 mb-3">
    Open a place for hotel → place distance, steps, and map (same as when you first planned).
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-1">
    {trip?.places?.places?.length > 0 ? (
      trip.places.places.map((place, index) => {
        return (
          <div
            key={`saved-place-${index}-${place.placeid || place.name || "x"}`}
            className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2 rounded-lg"
          >
            <img
              src={
                place.photoURL && String(place.photoURL).startsWith("http")
                  ? place.photoURL
                  : SAVED_PLACE_FALLBACK
              }
              alt={place.name}
              className="mb-4 w-full h-36 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = SAVED_PLACE_FALLBACK;
              }}
            />
            <h3 className="text-white text-lg font-semibold mb-1">{place.name}</h3>
            <p className="text-gray-400 text-sm">📍 {place.distance || "N/A"}</p>
            {hotelsList.length > 0 ? (
              <button
                type="button"
                onClick={() => onGetRoutes(place)}
                className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:scale-[1.02] transition"
              >
                {activeHotel ? `Routes from ${activeHotel.name}` : "View routes & map"}
              </button>
            ) : (
              <p className="mt-3 text-xs text-gray-500">No saved hotels — routes need a starting hotel.</p>
            )}
          </div>
        );
      })
    ) : (
      <p className="text-gray-400 text-sm col-span-4">
        No places to visit found for this destination.
      </p>
    )}
  </div>

  <HotelPickerModal
    open={pickerOpen}
    hotels={hotelsList}
    onClose={() => {
      setPickerOpen(false);
      setPendingPlace(null);
    }}
    onSelect={onSelectHotel}
  />
</section>


      </div>
    </div>
  );
}

export default FullResponse;
