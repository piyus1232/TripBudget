/**
 * RapidAPI subscription key for `google-map-places.p.rapidapi.com`
 * (geocode, directions, nearbysearch on RapidAPI — not the official maps.googleapis.com key).
 *
 * Prefer `GOOGLE_PLACES_RAPIDAPI_KEY` in `.env`; falls back to generic RapidAPI keys for older setups.
 */
export function googlePlacesRapidApiKey() {
  const dedicated = process.env.GOOGLE_PLACES_RAPIDAPI_KEY?.trim();
  if (dedicated) return dedicated;
  return (
    process.env.RAPIDAPI_PLACES_KEY?.trim() ||
    process.env.RAPIDAPI_PLACES_KEYY?.trim() ||
    process.env.RAPIDAPI_KEY?.trim() ||
    ''
  );
}
