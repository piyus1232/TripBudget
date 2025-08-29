import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique place IDs
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
    { name: "Sabarmati Ashram", lat: 23.0600, lng: 72.5805 },
    { name: "Kankaria Lake", lat: 23.0067, lng: 72.6036 },
    { name: "Jama Masjid", lat: 23.0266, lng: 72.5813 },
    { name: "Sidi Saiyyed Mosque", lat: 23.0258, lng: 72.5866 },
    { name: "Sabarmati Riverfront", lat: 23.0412, lng: 72.5647 },
    { name: "Calico Museum of Textiles", lat: 23.0593, lng: 72.5913 },
    { name: "Hutheesing Jain Temple", lat: 23.0317, lng: 72.5946 },
    { name: "Adalaj Stepwell", lat: 23.1707, lng: 72.5790 },
    { name: "Bhadra Fort", lat: 23.0250, lng: 72.5810 },
    { name: "Science City", lat: 23.0900, lng: 72.5300 },
    { name: "ISKCON Temple Ahmedabad", lat: 23.0303, lng: 72.5163 },
    { name: "Auto World Vintage Car Museum", lat: 23.0483, lng: 72.7090 }
  ],
  "delhi": [
    { name: "Red Fort", lat: 28.6562, lng: 77.2410 },
    { name: "India Gate", lat: 28.6129, lng: 77.2295 },
    { name: "Qutb Minar", lat: 28.5244, lng: 77.1855 },
    { name: "Humayun's Tomb", lat: 28.5933, lng: 77.2506 },
    { name: "Jama Masjid", lat: 28.6507, lng: 77.2334 },
    { name: "Akshardham Temple", lat: 28.6125, lng: 77.2773 },
    { name: "Lotus Temple", lat: 28.5535, lng: 77.2588 },
    { name: "Rashtrapati Bhavan", lat: 28.6144, lng: 77.1990 },
    { name: "Chandni Chowk", lat: 28.6564, lng: 77.2306 },
    { name: "Raj Ghat", lat: 28.6413, lng: 77.2480 },
    { name: "Lodhi Garden", lat: 28.5933, lng: 77.2197 },
    { name: "National Museum", lat: 28.6115, lng: 77.2196 },
    { name: "Connaught Place", lat: 28.6315, lng: 77.2167 }
  ],
  "jaipur": [
    { name: "Hawa Mahal", lat: 26.9239, lng: 75.8267 },
    { name: "Amber Fort", lat: 26.9857, lng: 75.8504 },
    { name: "City Palace", lat: 26.9252, lng: 75.8198 },
    { name: "Jantar Mantar", lat: 26.9258, lng: 75.8234 },
    { name: "Jaigarh Fort", lat: 26.9853, lng: 75.8575 },
    { name: "Nahargarh Fort", lat: 26.9390, lng: 75.8122 },
    { name: "Patrika Gate", lat: 26.8796, lng: 75.7880 },
    { name: "Albert Hall Museum", lat: 26.9124, lng: 75.8195 },
    { name: "Birla Mandir", lat: 26.8933, lng: 75.8123 },
    { name: "Galtaji Temple", lat: 26.9530, lng: 75.8500 },
    { name: "Sisodia Rani Garden", lat: 26.9021, lng: 75.8667 },
    { name: "Chokhi Dhani", lat: 26.7695, lng: 75.8185 }
  ],
  "mumbai": [
    { name: "Gateway of India", lat: 18.9218, lng: 72.8347 },
    { name: "Elephanta Caves", lat: 18.9634, lng: 72.9312 },
    { name: "Haji Ali Dargah", lat: 18.9823, lng: 72.8073 },
    { name: "Marine Drive", lat: 18.9430, lng: 72.8238 },
    { name: "Bandra-Worli Sea Link", lat: 19.0176, lng: 72.8176 },
    { name: "Siddhivinayak Temple", lat: 19.0169, lng: 72.8305 },
    { name: "Chhatrapati Shivaji Terminus", lat: 18.9402, lng: 72.8355 },
    { name: "Juhu Beach", lat: 19.0988, lng: 72.8267 },
    { name: "Global Vipassana Pagoda", lat: 19.2307, lng: 72.7928 },
    { name: "Nehru Science Centre", lat: 18.9822, lng: 72.8301 },
    { name: "Film City Goregaon", lat: 19.1551, lng: 72.8740 },
    { name: "Chor Bazaar", lat: 18.9647, lng: 72.8225 }
  ],
  "manali": [
    { name: "Hadimba Temple", lat: 32.2432, lng: 77.1887 },
    { name: "Solang Valley", lat: 32.316, lng: 77.157 },
    { name: "Rohtang La", lat: 32.3643, lng: 77.2620 },
    { name: "Manu Temple", lat: 32.2436, lng: 77.1882 },
    { name: "Jogini Falls", lat: 32.2708, lng: 77.1892 },
    { name: "Mall Road", lat: 32.2430, lng: 77.1892 },
    { name: "Vashisht Temple", lat: 32.2576, lng: 77.1890 },
    { name: "Beas River", lat: 32.2438, lng: 77.1893 },
    { name: "Nehru Kund", lat: 32.2805, lng: 77.1885 },
    { name: "Him Valley Amusement Park", lat: 32.2808, lng: 77.1642 },
    { name: "Old Manali", lat: 32.2566, lng: 77.1887 },
    { name: "Van Vihar National Park", lat: 32.2457, lng: 77.1910 },
    { name: "Naggar Castle", lat: 32.0957, lng: 77.1240 },
    { name: "Arjun Gufa", lat: 32.2705, lng: 77.1982 },
    { name: "Nicholas Roerich Art Gallery", lat: 32.0974, lng: 77.1238 },
    { name: "Manikaran Sahib", lat: 32.0275, lng: 77.3507 },
    { name: "Kasol", lat: 32.0100, lng: 77.3146 },
    { name: "Bhrigu Lake", lat: 32.3216, lng: 77.2502 },
    { name: "Hampta Pass", lat: 32.3019, lng: 77.3648 }
  ],
  "rishikesh": [
    { name: "Laxman Jhula", lat: 30.1286, lng: 78.3239 },
    { name: "Ram Jhula", lat: 30.1186, lng: 78.3156 },
    { name: "Parmarth Niketan", lat: 30.1212, lng: 78.3170 },
    { name: "Triveni Ghat", lat: 30.1071, lng: 78.2945 },
    { name: "Neelkanth Mahadev Temple", lat: 30.0656, lng: 78.4258 },
    { name: "Beatles Ashram", lat: 30.1159, lng: 78.3211 },
    { name: "Tera Manzil Temple", lat: 30.1276, lng: 78.3236 },
    { name: "Vashishta Gufa", lat: 30.0904, lng: 78.4360 },
    { name: "Rajaji National Park", lat: 29.9560, lng: 78.2068 },
    { name: "Bharat Mandir", lat: 30.1036, lng: 78.2966 },
    { name: "Shivpuri (Rafting Point)", lat: 30.1520, lng: 78.4150 }
  ],
  "jammu": [
    { name: "Vaishno Devi", lat: 33.0286, lng: 74.9490 },
    { name: "Raghunath Temple", lat: 32.7305, lng: 74.8605 },
    { name: "Mubarak Mandi Palace", lat: 32.7284, lng: 74.8693 },
    { name: "Peer Kho Cave Temple", lat: 32.7295, lng: 74.8727 },
    { name: "Bagh-e-Bahu", lat: 32.7167, lng: 74.8736 },
    { name: "Bahu Fort", lat: 32.7161, lng: 74.8742 },
    { name: "Amar Mahal Palace", lat: 32.7316, lng: 74.8688 },
    { name: "Ranbireshwar Temple", lat: 32.7302, lng: 74.8614 },
    { name: "Surinsar Lake", lat: 32.7347, lng: 75.1510 },
    { name: "Mansar Lake", lat: 32.6800, lng: 75.1500 }
  ],
  "pushkar": [
  { name: "Pushkar Lake", lat: 26.4897, lng: 74.5511 },
  { name: "Brahma Temple", lat: 26.4901, lng: 74.5521 },
  { name: "Savitri Temple", lat: 26.4806, lng: 74.5508 },
  { name: "Rangji Temple", lat: 26.4879, lng: 74.5590 },
  { name: "Varaha Temple", lat: 26.4910, lng: 74.5525 },
  { name: "Man Mahal", lat: 26.4892, lng: 74.5535 },
  { name: "Gurudwara Singh Sabha", lat: 26.4905, lng: 74.5548 },
  { name: "Gayatri Temple", lat: 26.4785, lng: 74.5520 },
  { name: "Pushkar Camel Fair Ground", lat: 26.4907, lng: 74.5570 },
  { name: "Pushkar Bazaar", lat: 26.4899, lng: 74.5542 }
],

  "kolkata": [
    { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
    { name: "Howrah Bridge", lat: 22.5850, lng: 88.3468 },
    { name: "Indian Museum", lat: 22.5626, lng: 88.3516 },
    { name: "Dakshineswar Kali Temple", lat: 22.6558, lng: 88.3570 },
    { name: "Belur Math", lat: 22.6325, lng: 88.3556 },
    { name: "Marble Palace", lat: 22.5833, lng: 88.3656 },
    { name: "Science City", lat: 22.5390, lng: 88.4004 },
    { name: "Botanical Garden", lat: 22.5362, lng: 88.2965 },
    { name: "Eden Gardens", lat: 22.5646, lng: 88.3433 },
    { name: "Birla Planetarium", lat: 22.5440, lng: 88.3494 },
    { name: "South Park Street Cemetery", lat: 22.5372, lng: 88.3639 }
  ],
  "chennai": [
    { name: "Marina Beach", lat: 13.0500, lng: 80.2824 },
    { name: "Kapaleeshwarar Temple", lat: 13.0337, lng: 80.2707 },
    { name: "Fort St. George", lat: 13.0797, lng: 80.2821 },
    { name: "San Thome Basilica", lat: 13.0314, lng: 80.2760 },
    { name: "Government Museum", lat: 13.0725, lng: 80.2570 },
    { name: "Guindy National Park", lat: 13.0056, lng: 80.2204 },
    { name: "Valluvar Kottam", lat: 13.0497, lng: 80.2375 },
    { name: "Elliot’s Beach", lat: 13.0005, lng: 80.2707 },
    { name: "Arignar Anna Zoological Park", lat: 12.8796, lng: 80.0815 },
    { name: "MGR Film City", lat: 13.0038, lng: 80.2185 }
  ],
  "hyderabad": [
    { name: "Charminar", lat: 17.3616, lng: 78.4747 },
    { name: "Golconda Fort", lat: 17.3833, lng: 78.4011 },
    { name: "Hussain Sagar Lake", lat: 17.4239, lng: 78.4738 },
    { name: "Birla Mandir", lat: 17.4062, lng: 78.4691 },
    { name: "Ramoji Film City", lat: 17.2543, lng: 78.6808 },
    { name: "Chowmahalla Palace", lat: 17.3578, lng: 78.4712 },
    { name: "Nehru Zoological Park", lat: 17.3514, lng: 78.4485 },
    { name: "Qutb Shahi Tombs", lat: 17.3949, lng: 78.3949 },
    { name: "Salar Jung Museum", lat: 17.3716, lng: 78.4800 },
    { name: "Shilparamam", lat: 17.4514, lng: 78.3804 },
    { name: "Laad Bazaar", lat: 17.3615, lng: 78.4742 }
  ],
  "bengaluru": [
    { name: "Lalbagh Botanical Garden", lat: 12.9507, lng: 77.5848 },
    { name: "Cubbon Park", lat: 12.9763, lng: 77.5929 },
    { name: "Bangalore Palace", lat: 12.9987, lng: 77.5920 },
    { name: "Vidhana Soudha", lat: 12.9784, lng: 77.5910 },
    { name: "ISKCON Temple", lat: 13.0094, lng: 77.5510 },
    { name: "Bannerghatta National Park", lat: 12.8000, lng: 77.5770 },
    { name: "Tipu Sultan's Summer Palace", lat: 12.9594, lng: 77.5735 },
    { name: "Nandi Hills", lat: 13.3702, lng: 77.6835 },
    { name: "Innovative Film City", lat: 12.7596, lng: 77.3994 },
    { name: "Commercial Street", lat: 12.9844, lng: 77.6050 },
    { name: "Ulsoor Lake", lat: 12.9837, lng: 77.6287 }
  ],
  "pune": [
    { name: "Shaniwar Wada", lat: 18.5196, lng: 73.8553 },
    { name: "Dagdusheth Ganpati Temple", lat: 18.5195, lng: 73.8553 },
    { name: "Aga Khan Palace", lat: 18.5523, lng: 73.9010 },
    { name: "Sinhagad Fort", lat: 18.3661, lng: 73.7551 },
    { name: "Pataleshwar Cave Temple", lat: 18.5292, lng: 73.8521 },
    { name: "Rajiv Gandhi Zoological Park", lat: 18.4514, lng: 73.8655 },
    { name: "Mulshi Dam", lat: 18.5385, lng: 73.4150 },
    { name: "Okayama Friendship Garden", lat: 18.5040, lng: 73.8415 },
    { name: "Khadakwasla Dam", lat: 18.4445, lng: 73.7714 },
    { name: "Sinhagad Valley", lat: 18.3622, lng: 73.7565 }
  ],
  "chandigarh": [
    { name: "Rock Garden", lat: 30.7522, lng: 76.8104 },
    { name: "Sukhna Lake", lat: 30.7421, lng: 76.8188 },
    { name: "Rose Garden", lat: 30.7520, lng: 76.7836 },
    { name: "Elante Mall", lat: 30.7055, lng: 76.8015 },
    { name: "Chattbir Zoo", lat: 30.5893, lng: 76.8220 },
    { name: "Leisure Valley", lat: 30.7485, lng: 76.7807 },
    { name: "Pinjore Gardens", lat: 30.7944, lng: 76.9102 },
    { name: "Government Museum & Art Gallery", lat: 30.7525, lng: 76.7702 },
    { name: "Sector 17 Market", lat: 30.7395, lng: 76.7820 },
    { name: "Capitol Complex", lat: 30.7595, lng: 76.7910 },
    { name: "International Dolls Museum", lat: 30.7265, lng: 76.7766 }
  ],
  "varanasi": [
    { name: "Kashi Vishwanath Temple", lat: 25.3109, lng: 83.0104 },
    { name: "Dashashwamedh Ghat", lat: 25.3062, lng: 83.0105 },
    { name: "Sarnath", lat: 25.3810, lng: 83.0216 },
    { name: "Manikarnika Ghat", lat: 25.3104, lng: 83.0108 },
    { name: "Assi Ghat", lat: 25.2823, lng: 83.0102 },
    { name: "Ramnagar Fort", lat: 25.2870, lng: 83.0331 },
    { name: "Tulsi Manas Temple", lat: 25.2828, lng: 83.0055 },
    { name: "Bharat Mata Temple", lat: 25.3282, lng: 82.9759 },
    { name: "New Vishwanath Temple (BHU)", lat: 25.3173, lng: 82.9739 },
    { name: "Dhamek Stupa", lat: 25.3812, lng: 83.0222 },
    { name: "Gyanvapi Mosque", lat: 25.3107, lng: 83.0099 }
  ],
  "amritsar": [
    { name: "Golden Temple", lat: 31.6200, lng: 74.8765 },
    { name: "Jallianwala Bagh", lat: 31.6206, lng: 74.8805 },
    { name: "Wagah Border", lat: 31.5820, lng: 74.5748 },
    { name: "Partition Museum", lat: 31.6255, lng: 74.8755 },
    { name: "Gobindgarh Fort", lat: 31.6322, lng: 74.8646 },
    { name: "Maharaja Ranjit Singh Museum", lat: 31.6420, lng: 74.8738 },
    { name: "Hall Bazaar", lat: 31.6300, lng: 74.8752 },
    { name: "Ram Bagh Gardens", lat: 31.6378, lng: 74.8732 },
    { name: "Durgiana Temple", lat: 31.6334, lng: 74.8720 },
    { name: "Khalsa College", lat: 31.6534, lng: 74.8480 },
    { name: "Akal Takht Sahib", lat: 31.6201, lng: 74.8765 }
  ],
  "udaipur": [
    { name: "City Palace", lat: 24.5760, lng: 73.6828 },
    { name: "Lake Pichola", lat: 24.5781, lng: 73.6829 },
    { name: "Jagdish Temple", lat: 24.5783, lng: 73.6837 },
    { name: "Fateh Sagar Lake", lat: 24.5944, lng: 73.6833 },
    { name: "Saheliyon ki Bari", lat: 24.5988, lng: 73.6837 },
    { name: "Monsoon Palace", lat: 24.6135, lng: 73.6462 },
    { name: "Bagore Ki Haveli", lat: 24.5784, lng: 73.6839 },
    { name: "Jaisamand Lake", lat: 24.2353, lng: 74.0770 },
    { name: "Gulab Bagh", lat: 24.5730, lng: 73.6950 },
    { name: "Ambrai Ghat", lat: 24.5768, lng: 73.6820 },
    { name: "Vintage Car Museum", lat: 24.5792, lng: 73.6833 }
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

  // Step 8: Format response with unique placeId
  return {
    destination: formattedAddress,
    coordinates: { lat, lng },
    places: finalPlaces.map((place) => ({
      placeid: uuidv4(), // Generate unique placeId for each place
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