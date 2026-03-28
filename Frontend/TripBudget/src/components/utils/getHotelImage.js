// /utils/getHotelImage.js
import axios from 'axios';
import { getUnsplashAccessKey, HOTEL_HERO_FALLBACK_IMAGE } from '../../conf/api.js';

const fetchHotelImage = async (hotelName) => {
  const key = getUnsplashAccessKey();
  if (!key) {
    return HOTEL_HERO_FALLBACK_IMAGE;
  }
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: hotelName,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${key}`,
      },
    });

    const imageUrl = response.data.results[0]?.urls?.regular;
    return imageUrl || HOTEL_HERO_FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error fetching hotel image:', error);
    return HOTEL_HERO_FALLBACK_IMAGE;
  }
};
export { fetchHotelImage };
