// File: getPlaces.js
import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import dotenv from 'dotenv';

dotenv.config();

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// City radius configuration
const cityRadiusConfig = {
  manali: 50,
  rishikesh: 15,
  delhi: 50,
  mumbai: 25,
  agra: 40,
  kashmir: 50,
  jammu: 50,
  default: 20,
  jaipur: 50,
};

// Famous landmarks by city (simplified for brevity)
const famousLandmarks = {
  "ahmedabad": [
    { name: "sabarmati ashram", lat: 23.0600, lng: 72.5805 },
    { name: "kankaria lake", lat: 23.0067, lng: 72.6036 },
    { name: "jama masjid", lat: 23.0266, lng: 72.5813 },
    { name: "sidi saiyyed mosque", lat: 23.0258, lng: 72.5866 },
    { name: "sabarmati riverfront", lat: 23.0412, lng: 72.5647 },
    { name: "calico museum of textiles", lat: 23.0593, lng: 72.5913 },
    { name: "hutheesing jain temple", lat: 23.0317, lng: 72.5946 },
    { name: "gujarat vidhyapith", lat: 23.0436, lng: 72.5734 }
  ],
  "delhi": [
    { name: "red fort", lat: 28.6562, lng: 77.2410 },
    { name: "india gate", lat: 28.6129, lng: 77.2295 },
    { name: "qutb minar", lat: 28.5244, lng: 77.1855 },
    { name: "humayun's tomb", lat: 28.5933, lng: 77.2506 },
    { name: "jama masjid", lat: 28.6507, lng: 77.2334 },
    { name: "akshardham", lat: 28.6125, lng: 77.2773 },
    { name: "lotus temple", lat: 28.5535, lng: 77.2588 },
    { name: "rashtrapati bhavan", lat: 28.6144, lng: 77.1990 },
    { name: "chandni chowk", lat: 28.6564, lng: 77.2306 },
    { name: "raj ghat", lat: 28.6413, lng: 77.2480 }
  ],
  "jaipur": [
    { name: "hawa mahal", lat: 26.9239, lng: 75.8267 },
    { name: "amber fort", lat: 26.9857, lng: 75.8504 },
    { name: "city palace", lat: 26.9252, lng: 75.8198 },
    { name: "jantar mantar", lat: 26.9258, lng: 75.8234 },
    { name: "jaigarh fort", lat: 26.9853, lng: 75.8575 },
    { name: "nahargarh fort", lat: 26.9390, lng: 75.8122 },
    { name: "patrika gate", lat: 26.8796, lng: 75.7880 },
    { name: "albert hall museum", lat: 26.9124, lng: 75.8195 },
    { name: "birla mandir", lat: 26.8933, lng: 75.8123 },
    { name: "galtaji temple", lat: 26.9530, lng: 75.8500 }
  ],
  "mumbai": [
    { name: "gateway of india", lat: 18.9218, lng: 72.8347 },
    { name: "elephanta caves", lat: 18.9634, lng: 72.9312 },
    { name: "haji ali dargah", lat: 18.9823, lng: 72.8073 },
    { name: "marine drive", lat: 18.9430, lng: 72.8238 },
    { name: "bandra-worli sea link", lat: 19.0176, lng: 72.8176 },
    { name: "siddhivinayak temple", lat: 19.0169, lng: 72.8305 },
    { name: "chhatrapati shivaji terminus", lat: 18.9402, lng: 72.8355 },
    { name: "juhu beach", lat: 19.0988, lng: 72.8267 },
    { name: "global vipassana pagoda", lat: 19.2307, lng: 72.7928 },
    { name: "nehru science centre", lat: 18.9822, lng: 72.8301 }
  ],
  "manali": [
    { name: "hadimba temple", lat: 32.2432, lng: 77.1887 },
    { name: "solang valley", lat: 32.3181, lng: 77.1586 },
    { name: "rohtang pass", lat: 32.3643, lng: 77.2620 },
    { name: "manu temple", lat: 32.2436, lng: 77.1882 },
    { name: "jogini waterfall", lat: 32.2708, lng: 77.1892 },
    { name: "mall road", lat: 32.2430, lng: 77.1892 },
    { name: "vashisht temple", lat: 32.2576, lng: 77.1890 },
    { name: "beas river", lat: 32.2438, lng: 77.1893 },
    { name: "nehru kund", lat: 32.2805, lng: 77.1885 },
    { name: "him valley amusement park", lat: 32.2808, lng: 77.1642 }
  ],
  "rishikesh": [
    { name: "laxman jhula", lat: 30.1286, lng: 78.3239 },
    { name: "ram jhula", lat: 30.1186, lng: 78.3156 },
    { name: "parmarth niketan", lat: 30.1212, lng: 78.3170 },
    { name: "triveni ghat", lat: 30.1071, lng: 78.2945 },
    { name: "neelkanth mahadev", lat: 30.0656, lng: 78.4258 },
    { name: "beatles ashram", lat: 30.1159, lng: 78.3211 },
    { name: "tera manzil temple", lat: 30.1276, lng: 78.3236 },
    { name: "vashishta gufa", lat: 30.0904, lng: 78.4360 },
    { name: "rajaji national park", lat: 29.9560, lng: 78.2068 },
    { name: "bharat mandir", lat: 30.1036, lng: 78.2966 }
  ],
  "jammu": [
    { name: "vaishno devi", lat: 33.0286, lng: 74.9490 },
    { name: "raghunath temple", lat: 32.7305, lng: 74.8605 },
    { name: "mubarak mandi palace", lat: 32.7284, lng: 74.8693 },
    { name: "peer kho cave", lat: 32.7295, lng: 74.8727 },
    { name: "bagh-e-bahu", lat: 32.7167, lng: 74.8736 },
    { name: "bahu fort", lat: 32.7161, lng: 74.8742 },
    { name: "amar mahal palace", lat: 32.7316, lng: 74.8688 },
    { name: "balidan stambh", lat: 32.7312, lng: 74.8468 },
    { name: "ranbireshwar temple", lat: 32.7302, lng: 74.8614 },
    { name: "surinsar lake", lat: 32.7347, lng: 75.1510 }
  ],

  // ---------- NEW CITIES START HERE ----------
  "kolkata": [
    { name: "victoria memorial", lat: 22.5448, lng: 88.3426 },
    { name: "howrah bridge", lat: 22.5850, lng: 88.3468 },
    { name: "indian museum", lat: 22.5626, lng: 88.3516 },
    { name: "dakshineswar kali temple", lat: 22.6558, lng: 88.3570 },
    { name: "belur math", lat: 22.6325, lng: 88.3556 },
    { name: "marble palace", lat: 22.5833, lng: 88.3656 },
    { name: "science city", lat: 22.5390, lng: 88.4004 },
    { name: "botanical garden", lat: 22.5362, lng: 88.2965 },
    { name: "eden gardens", lat: 22.5646, lng: 88.3433 },
    { name: "birla planetarium", lat: 22.5440, lng: 88.3494 }
  ],
  "chennai": [
    { name: "marina beach", lat: 13.0500, lng: 80.2824 },
    { name: "kapaleeshwarar temple", lat: 13.0337, lng: 80.2707 },
    { name: "fort st. george", lat: 13.0797, lng: 80.2821 },
    { name: "san thome basilica", lat: 13.0314, lng: 80.2760 },
    { name: "government museum", lat: 13.0725, lng: 80.2570 },
    { name: "guindy national park", lat: 13.0056, lng: 80.2204 },
    { name: "valluvar kottam", lat: 13.0497, lng: 80.2375 },
    { name: "elliot's beach", lat: 13.0005, lng: 80.2707 },
    { name: "ashtalakshmi temple", lat: 13.0017, lng: 80.2723 },
    { name: "arignar anna zoological park", lat: 12.8796, lng: 80.0815 }
  ],
  "hyderabad": [
  { name: "charminar", lat: 17.3616, lng: 78.4747 },
  { name: "golconda fort", lat: 17.3833, lng: 78.4011 },
  { name: "hussain sagar lake", lat: 17.4239, lng: 78.4738 },
  { name: "birla mandir", lat: 17.4062, lng: 78.4691 },
  { name: "ramoji film city", lat: 17.2543, lng: 78.6808 },
  { name: "chowmahalla palace", lat: 17.3578, lng: 78.4712 },
  { name: "nehru zoological park", lat: 17.3514, lng: 78.4485 },
  { name: "qutb shahi tombs", lat: 17.3949, lng: 78.3949 },
  { name: "salargunj museum", lat: 17.3716, lng: 78.4800 },
  { name: "shilparamam", lat: 17.4514, lng: 78.3804 }
],
"bengaluru": [
  { name: "lalbagh botanical garden", lat: 12.9507, lng: 77.5848 },
  { name: "cubbon park", lat: 12.9763, lng: 77.5929 },
  { name: "bangalore palace", lat: 12.9987, lng: 77.5920 },
  { name: "vidhana soudha", lat: 12.9784, lng: 77.5910 },
  { name: "iskcon temple", lat: 13.0094, lng: 77.5510 },
  { name: "bannerghatta national park", lat: 12.8000, lng: 77.5770 },
  { name: "tipu sultan's summer palace", lat: 12.9594, lng: 77.5735 },
  { name: "nandi hills", lat: 13.3702, lng: 77.6835 },
  { name: "innovative film city", lat: 12.7596, lng: 77.3994 },
  { name: "commercial street", lat: 12.9844, lng: 77.6050 }
],
"pune": [
  { name: "shanivar wada", lat: 18.5196, lng: 73.8553 },
  { name: "dagdusheth halwai ganpati temple", lat: 18.5195, lng: 73.8553 },
  { name: "agra khan palace", lat: 18.5523, lng: 73.9010 },
  { name: "sinhagad fort", lat: 18.3661, lng: 73.7551 },
  { name: "pataleshwar cave temple", lat: 18.5292, lng: 73.8521 },
  { name: "rajiv gandhi zoological park", lat: 18.4514, lng: 73.8655 },
  { name: "mulshi dam", lat: 18.5385, lng: 73.4150 },
  { name: "okayama friendship garden", lat: 18.5040, lng: 73.8415 },
  { name: "pashan lake", lat: 18.5405, lng: 73.7868 },
  { name: "khadakwasla dam", lat: 18.4445, lng: 73.7714 }
],
"chandigarh": [
  { name: "rock garden", lat: 30.7522, lng: 76.8104 },
  { name: "sukhna lake", lat: 30.7421, lng: 76.8188 },
  { name: "rose garden", lat: 30.7520, lng: 76.7836 },
  { name: "elante mall", lat: 30.7055, lng: 76.8015 },
  { name: "chattbir zoo", lat: 30.5893, lng: 76.8220 },
  { name: "leisure valley", lat: 30.7485, lng: 76.7807 },
  { name: "pinjore gardens", lat: 30.7944, lng: 76.9102 },
  { name: "government museum and art gallery", lat: 30.7525, lng: 76.7702 },
  { name: "sector 17 market", lat: 30.7395, lng: 76.7820 },
  { name: "capitol complex", lat: 30.7595, lng: 76.7910 }
],
"varanasi": [
  { name: "kashi vishwanath temple", lat: 25.3109, lng: 83.0104 },
  { name: "dashashwamedh ghat", lat: 25.3062, lng: 83.0105 },
  { name: "sarnath", lat: 25.3810, lng: 83.0216 },
  { name: "manikarnika ghat", lat: 25.3104, lng: 83.0108 },
  { name: "assi ghat", lat: 25.2823, lng: 83.0102 },
  { name: "ramnagar fort", lat: 25.2870, lng: 83.0331 },
  { name: "tulsi manas temple", lat: 25.2828, lng: 83.0055 },
  { name: "bharat mata temple", lat: 25.3282, lng: 82.9759 },
  { name: "new vishwanath temple", lat: 25.3173, lng: 82.9739 },
  { name: "dhamek stupa", lat: 25.3812, lng: 83.0222 }
],
"amritsar": [
  { name: "golden temple", lat: 31.6200, lng: 74.8765 },
  { name: "jallianwala bagh", lat: 31.6206, lng: 74.8805 },
  { name: "wagah border", lat: 31.5820, lng: 74.5748 },
  { name: "partition museum", lat: 31.6255, lng: 74.8755 },
  { name: "gobindgarh fort", lat: 31.6322, lng: 74.8646 },
  { name: "maharaja ranjit singh museum", lat: 31.6420, lng: 74.8738 },
  { name: "hall bazaar", lat: 31.6300, lng: 74.8752 },
  { name: "ram bagh gardens", lat: 31.6378, lng: 74.8732 },
  { name: "durgiana temple", lat: 31.6334, lng: 74.8720 },
  { name: "khalsa college", lat: 31.6534, lng: 74.8480 }
],
"udaipur": [
  { name: "city palace", lat: 24.5760, lng: 73.6828 },
  { name: "lake pichola", lat: 24.5781, lng: 73.6829 },
  { name: "jagdish temple", lat: 24.5783, lng: 73.6837 },
  { name: "fateh sagar lake", lat: 24.5944, lng: 73.6833 },
  { name: "saheliyon ki bari", lat: 24.5988, lng: 73.6837 },
  { name: "monsoon palace", lat: 24.6135, lng: 73.6462 },
  { name: "bagore ki haveli", lat: 24.5784, lng: 73.6839 },
  { name: "jaisamand lake", lat: 24.2353, lng: 74.0770 },
  { name: "gulab bagh", lat: 24.5730, lng: 73.6950 },
  { name: "ambrai ghat", lat: 24.5768, lng: 73.6820 }
]

};



