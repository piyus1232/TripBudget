// /utils/getHotelImage.js
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = 'NVjdai-Dk_oAYXw8IJdEjHl-YUO981OzO-jkAutoZ_o';

 const fetchHotelImage = async (hotelName) => {
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: hotelName,
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
   
    

    const imageUrl = response.data.results[0]?.urls?.regular;
     console.log(imageUrl);
    return imageUrl || '/default-hotel.jpg'; // fallback image
  } catch (error) {
    console.error('Error fetching hotel image:', error);
    return '/default-hotel.jpg'; // fallback
  }
};
export {fetchHotelImage}