import fetch from "node-fetch";

export const getTransitRoute = async (req, res) => {
  try {
    const { hotel, place, city, mode = "transit" } = req.body;

    if (!hotel || !place || !city) {
      return res.status(400).json({ error: "hotel, place and city are required" });
    }

    // Add city name to make the search unique
    const origin = `${hotel}, ${city}`;
    const destination = `${place}, ${city}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&mode=${mode}&departure_time=now&key=${process.env.GEOCODE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes?.length) {
      return res.status(404).json({ error: "No routes found" });
    }

    const leg = data.routes[0].legs[0];
    const steps = leg.steps.map((s) => {
      if (s.travel_mode === "TRANSIT") {
        return {
          type: "TRANSIT",
          route: s.transit_details.line.short_name || s.transit_details.line.name,
          vehicle: s.transit_details.line.vehicle.name,
          agency: s.transit_details.line.agencies[0]?.name,
          from: s.transit_details.departure_stop.name,
          to: s.transit_details.arrival_stop.name,
          departure: s.transit_details.departure_time.text,
          arrival: s.transit_details.arrival_time.text,
          numStops: s.transit_details.num_stops,
        };
      } else if (s.travel_mode === "WALKING") {
        return {
          type: "WALK",
          distance: s.distance.text,
          duration: s.duration.text,
          instructions: s.html_instructions.replace(/<[^>]+>/g, ""),
        };
      }
    });

    const result = {
      from: leg.start_address,
      to: leg.end_address,
      distance: leg.distance.text,
      duration: leg.duration.text,
      fare: data.routes[0].fare?.text || "N/A",
      steps,
    };

    return res.json(result);
  } catch (err) {
    console.error("Error fetching route:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

