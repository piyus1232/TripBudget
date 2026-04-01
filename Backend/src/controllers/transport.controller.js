import fetch from "node-fetch";
import { googlePlacesRapidApiKey } from "../utils/googlePlacesRapidApiKey.js";

async function geocodeNominatim(queries) {
  const queryList = Array.isArray(queries) ? queries : [queries];
  for (const q of queryList) {
    if (!q || !String(q).trim()) continue;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      String(q).trim()
    )}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TripBudget/1.0 (transport fallback)" },
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
        label: data[0].display_name || String(q),
      };
    }
  }
  return null;
}

function toCoord(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { lat: a, lon: b };
}

async function osrmFallbackRoute(origin, destination, hotel, place, city, fromCoord, toCoordHint) {
  const cityOnly = city ? `${city}` : "";
  const placeOnly = place ? `${place}, ${city}` : destination;
  const hotelOnly = hotel ? `${hotel}, ${city}` : origin;
  const trimmedHotel = hotel ? hotel.split(",")[0].trim() : "";
  const trimmedPlace = place ? place.split(",")[0].trim() : "";

  const [fromGeo, toGeo] = await Promise.all([
    fromCoord
      ? Promise.resolve({ ...fromCoord, label: hotelOnly || origin })
      : geocodeNominatim([origin, hotelOnly, `${trimmedHotel}, ${cityOnly}`, cityOnly]),
    toCoordHint
      ? Promise.resolve({ ...toCoordHint, label: placeOnly || destination })
      : geocodeNominatim([destination, placeOnly, `${trimmedPlace}, ${cityOnly}`, cityOnly]),
  ]);
  const from = fromGeo;
  const to = toGeo;
  if (!from || !to) throw new Error("Fallback geocoding failed");

  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&steps=true`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data?.routes?.length || !data.routes[0]?.legs?.length) {
    throw new Error("Fallback OSRM route not found");
  }

  const leg = data.routes[0].legs[0];
  const toKm = (m) => `${(Number(m || 0) / 1000).toFixed(1)} km`;
  const toMin = (s) => `${Math.max(1, Math.round(Number(s || 0) / 60))} mins`;

  return {
    from: from.label,
    to: to.label,
    distance: toKm(leg.distance),
    duration: toMin(leg.duration),
    duration_in_traffic: null,
    steps: (leg.steps || []).slice(0, 20).map((s) => ({
      type: "DRIVING",
      distance: toKm(s.distance),
      duration: toMin(s.duration),
      instructions:
        `${s.maneuver?.type || "Continue"} ${
          s.maneuver?.modifier ? `(${s.maneuver.modifier})` : ""
        } on ${s.name || "road"}`.trim(),
    })),
    source: "osrm-fallback",
  };
}

export const getTransitRoute = async (req, res) => {
  try {
    const {
      hotel,
      place,
      city,
      mode = "transit",
      hotelLat,
      hotelLng,
      placeLat,
      placeLng,
    } = req.body;
    console.log("[transport] incoming request", { hotel, place, city, mode, hotelLat, hotelLng, placeLat, placeLng });

    if (!hotel || !place || !city) {
      return res.status(400).json({
        error: "hotel, place and city are required",
      });
    }

    const fromCoord = toCoord(hotelLat, hotelLng);
    const toCoordResolved = toCoord(placeLat, placeLng);
    const origin = fromCoord ? `${fromCoord.lat},${fromCoord.lon}` : `${hotel}, ${city}`;
    const destination = toCoordResolved ? `${toCoordResolved.lat},${toCoordResolved.lon}` : `${place}, ${city}`;

    /** When both ends are known, OSRM is accurate and avoids RapidAPI quota (429) on Directions. */
    const skipRapidForCoords =
      process.env.TRANSPORT_SKIP_RAPID_WHEN_COORDS !== "0" && fromCoord && toCoordResolved;
    if (skipRapidForCoords) {
      try {
        const direct = await osrmFallbackRoute(
          origin,
          destination,
          hotel,
          place,
          city,
          fromCoord,
          toCoordResolved
        );
        direct.source = "osrm-coords";
        direct.note =
          "Road route between hotel and place coordinates. Set TRANSPORT_SKIP_RAPID_WHEN_COORDS=0 to try Google Directions (transit) via RapidAPI.";
        return res.json(direct);
      } catch (e) {
        console.warn("[transport] OSRM with coords failed, trying RapidAPI:", e.message);
      }
    }

    const key = googlePlacesRapidApiKey();
    if (!key) {
      console.error("[transport] missing GOOGLE_PLACES_RAPIDAPI_KEY or RAPIDAPI_KEY");
      return res.status(500).json({
        error: "GOOGLE_PLACES_RAPIDAPI_KEY (or RAPIDAPI_KEY) is not set",
      });
    }

    const cleanMode = String(mode).toLowerCase();
    const modeCandidates = cleanMode === "transit" ? ["transit", "driving", "walking"] : [cleanMode, "driving"];
    console.log("[transport] mode candidates", modeCandidates);
    let data = null;
    let lastDebug = null;

    for (const m of modeCandidates) {
      console.log(`[transport] trying mode=${m}`, { origin, destination });
      const baseParams = [
        `origin=${encodeURIComponent(origin)}`,
        `destination=${encodeURIComponent(destination)}`,
        `mode=${encodeURIComponent(m)}`,
        `language=en`,
        `region=en`,
        `units=metric`,
        `alternatives=true`,
      ];
      if (m === "transit") {
        baseParams.push(`departure_time=${Math.floor(Date.now() / 1000)}`);
        baseParams.push("transit_routing_preference=less_walking");
        baseParams.push("transit_mode=train|tram|subway|bus");
      } else if (m === "driving") {
        baseParams.push(`departure_time=${Math.floor(Date.now() / 1000)}`);
        baseParams.push("traffic_model=pessimistic");
      }

      const url = `https://google-map-places.p.rapidapi.com/maps/api/directions/json?${baseParams.join("&")}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-host": "google-map-places.p.rapidapi.com",
          "x-rapidapi-key": key,
        },
      });

      const text = await response.text();
      console.log(`[transport] mode=${m} http=${response.status}`);
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[transport] mode=${m} invalid JSON response`);
        data = null;
      }

      if (data?.status === "OK" && data.routes?.length) {
        console.log(`[transport] mode=${m} success routes=${data.routes.length}`);
        break;
      }
      console.warn(`[transport] mode=${m} no route`, {
        apiStatus: data?.status,
        errorMessage: data?.error_message,
      });
      lastDebug = data || { raw: text.substring(0, 200), mode: m, httpStatus: response.status };
      data = null;
    }

    if (!data?.routes?.length) {
      console.error("[transport] all RapidAPI modes failed; trying OSRM fallback", lastDebug);
      try {
        const fallback = await osrmFallbackRoute(
          origin,
          destination,
          hotel,
          place,
          city,
          fromCoord,
          toCoordResolved
        );
        console.log("[transport] fallback success", {
          from: fallback.from,
          to: fallback.to,
          distance: fallback.distance,
          duration: fallback.duration,
          steps: fallback.steps.length,
        });
        return res.json(fallback);
      } catch (fallbackErr) {
        console.error("[transport] fallback failed", fallbackErr.message);
        return res.status(404).json({
          error: "No routes found",
          debug: lastDebug,
        });
      }
    }

    const leg = data.routes[0].legs[0];

    // ✅ CLEAN STEPS
    const steps = leg.steps.map((s) => ({
      type: s.travel_mode,
      distance: s.distance?.text || "N/A",
      duration: s.duration?.text || "N/A",
      instructions: s.html_instructions
        ?.replace(/<[^>]+>/g, "")
        ?.replace(/&nbsp;/g, " "),
    }));

    // ✅ FINAL RESPONSE
    const result = {
      from: leg.start_address,
      to: leg.end_address,
      distance: leg.distance?.text,
      duration: leg.duration?.text,
      duration_in_traffic: leg.duration_in_traffic?.text,
      steps,
    };
    console.log("[transport] final result", {
      from: result.from,
      to: result.to,
      distance: result.distance,
      duration: result.duration,
      steps: steps.length,
    });

    return res.json(result);
  } catch (err) {
    console.error("Error fetching route:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};