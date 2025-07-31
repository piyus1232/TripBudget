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
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Dynamic radius configuration for cities
const cityRadiusConfig = {
  "manali": 50,
  "rishikesh": 15,
  "delhi": 50,
  "mumbai": 25,
  "agra": 40,
  "kashmir": 50,
  "jammu": 50,
  "default": 20,
  "jaipur": 50
};

// Curated list of famous landmarks by city (lowercase for matching) with approximate coordinates
const famousLandmarks = {
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
  ]
};

const getplaces = async (req, res, next) => {
  try {
    const { destination } = req.body;
    
    // Validate input
    if (!destination || typeof destination !== 'string') {
      throw new ApiError(400, 'Valid destination string is required');
    }

    // Step 1: Geocoding
    let lat, lng, formattedAddress;
    try {
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: destination,
            key: process.env.GEOCODE_API_KEY
          },
          timeout: 5000
        }
      );

      if (!geoResponse.data) {
        throw new ApiError(502, 'No response from geocoding service');
      }

      switch (geoResponse.data.status) {
        case 'ZERO_RESULTS':
          throw new ApiError(404, `Could not find "${destination}". Try a more specific location.`);
        case 'OVER_QUERY_LIMIT':
          throw new ApiError(429, 'Geocoding service quota exceeded');
        case 'REQUEST_DENIED':
          throw new ApiError(403, 'Geocoding service denied request');
        case 'INVALID_REQUEST':
          throw new ApiError(400, 'Invalid destination format');
        case 'OK':
          break;
        default:
          throw new ApiError(502, `Geocoding error: ${geoResponse.data.status}`);
      }

      const result = geoResponse.data.results[0];
      if (!result?.geometry?.location) {
        throw new ApiError(404, 'Valid coordinates not found');
      }

      ({ lat, lng } = result.geometry.location);
      formattedAddress = result.formatted_address;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.code === 'ECONNABORTED') {
        throw new ApiError(504, 'Geocoding service timeout');
      }
      throw new ApiError(502, `Geocoding failed: ${error.message}`);
    }

    // Step 2: Determine dynamic radius and check for known city
    const cityKey = destination.toLowerCase().split(',')[0].trim();
    const isKnownCity = Object.keys(famousLandmarks).includes(cityKey) || Object.keys(cityRadiusConfig).includes(cityKey);
    const MAX_DISTANCE_KM = cityRadiusConfig[cityKey] || cityRadiusConfig.default;

    // Step 3: Fetch places from Geoapify
    const priorityCategories = [
      'tourism.attraction',
      'building.historic',
      'religion.place_of_worship',
      'entertainment.culture',
      'leisure.park',
      'highway.pedestrian'
    ];

    const blacklistedTerms = [
      'cinema', 'theater', 'theatre', 'apartment', 'college', 'school', 'hospital',
      'residential', 'academy', 'mystery rooms', 'office', 'market', 'farm', 'complex',
      'boulder', 'trail', 'point', 'across', 'meadow', 'memorial', 'indira gandhi'
    ];

    const genericNames = [
      'viewpoint', 'view', 'valley', 'waterfall', 'peak', 'scenic', 'temple', 'mosque', 
      'church', 'gurdwara', 'masjid', 'mandir', 'bhavan'
    ];

    let places;
    try {
      const placeResponse = await axios.get(
        `https://api.geoapify.com/v2/places`, {
          params: {
            categories: priorityCategories.join(','),
            filter: `circle:${lng},${lat},${MAX_DISTANCE_KM * 1000}`,
            limit: 500,
            apiKey: process.env.GEOAPIFY_API_KEY
          },
          timeout: 15000
        }
      );

      places = placeResponse.data.features || [];
      if (!places.length) {
        console.warn(`No places found for ${destination} within ${MAX_DISTANCE_KM} km`);
      }
    } catch (error) {
      console.error('Places API error:', error.response?.data || error.message);
      throw new ApiError(502, 'Failed to fetch places data');
    }

    // Step 4: Fetch Google Places data for popularity
    let googlePlaces = [];
    try {
      const googleResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
          params: {
            location: `${lat},${lng}`,
            radius: MAX_DISTANCE_KM * 1000,
            type: 'tourist_attraction',
            key: process.env.GOOGLE_API_KEY
          },
          timeout: 5000
        }
      );
      googlePlaces = googleResponse.data.results || [];
    } catch (error) {
      console.warn('Google Places API error:', error.message);
    }

    // Step 5: Process and score places
    const scoredPlaces = places
      .filter(place => {
        if (!place.properties || typeof place.properties.name !== 'string' || !place.properties.name.trim()) {
          console.warn(`Invalid place name detected: ${JSON.stringify(place.properties)}`);
          return false;
        }
        const name = place.properties.name.toLowerCase();
        if (blacklistedTerms.some(term => name.includes(term))) return false;
        if (genericNames.some(term => name.includes(term) && !famousLandmarks[cityKey]?.some(landmark => 
          (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(name) || name.includes((typeof landmark === 'string' ? landmark : landmark.name).toLowerCase())))) return false;
        if (!place.geometry?.coordinates?.length) return false;
        const [placeLng, placeLat] = place.geometry.coordinates;
        const distance = calculateDistance(lat, lng, placeLat, placeLng);
        return distance <= MAX_DISTANCE_KM;
      })
      .map(place => {
        const [placeLng, placeLat] = place.geometry.coordinates;
        const distance = calculateDistance(lat, lng, placeLat, placeLng);
        const name = place.properties.name.toLowerCase();
        
        // Calculate score
        let score = 0;
        
        // Category scoring
        const category = priorityCategories.find(c => 
          place.properties.categories?.includes(c)
        ) || place.properties.categories?.[0] || 'other';
        const categoryScores = {
          'tourism.attraction': 80,
          'building.historic': 70,
          'religion.place_of_worship': 60,
          'entertainment.culture': 30,
          'leisure.park': 50,
          'natural.waterfall': 60,
          'natural.valley': 60,
          'highway.pedestrian': 50,
          'other': 10
        };
        score += categoryScores[category] || 0;
        
        // Metadata bonuses
        if (place.properties.datasource?.raw?.wikipedia) score += 20;
        if (place.properties.datasource?.raw?.wikidata) score += 10;
        if (place.properties.website?.toLowerCase().includes('tourism')) score += 20;
        if (place.properties.rating >= 4) score += place.properties.rating * 20;
        
        // Google Places popularity boost
        const googlePlace = googlePlaces.find(gp => {
          const gpName = gp?.name?.toLowerCase() || '';
          return (
            (gpName.includes(name) || name.includes(gpName) || 
             famousLandmarks[cityKey]?.some(landmark => 
               (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(gpName) && name.includes((typeof landmark === 'string' ? landmark : landmark.name).toLowerCase()))) &&
            calculateDistance(placeLat, placeLng, gp?.geometry?.location?.lat || 0, gp?.geometry?.location?.lng || 0) < 2
          );
        });
        if (googlePlace) {
          if (googlePlace.rating >= 3.5) score += googlePlace.rating * 30;
          if (googlePlace.user_ratings_total) score += Math.min(googlePlace.user_ratings_total * 0.5, 150);
        }
        
        // Famous landmark boost (only for known cities)
        const landmarks = famousLandmarks[cityKey] || [];
        if (isKnownCity) {
          const isFamous = landmarks.some(landmark => 
            (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(name) || 
            name.includes((typeof landmark === 'string' ? landmark : landmark.name).toLowerCase()) || 
            name.split(' ').some(word => (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(word) && word.length > 3) ||
            landmarks.some(l => (typeof l === 'string' ? l : l.name).toLowerCase().split(' ').some(word => name.includes(word) && word.length > 3))
          );
          if (isFamous) score += 300;
        }
        
        // Consolidate fragmented landmarks
        const subStructureKeywords = [
          'temple', 'valley', 'waterfall', 'pass', 'road', 'ghat', 'ashram', 
          'niketan', 'cave', 'view', 'manali', 'hadimba', 'jhula', 'fort', 'palace', 
          'bagh', 'mata', 'mandir', 'mosque', 'gurdwara'
        ];
        const isSubStructure = subStructureKeywords.some(term => name.includes(term));
        let consolidatedName = name;
        if (isSubStructure && landmarks.length) {
          const parentLandmark = landmarks.find(landmark => 
            (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(name) || 
            name.includes((typeof landmark === 'string' ? landmark : landmark.name).toLowerCase()) || 
            name.split(' ').some(word => (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().includes(word) && word.length > 3) ||
            (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase().split(' ').some(word => name.includes(word) && word.length > 3));
          if (parentLandmark) consolidatedName = typeof parentLandmark === 'string' ? parentLandmark : parentLandmark.name;
        }
        
        // Distance penalty
        const distancePenalty = cityRadiusConfig[cityKey] >= 40 ? 0.05 : 0.1;
        score -= distance * distancePenalty;

        return {
          originalName: name,
          ...place,
          score: Math.max(0, score),
          category,
          distance,
          consolidatedName
        };
      });

    // Step 6: Inject missing famous landmarks (only for known cities)
    let allPlaces = [...scoredPlaces];
    if (isKnownCity) {
      const cityLandmarks = famousLandmarks[cityKey] || [];
      const missingLandmarks = cityLandmarks.filter(landmark => 
        !scoredPlaces.some(p => p.consolidatedName === (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase())
      ).map(landmark => ({
        properties: { name: (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase(), address_line1: (typeof landmark === 'string' ? landmark : landmark.name) },
        geometry: { coordinates: [typeof landmark === 'string' ? 0 : landmark.lng, typeof landmark === 'string' ? 0 : landmark.lat] },
        category: 'tourism.attraction',
        distance: calculateDistance(lat, lng, typeof landmark === 'string' ? lat : landmark.lat, typeof landmark === 'string' ? lng : landmark.lng),
        score: 500 - (calculateDistance(lat, lng, typeof landmark === 'string' ? lat : landmark.lat, typeof landmark === 'string' ? lng : landmark.lng) * 0.05),
        consolidatedName: (typeof landmark === 'string' ? landmark : landmark.name).toLowerCase()
      }));

      allPlaces = [...scoredPlaces, ...missingLandmarks];
    }

    // Step 7: Deduplicate and consolidate
    const uniquePlaces = {};
    allPlaces.forEach(place => {
      const key = `${place.consolidatedName.toLowerCase()}|${place.properties.address_line1 || ''}`;
      if (!uniquePlaces[key] || place.score > uniquePlaces[key].score) {
        uniquePlaces[key] = {
          ...place,
          properties: {
            ...place.properties,
            name: place.consolidatedName
          }
        };
      }
    });

    // Step 8: Sort and limit to top 10
    const finalPlaces = Object.values(uniquePlaces)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Step 9: Format response
    const result = {
      destination: formattedAddress,
      coordinates: { lat, lng },
      places: finalPlaces.map(place => ({
        name: place.properties.name,
        address: [
          place.properties?.address_line1 || '',
          place.properties?.address_line2 || '',
          place.properties?.city || '',
          place.properties?.postcode || ''
        ].filter(Boolean).join(', '),
        category: place.category,
        location: {
          lat: place.geometry.coordinates[1],
          lng: place.geometry.coordinates[0]
        },
        distance: `${place.distance.toFixed(1)} km`,
        metadata: {
          website: place.properties?.website || null,
          wikipedia: place.properties?.datasource?.raw?.wikipedia || null,
          rating: place.properties.rating || googlePlaces.find(gp => 
            gp?.name?.toLowerCase()?.includes(place.properties.name.toLowerCase())
          )?.rating || null,
          significanceScore: place.score,
          originalName: place.originalName
        }
      })),
      count: finalPlaces.length
    };

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Error in getplaces:', error);
    next(error);
  }
};

export { getplaces };