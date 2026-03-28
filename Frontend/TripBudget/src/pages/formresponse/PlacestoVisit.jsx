import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../../components/utils/Card';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../conf/api.js';
import { getCached, setCached, preload } from '../../components/utils/imageCache.js';

/** Always loads — never triggers onError loops */
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect fill="#252038" width="400" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="12" font-family="system-ui">Loading…</text></svg>'
  );

/** Only if batch fails entirely */
const STOCK_LANDSCAPE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80';

export function HotelPickerModal({ open, hotels, onClose, onSelect }) {
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

  const stablePlacesKey = useMemo(
    () =>
      `${destination || ''}|${places
        .map((p) => `${p.placeid || ''}:${(p.name || '').trim()}`)
        .join(';')}`,
    [destination, places]
  );

  const rowKey = (place) =>
    String(place.placeid || (place.name || '').trim().toLowerCase());

  const [placeImages, setPlaceImages] = useState({});
  const [activeHotel, setActiveHotel] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);

  /** Only set after batch succeeds — avoids Strict Mode “cancelled before setState” forever */
  const doneRef = useRef(null);

  useEffect(() => {
    if (!places.length || !destination) return;
    if (doneRef.current === stablePlacesKey) return;

    let cancelled = false;

    const run = async () => {
      const updates = {};
      for (const p of places) {
        const id = rowKey(p);
        const cacheKey = `${destination}:${p.placeid || id}`;
        const cached = getCached('place', cacheKey);
        if (cached && cached.startsWith('http')) {
          updates[id] = cached;
          continue;
        }
      }

      const allCached = places.every((p) => {
        const id = rowKey(p);
        return Boolean(updates[id]);
      });
      if (allCached) {
        if (!cancelled) {
          setPlaceImages(updates);
          doneRef.current = stablePlacesKey;
        }
        return;
      }

      try {
        const res = await axios.post(
          apiUrl('/api/places-images-batch'),
          {
            city: destination,
            places: places.map((p) => ({
              name: p.name,
              placeid: p.placeid,
              lat: p.location?.lat,
              lng: p.location?.lng,
            })),
          },
          { withCredentials: true }
        );

        if (cancelled) return;

        const map = res.data?.images || {};
        for (const p of places) {
          const id = rowKey(p);
          if (updates[id]) continue;
          const url = map[id] || map[p.placeid] || map[String(p.placeid)];
          const final =
            url && String(url).startsWith('http') ? url : STOCK_LANDSCAPE;
          /* backend now always sends http (wiki or per-place fallback) */
          updates[id] = final;
          setCached('place', `${destination}:${p.placeid || id}`, final);
          preload(final);
        }
      } catch {
        if (cancelled) return;
        for (const p of places) {
          const id = rowKey(p);
          if (!updates[id]) updates[id] = STOCK_LANDSCAPE;
        }
      }

      if (cancelled) return;
      setPlaceImages(updates);
      doneRef.current = stablePlacesKey;
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [stablePlacesKey, destination, places]);

  const onGetRoutes = (place) => {
    if (!activeHotel) {
      setPendingPlace(place);
      setPickerOpen(true);
      return;
    }
    navigate(`/place/${encodeURIComponent(place.placeid || place.name)}`, {
      state: {
        place,
        destination,
        hotel: activeHotel,
        hotels,
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
    <div className="mb-10 ml-0 sm:ml-4 md:ml-10">
      <div className="flex flex-wrap items-center gap-3 ml-0 sm:ml-3 md:ml-6 mb-2">
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
      <p className="text-gray-500 text-xs ml-6 mb-3">
        Photos from Wikipedia when available; otherwise a stock scene.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-1">
        {places.length ? (
          places.map((place, index) => {
            const id = rowKey(place);
            const src = placeImages[id] || PLACEHOLDER;
            return (
              <Card
                key={`place-${index}-${id}`}
                className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2"
              >
                <div className="mb-4 w-full h-36 rounded-md overflow-hidden bg-[#252038]">
                  <img
                    src={src}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = STOCK_LANDSCAPE;
                    }}
                  />
                </div>
                <h3 className="text-white text-lg font-semibold mb-1">{place.name}</h3>
                <p className="text-gray-400 text-sm">📍 {place.distance}</p>
                <button
                  onClick={() => onGetRoutes(place)}
                  className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:scale-[1.02] transition"
                >
                  {activeHotel ? `View routes from ${activeHotel.name}` : 'View routes'}
                </button>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm col-span-4">No places to visit found.</p>
        )}
      </div>
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
