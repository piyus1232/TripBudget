// src/pages/PlaceRoutePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { style } from "framer-motion/client";

function RouteSteps({ route }) {
  if (!route) return null;
  const mapsLink = useMemo(() => {
    if (!route.from || !route.to) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      route.from
    )}&destination=${encodeURIComponent(route.to)}&travelmode=transit`;
  }, [route.from, route.to]);
// Dark theme style JSON (Google official dark theme)


  return (
   
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-white font-semibold text-sm">
        {route.duration} · {route.distance}
        {route.fare && <span className="text-teal-300"> · Fare {route.fare}</span>}
      </div>
      <ul className="mt-3 space-y-2">
        {(route.steps || []).map((s, i) => (
          <li key={i} className="text-sm text-gray-200">
            {s.type === "WALK" ? (
              <>
                🚶 {s.instructions}{" "}
                {s.duration ? <span className="text-gray-400">({s.duration})</span> : null}
              </>
            ) : (
              <>
                {(s.vehicle || "").toLowerCase().includes("metro") ? "🚇" : "🚌"}{" "}
                <b>{s.route || s.line || "Transit"}</b>
                <div className="text-xs text-gray-400">
                  {s.from} → {s.to}
                  {typeof s.numStops === "number" ? ` · ${s.numStops} stops` : ""}
                  {s.departure ? ` · dep ${s.departure}` : ""}
                  {s.arrival ? ` · arr ${s.arrival}` : ""}
                  {s.agency ? ` · ${s.agency}` : ""}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {mapsLink && (
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-xs underline text-teal-300"
        >
          Open in Google Maps
        </a>
      )}
    </div>
  );
}

function HotelPickerModal({ open, hotels, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
      <div className="bg-[#1f1a2e] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-white text-lg font-semibold">Choose your hotel</h3>
        </div>
        <div className="max-h-[60vh] overflow-auto divide-y divide-white/5">
          {hotels.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="w-full text-left px-5 py-3 hover:bg-white/5"
            >
              <div className="text-white font-medium">{h.name}</div>
              {h.area ? <div className="text-xs text-gray-400">{h.area}</div> : null}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlaceRoutePage() {
  const { placeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const placeFromState = location.state?.place || null;
  const destination = location.state?.destination || "";
  const hotels =
    location.state?.hotels ||
    location.state?.data?.hotels?.hotels ||
    [];
  const [hotel, setHotel] = useState(location.state?.hotel || null);

  const [mode, setMode] = useState("transit");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(!hotel);

  const placeName = placeFromState?.name || decodeURIComponent(placeId);

  // Google Maps loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBeHk-GWW25JdXShUzUSvc4bFF3EtFIRyg",
    libraries: ["places"],
  });
  const [directions, setDirections] = useState(null);
  const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

  // Fetch route from backend
  useEffect(() => {
    const fetchRoute = async () => {
      if (!hotel || !placeName) return;
      setLoading(true);
      try {
        const body = { hotel: hotel.name, place: placeName, city: destination, mode };
        const { data } = await axios.post(
          "http://localhost:5000/api/v2/transport",
          body,
          { withCredentials: true }
        );
        setRoute(data);

        // Call Google Maps DirectionsService when route is available
        if (isLoaded && data?.from && data?.to) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: data.from,
              destination: data.to,
              travelMode: mode.toUpperCase(),
            },
            (result, status) => {
              if (status === "OK" && result) {
                setDirections(result);
              } else {
                console.error("Directions request failed:", status);
              }
            }
          );
        }
      } catch (e) {
        setRoute({ error: e?.response?.data?.error || "Failed to fetch transport" });
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [hotel, placeName, mode, isLoaded]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#171221] to-[#171221] text-white flex flex-col">
      {/* Header */}
      <div className="w-full px-8 py-7 border-b border-white/10 flex items-center justify-between">
        <button
          className="text-sm text-gray-300 hover:text-white transition"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold ">
          Routes to {placeName}
          {destination ? <span className="text-gray-400">, {destination}</span> : null}
        </h1>
      </div>

      {/* Controls */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">From:</span>
          <button
            className="px-3 py-1 rounded-lg bg-teal-600 text-white hover:bg-teal-500 text-sm"
            onClick={() => setPickerOpen(true)}
          >
            {hotel ? hotel.name : "Choose hotel"}
          </button>
        </div>

        <div className="ml-auto flex gap-2">
          {["transit"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                mode === m
                  ? "bg-teal-600 text-white"
                  : "bg-white/10 text-gray-200 hover:bg-white/20"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Route Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {loading && <div className="text-sm text-gray-300">Fetching routes…</div>}
        {route?.error && <div className="text-sm text-red-300">Error: {route.error}</div>}
        {!loading && !route?.error && route && <RouteSteps route={route} />}

        {/* Auto Map */}
        {isLoaded && (
          <div className="h-[400px] w-full rounded-xl overflow-hidden">
            <GoogleMap
              mapContainerStyle={{ width: "97%", height: "83%" }}
              center={{ lat: 28.6139, lng: 77.209 }} // fallback center
              zoom={13}
                options={{
    styles: darkMapStyle, // 👈 enable dark theme
    disableDefaultUI: false,
  }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        )}
      </div>

      {/* Hotel Picker Modal */}
      <HotelPickerModal
        open={pickerOpen}
        hotels={hotels}
        onClose={() => setPickerOpen(false)}
        onSelect={(h) => {
          setHotel(h);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
