import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCached, setCached, preload } from "../../components/utils/imageCache.js";


const defaultImage = '/images/default-place.svg';

/* ---------- UI: Hotel Picker Modal ---------- */
function HotelPickerModal({ open, hotels, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1f1a2e] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-white text-lg font-semibold">Choose your hotel</h3>
          <p className="text-gray-400 text-xs mt-1">We’ll use this as your starting point.</p>
        </div>
        <div className="max-h-[60vh] overflow-auto divide-y divide-white/5">
          {hotels.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="w-full text-left px-5 py-3 hover:bg-white/5 transition flex flex-col"
            >
              <span className="text-white font-medium">{h.name}</span>
              {h.area ? <span className="text-xs text-gray-400">{h.area}</span> : null}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="text-sm text-gray-300 hover:text-white transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PlacestoVisit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};
  const destination = data?.destination;
  const places = data?.places?.places || [];
  const hotels = data?.hotels?.hotels || [];

  const [placeImages, setPlaceImages] = useState({});
  const [activeHotel, setActiveHotel] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);

 useEffect(() => {
  if (!places.length) return;

  (async () => {
    const updates = {};

    await Promise.all(
      places.map(async (place) => {
        const key = `${destination}:${place.placeid || place.name.trim().toLowerCase()}`;

        // ⬇️ If already cached, use it
        const cached = getCached("place", key);
        if (cached) {
          updates[place.name.trim().toLowerCase()] = cached;
          return;
        }

        try {
          const res = await axios.post(
            "http://localhost:5000/api/place-image",
            { name: place.name, placeid: place.placeid, city: destination },
            { withCredentials: true }
          );

          const url = res.data?.image && typeof res.data.image === "string"
            ? res.data.image
            : defaultImage;

          // save to cache + preload
          setCached("place", key, url);
          preload(url);
          updates[place.name.trim().toLowerCase()] = url;
        } catch {
          updates[place.name.trim().toLowerCase()] = defaultImage;
        }
      })
    );

    if (Object.keys(updates).length) {
      setPlaceImages((prev) => ({ ...prev, ...updates }));
    }
  })();
}, [places, destination]);


  const onGetRoutes = (place) => {
    if (!activeHotel) {
      setPendingPlace(place);
      setPickerOpen(true);
      return;
    }
    // go to detail page with everything needed
    navigate(`/place/${encodeURIComponent(place.placeid || place.name)}`, {
      state: {
        place,
        destination,
        hotel: activeHotel,
        hotels, // so the detail page can reopen picker/change hotel
      },
    });
  };

  const onSelectHotel = (hotel) => {
    setActiveHotel(hotel);
    setPickerOpen(false);
    if (pendingPlace) {
      const p = pendingPlace;
      setPendingPlace(null);
      navigate(`/place/${encodeURIComponent(p.placeid || p.name)}`, {
        state: { place: p, destination, hotel, hotels },
      });
    }
  };

  return (
    <div className="mb-10 ml-13">
      <div className="flex items-center gap-3 ml-6 mb-2">
        <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3">
          Nearby Places to Visit
        </h2>

        {activeHotel ? (
          <button
            className="ml-2 text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-200 hover:bg-white/15"
            onClick={() => setPickerOpen(true)}
            title="Change origin hotel"
          >
            From: {activeHotel.name}
          </button>
        ) : (
          <button
            className="ml-2 text-xs px-2 py-1 rounded-lg bg-white/10 text-gray-200 hover:bg-white/15"
            onClick={() => setPickerOpen(true)}
          >
            Choose Hotel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-1">
        {places.length ? (
          places.map((place, index) => {
            const queryKey = place.name.trim().toLowerCase();
            return (
              <Card key={index} className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2">
                <img
                  src={placeImages[queryKey] || defaultImage}
                  alt={place.name}
                  className="mb-4 w-full h-36 object-cover rounded-md"
                />
                <h3 className="text-white text-lg font-semibold mb-1">{place.name}</h3>
                <p className="text-gray-400 text-sm">📍 {place.distance}</p>

                <button
                  onClick={() => onGetRoutes(place)}
                  className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 
                             text-white text-sm font-medium rounded-lg hover:scale-[1.02] transition"
                >
                  {activeHotel ? `View routes from ${activeHotel.name}` : 'View routes'}
                </button>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm col-span-4">No places to visit found for this destination.</p>
        )}
      </div>

      {/* Hotel picker */}
      <HotelPickerModal
        open={pickerOpen}
        hotels={hotels}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelectHotel}
      />
    </div>
  );
}

export default PlacestoVisit;
