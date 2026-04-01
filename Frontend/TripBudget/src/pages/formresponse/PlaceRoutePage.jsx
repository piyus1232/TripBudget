import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../conf/api.js";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapViewportUpdater({ center, path }) {
  const map = useMap();
  useEffect(() => {
    if (Array.isArray(path) && path.length > 1) {
      map.fitBounds(path, { padding: [30, 30] });
      return;
    }
    if (Array.isArray(center) && center.length === 2) {
      map.setView(center, 12);
    }
  }, [map, center, path]);
  return null;
}

function RouteSteps({ route }) {
  if (!route) return null;
  const mapsLink = useMemo(() => {
    if (!route.from || !route.to) return null;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      route.from
    )}&destination=${encodeURIComponent(route.to)}&travelmode=transit`;
  }, [route.from, route.to]);

  return (
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="text-white font-semibold text-sm">
        {route.duration} · {route.distance}
        {route.fare && <span className="text-teal-300"> · Fare {route.fare}</span>}
      </div>
      <ul className="mt-3 space-y-2">
        {(route.steps || []).map((s, i) => (
          <li key={i} className="text-sm text-gray-200">
            {String(s.type).toUpperCase() === "WALK" ||
            String(s.type).toUpperCase() === "WALKING" ? (
              <>
                🚶 {s.instructions}{" "}
                {s.duration ? <span className="text-gray-400">({s.duration})</span> : null}
              </>
            ) : String(s.type).toUpperCase() === "DRIVING" ? (
              <>
                🚗 {s.instructions || "Drive"}
                {s.duration ? <span className="text-gray-400"> ({s.duration})</span> : null}
                {s.distance ? <span className="text-gray-400"> · {s.distance}</span> : null}
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
          <button onClick={onClose} className="text-sm text-gray-300 hover:text-white">
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
  const hotels = location.state?.hotels || location.state?.data?.hotels?.hotels || [];
  const [hotel, setHotel] = useState(location.state?.hotel || null);
  const [mode, setMode] = useState("transit");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(!hotel);
  const [mapRoute, setMapRoute] = useState([]);
  const [mapFrom, setMapFrom] = useState(null);
  const [mapTo, setMapTo] = useState(null);
  const [mapSummary, setMapSummary] = useState(null);

  const placeName = placeFromState?.name || decodeURIComponent(placeId);
  const fallbackCenter = useMemo(() => [28.6139, 77.209], []);
  const mapCenter = useMemo(() => mapFrom || mapTo || fallbackCenter, [mapFrom, mapTo, fallbackCenter]);

  const geocodeAddress = async (address) => {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: address, format: "json", limit: 1 },
      headers: { "Accept-Language": "en", "User-Agent": "TripBudget/1.0" },
      timeout: 10000,
    });
    if (!Array.isArray(data) || !data[0]) return null;
    return [Number(data[0].lat), Number(data[0].lon)];
  };

  const getHotelCoords = (h) => {
    if (!h) return null;
    const lat = Number(
      h.latitude ?? h.lat ?? h.location?.latitude ?? h.location?.lat
    );
    const lng = Number(
      h.longitude ?? h.lng ?? h.location?.longitude ?? h.location?.lng
    );
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  };

  const getPlaceCoords = (p) => {
    if (!p) return null;
    const lat = Number(p?.location?.lat ?? p?.lat);
    const lng = Number(p?.location?.lng ?? p?.location?.lon ?? p?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  };

  const loadMapRoute = async (fromLabel, toLabel, preferredFrom, preferredTo) => {
    try {
      const [geoFrom, geoTo] = await Promise.all([
        preferredFrom ? Promise.resolve(preferredFrom) : geocodeAddress(fromLabel),
        preferredTo ? Promise.resolve(preferredTo) : geocodeAddress(toLabel),
      ]);
      const fromCoords = preferredFrom || geoFrom;
      const toCoords = preferredTo || geoTo;
      setMapFrom(fromCoords);
      setMapTo(toCoords);
      if (!fromCoords || !toCoords) {
        setMapRoute([]);
        return;
      }
      const [fromLat, fromLng] = fromCoords;
      const [toLat, toLng] = toCoords;
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}`,
        { params: { overview: "full", geometries: "geojson", steps: true }, timeout: 10000 }
      );
      const coordinates = data?.routes?.[0]?.geometry?.coordinates || [];
      setMapRoute(coordinates.map(([lng, lat]) => [lat, lng]));
      const leg = data?.routes?.[0]?.legs?.[0];
      if (leg) {
        const toKm = (m) => `${(Number(m || 0) / 1000).toFixed(1)} km`;
        const toMin = (s) => `${Math.max(1, Math.round(Number(s || 0) / 60))} mins`;
        setMapSummary({
          distance: toKm(leg.distance),
          duration: toMin(leg.duration),
          steps: (leg.steps || []).slice(0, 20).map((s) => ({
            type: "DRIVING",
            distance: toKm(s.distance),
            duration: toMin(s.duration),
            instructions:
              `${s.maneuver?.type || "Continue"} ${
                s.maneuver?.modifier ? `(${s.maneuver.modifier})` : ""
              } on ${s.name || "road"}`.trim(),
          })),
        });
      } else {
        setMapSummary(null);
      }
    } catch (err) {
      console.warn("Leaflet route draw failed:", err?.message || err);
      setMapRoute([]);
      setMapSummary(null);
    }
  };

  useEffect(() => {
    const fetchRoute = async () => {
      if (!hotel || !placeName) return;
      setLoading(true);
      try {
        let preciseFrom = getHotelCoords(hotel);
        if (!preciseFrom && hotel?.name && destination) {
          const q = [hotel.name, hotel.address, destination].filter(Boolean).join(", ");
          preciseFrom = await geocodeAddress(q);
        }
        const preciseTo = getPlaceCoords(placeFromState);

        const body = {
          hotel: hotel.name,
          place: placeName,
          city: destination,
          mode,
          hotelLat: preciseFrom?.[0],
          hotelLng: preciseFrom?.[1],
          placeLat: preciseTo?.[0],
          placeLng: preciseTo?.[1],
        };
        const { data } = await axios.post(apiUrl("/api/v2/transport"), body, {
          withCredentials: true,
        });
        setRoute(data);
        if (data?.from && data?.to) {
          loadMapRoute(data.from, data.to, preciseFrom, preciseTo);
        } else {
          setMapRoute([]);
          setMapFrom(null);
          setMapTo(null);
          setMapSummary(null);
        }
      } catch (e) {
        setRoute({ error: e?.response?.data?.error || "Failed to fetch transport" });
        setMapRoute([]);
        setMapFrom(null);
        setMapTo(null);
        setMapSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [hotel, placeName, mode, destination, placeFromState?.placeid]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#171221] to-[#171221] text-white flex flex-col">
      <div className="w-full px-8 py-7 border-b border-white/10 flex items-center justify-between">
        <button className="text-sm text-gray-300 hover:text-white transition" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="text-xl font-semibold ">
          Routes to {placeName}
          {destination ? <span className="text-gray-400">, {destination}</span> : null}
        </h1>
      </div>

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
                mode === m ? "bg-teal-600 text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {loading && <div className="text-sm text-gray-300">Fetching routes…</div>}
        {route?.error && <div className="text-sm text-red-300">Error: {route.error}</div>}
        {!loading && !route?.error && route && (
          <RouteSteps
            route={
              mapSummary
                ? {
                    ...route,
                    distance: mapSummary.distance,
                    duration: mapSummary.duration,
                    steps: mapSummary.steps,
                  }
                : route
            }
          />
        )}

        <div className="h-[420px] w-full rounded-xl overflow-hidden border border-white/10">
          <MapContainer center={mapCenter} zoom={12} style={{ width: "100%", height: "100%" }}>
            <MapViewportUpdater center={mapCenter} path={mapRoute} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapFrom && (
              <Marker position={mapFrom}>
                <Popup>From hotel</Popup>
              </Marker>
            )}
            {mapTo && (
              <Marker position={mapTo}>
                <Popup>Destination</Popup>
              </Marker>
            )}
            {mapRoute.length > 1 && <Polyline positions={mapRoute} pathOptions={{ color: "#14b8a6", weight: 5 }} />}
          </MapContainer>
        </div>
      </div>

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