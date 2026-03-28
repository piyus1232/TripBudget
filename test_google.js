
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' });

const testGoogleKey = async () => {
  const key = process.env.GEOCODE_API_KEY ;
  console.log(`Testing key: ${key.substring(0, 10)}...`);
  
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: 'New York',
        key: key
      }
    });
    console.log('Status:', response.data.status);
    if (response.data.error_message) {
      console.log('Error Message:', response.data.error_message);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
};

testGoogleKey();