// Main function to fetch places
const getPlaces = async (destination) => {
  if (!destination || typeof destination !== 'string') {
    throw new ApiError(400, 'Valid destination string is required');
  }

  // Step 1: Geocoding
  let lat, lng, formattedAddress;
  try {
    const geoResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: destination,
        key: process.env.GEOCODE_API_KEY,
      },
      timeout: 10000,
    });

    if (!geoResponse.data || geoResponse.data.status !== 'OK') {
      throw new ApiError(502, `Geocoding error: ${geoResponse.data?.status || 'No response'}`);
    }

    const result = geoResponse.data.results[0];
    if (!result?.geometry?.location) {
      throw new ApiError(404, 'Valid coordinates not found');
    }

    ({ lat, lng } = result.geometry.location);
    formattedAddress = result.formatted_address;
  } catch (error) {
    throw new ApiError(error.status || 502, `Geocoding failed: ${error.message}`);
  }

  // Step 2: Determine radius and check for known city
  const cityKey = destination.toLowerCase().split(',')[0].trim();
  const isKnownCity = cityKey in famousLandmarks || cityKey in cityRadiusConfig;
  const MAX_DISTANCE_KM = cityRadiusConfig[cityKey] || cityRadiusConfig.default;

  // Step 3: Fetch places from Geoapify
  const priorityCategories = [
    'tourism.attraction',
    'building.historic',
    'religion.place_of_worship',
    'entertainment.culture',
    'leisure.park',
    'highway.pedestrian',
  ];

  let places = [];
  try {
    const placeResponse = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: priorityCategories.join(','),
        filter: `circle:${lng},${lat},${MAX_DISTANCE_KM * 1000}`,
        limit: 500,
        apiKey: process.env.GEOAPIFY_API_KEY,
      },
      timeout: 15000,
    });
    places = placeResponse.data.features || [];
  } catch (error) {
    throw new ApiError(502, 'Failed to fetch places data');
  }

  // Step 4: Fetch Google Places for popularity
  let googlePlaces = [];
  try {
    const googleResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: MAX_DISTANCE_KM * 1000,
        type: 'tourist_attraction',
        key: process.env.GOOGLE_API_KEY,
      },
      timeout: 5000,
    });
    googlePlaces = googleResponse.data.results || [];
  } catch (error) {
    console.warn('Google Places API error:', error.message);
  }

  // Step 5: Filter and score places
  const blacklistedTerms = [
    'cinema', 'theater', 'apartment', 'school', 'hospital', 'office', 'market',
  ];
  const genericNames = ['viewpoint', 'temple', 'mosque', 'church'];

  const scoredPlaces = places
    .filter((place) => {
      if (!place.properties?.name || typeof place.properties.name !== 'string') return false;
      const name = place.properties.name.toLowerCase();
      if (blacklistedTerms.some((term) => name.includes(term))) return false;
      if (
        genericNames.some((term) => name.includes(term)) &&
        !famousLandmarks[cityKey]?.some((landmark) => landmark.name.toLowerCase().includes(name))
      ) return false;
      const [placeLng, placeLat] = place.geometry.coordinates;
      return calculateDistance(lat, lng, placeLat, placeLng) <= MAX_DISTANCE_KM;
    })
    .map((place) => {
      const [placeLng, placeLat] = place.geometry.coordinates;
      const distance = calculateDistance(lat, lng, placeLat, placeLng);
      const name = place.properties.name.toLowerCase();
      let score = 0;

      // Simple scoring based on category
      const category = priorityCategories.find((c) => place.properties.categories?.includes(c)) || 'other';
      const categoryScores = {
        'tourism.attraction': 80,
        'building.historic': 70,
        'religion.place_of_worship': 60,
        'entertainment.culture': 30,
        'leisure.park': 50,
        other: 10,
      };
      score += categoryScores[category] || 0;

      // Boost for Google Places data
      const googlePlace = googlePlaces.find((gp) => gp.name?.toLowerCase().includes(name));
      if (googlePlace?.rating >= 3.5) score += googlePlace.rating * 30;

      // Boost for famous landmarks
      if (isKnownCity && famousLandmarks[cityKey]?.some((landmark) => landmark.name.toLowerCase().includes(name))) {
        score += 300;
      }

      return { ...place, score, category, distance, consolidatedName: name };
    });

  // Step 6: Inject missing landmarks
  let allPlaces = [...scoredPlaces];
  if (isKnownCity) {
    const missingLandmarks = famousLandmarks[cityKey]
      .filter((landmark) => !scoredPlaces.some((p) => p.consolidatedName === landmark.name.toLowerCase()))
      .map((landmark) => ({
        properties: { name: landmark.name.toLowerCase(), address_line1: landmark.name },
        geometry: { coordinates: [landmark.lng, landmark.lat] },
        category: 'tourism.attraction',
        distance: calculateDistance(lat, lng, landmark.lat, landmark.lng),
        score: 500 - calculateDistance(lat, lng, landmark.lat, landmark.lng) * 0.05,
        consolidatedName: landmark.name.toLowerCase(),
      }));
    allPlaces = [...scoredPlaces, ...missingLandmarks];
  }

  // Step 7: Deduplicate and sort
  const uniquePlaces = {};
  allPlaces.forEach((place) => {
    const key = place.consolidatedName.toLowerCase();
    if (!uniquePlaces[key] || place.score > uniquePlaces[key].score) {
      uniquePlaces[key] = { ...place, properties: { ...place.properties, name: place.consolidatedName } };
    }
  });

  const finalPlaces = Object.values(uniquePlaces)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Step 8: Format response
  return {
    destination: formattedAddress,
    coordinates: { lat, lng },
    places: finalPlaces.map((place) => ({
      name: place.properties.name,
      address: [
        place.properties.address_line1 || '',
        place.properties.city || '',
        place.properties.postcode || '',
      ].filter(Boolean).join(', '),
      category: place.category,
      location: { lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
      distance: `${place.distance.toFixed(1)} km`,
      metadata: { score: place.score },
    })),
    count: finalPlaces.length,
  };
};

// Controller wrapper for Express
const getPlacesController = async (req, res, next) => {
  try {
    const { destination } = req.body;
    const result = await getPlaces(destination);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export { getPlaces, getPlacesController };