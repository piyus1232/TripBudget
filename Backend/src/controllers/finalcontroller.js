// File: finalcontroller.js
import { findCheapestRoundTripTrains } from "./getcheapesttrain.js";
import { getPlaces } from "./places.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getCityID, getCoordinates, getHotelData, processHotels } from "./hotel.controller.js";
import { SavedTrip } from "../models/savedtrip.model.js";
import { log } from "console";

// Helper function to normalize input strings (matches train.controller.js)
const normalizeInput = (str) => {
  return str?.toUpperCase().trim() || '';
};

const finalcontroller = async (req, res) => {
  try {
    const {
      source,
      destination,
      startDate,
      budget,
      travelers=1,
      transport,
      accommodation,
      returnDate,
      classCodes = ['SL'],
      forceRefresh = false,
      rooms = 1,
      adults = 2,
      radius = 10,
    } = req.body;

    // Input validation
    if (!source || !destination || !startDate || !returnDate || !classCodes || classCodes.length === 0) {
      throw new ApiError(400, "All fields are required, including at least one class code");
    }
    if (rooms && (typeof rooms !== 'number' || rooms <= 0)) {
      throw new ApiError(400, "Rooms must be a positive number");
    }
    if (adults && (typeof adults !== 'number' || adults <= 0)) {
      throw new ApiError(400, "Adults must be a positive number");
    }
    if (radius && (typeof radius !== 'number' || radius <= 0)) {
      throw new ApiError(400, "Radius must be a positive number");
    }

    // Normalize inputs to ensure cache key consistency
    const normalizedSource = normalizeInput(source);
    const normalizedDestination = normalizeInput(destination);
    const normalizedStartDate = new Date(startDate).toISOString().split('T')[0];
    const normalizedReturnDate = new Date(returnDate).toISOString().split('T')[0];

    console.log("finalcontroller Raw Inputs:", {
      source,
      destination,
      startDate,
      returnDate,
      classCodes,
      forceRefresh,
    });
    console.log("finalcontroller Normalized Inputs:", {
      normalizedSource,
      normalizedDestination,
      normalizedStartDate,
      normalizedReturnDate,
      classCodes,
      forceRefresh,
    });

    // Generate cache key (for debugging)
    const cacheKey = `${normalizedSource}-${normalizedDestination}-${normalizedStartDate}-${normalizedReturnDate}-${classCodes.join(',')}`;
    console.log(`finalcontroller Cache Key: ${cacheKey}`);

    // Call findCheapestRoundTripTrains with normalized inputs
    const trains = await findCheapestRoundTripTrains({
      source: normalizedSource,
      destination: normalizedDestination,
      startDate: normalizedStartDate,
      returnDate: normalizedReturnDate,
      classCodes,
      forceRefresh,
    });

    console.log("finalcontroller Trains Response:", JSON.stringify(trains, null, 2));

    // Destructure the trains response
    const { secondCheapestOutTrain, cheapestOutTrain, cheapestReturnTrain, secondCheapestReturnTrain } = trains;
  
const gettotaltrainfare= function(){

    const cheapestOutTrainfare = cheapestOutTrain?.fare?.fare?.totalFare.general.SL
    const secondCheapestOutTrainfare = secondCheapestOutTrain?.fare?.fare?.totalFare.general.SL
       const cheapestReturnTrainfare = cheapestReturnTrain?.fare?.fare?.totalFare.general.SL
          const secondCheapestReturnTrainfare = secondCheapestReturnTrain?.fare?.fare?.totalFare.general.SL
  const sum= parseInt(cheapestOutTrainfare) + parseInt(cheapestReturnTrainfare)

 return sum
      }



    // Get coordinates
    const cityCoordinates = await getCoordinates(destination);
    // console.log("Coordinates:", cityCoordinates);

    if (!cityCoordinates) {
      throw new ApiError(400, "Could not retrieve coordinates for destination");
    }

    // Get city ID
    let cityId;
    try {
      cityId = await getCityID(cityCoordinates, startDate, returnDate, rooms, adults, radius);
    } catch (err) {
      throw new ApiError(400, `Failed to retrieve city ID: ${err.message}`);
    }

    // Get hotel data
    let hotelData;
    try {
      hotelData = await getHotelData(cityId, startDate, returnDate, rooms, adults);
    } catch (err) {
      throw new ApiError(400, `Failed to retrieve hotel data: ${err.message}`);
    }

    // Process hotel data
    let hotels;
    try {
      hotels = await processHotels(hotelData);
    } catch (err) {
      throw new ApiError(400, `Failed to process hotels: ${err.message}`);
    }

   
const getTotalHotelFare = function() {
    const conversionRate = 87.58; // USD → INR (update dynamically if possible)

    const hotelprice1 = hotels?.hotels[0]?.price || 0;
    const hotelprice2 = hotels?.hotels[1]?.price || 0;
    const hotelprice3 = hotels?.hotels[2]?.price || 0;
    const hotelprice4 = hotels?.hotels[3]?.price || 0;
     const hotelprice5 = hotels?.hotels[4]?.price || 0;
      const hotelprice6 = hotels?.hotels[5]?.price || 0;
       const hotelprice7 = hotels?.hotels[6]?.price || 0;
        const hotelprice8 = hotels?.hotels[7]?.price || 0;

    // Average price in USD for one room per night
    const avgPriceUSD = (
        parseFloat(hotelprice1) +
        parseFloat(hotelprice2) +
        parseFloat(hotelprice3) +
        parseFloat(hotelprice4)+
         parseFloat(hotelprice5)+
          parseFloat(hotelprice6)+
           parseFloat(hotelprice7)+
            parseFloat(hotelprice8)
    ) / 8;

    // Convert to INR
    const avgPriceINR = avgPriceUSD * conversionRate;

    // Number of rooms needed (1 room for 2 travelers)
    const roomsNeeded = Math.ceil(travelers / 2);

    // Calculate number of nights
    const start = new Date(startDate);
    const end = new Date(returnDate);
    const timeDiff = Math.abs(end - start);
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // nights

    // Total hotel fare
    return avgPriceINR * roomsNeeded * (totalDays-1);
};

          const hotelprice1= hotels?.hotels[0].price
       console.log("hotelprice1",hotelprice1);

      const hotelfare= getTotalHotelFare()

const totalhotelfare = hotelfare
console.log("hotelfare",totalhotelfare);

const trainfare = gettotaltrainfare()
const totaltrainfare = trainfare*travelers
console.log("trainfarre",totaltrainfare);

const totalfare =  totalhotelfare+totaltrainfare
console.log("totalfare",totalfare);


    // Get places data
    let places;
    try {
      places = await getPlaces(destination);
    } catch (err) {
      throw new ApiError(400, `Failed to retrieve places data: ${err.message}`);
    }
  console.log(places);
  
  const newTrip = await SavedTrip.create({
    userId: req.user._id,
    destination,
    startDate,
    returnDate,
    cheapestOutTrain,
    secondCheapestOutTrain,
    cheapestReturnTrain,
    secondCheapestReturnTrain,
    hotels,
    totalfare,
    travelers,
    places
  });
 

    // Add cache status header (for debugging)
    res.setHeader('X-Cache-Status', trains.__fromCache ? 'hit' : 'miss');
    console.log('Hotels before sending:', hotels.hotels.map(h => ({ name: h.name, _id: h._id })));


    // Return response with trains, hotels, and places
    return res.status(200).json(
      new ApiResponse(
        200,
        { 
          destination,
          startDate,
          returnDate,
          cheapestOutTrain,
          secondCheapestOutTrain,
          cheapestReturnTrain,
          secondCheapestReturnTrain,
          hotels,
          totalfare,
          travelers,
          places, // Include places in the response
          placeCount: places.count, // Include count of places
          coordinates: places.coordinates, // Include destination coordinates
        },
        "Travel details fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error in finalcontroller:", {
      message: error.message,
      statusCode: error.statusCode || 500,
      stack: error.stack,
    });
    res.status(error.statusCode || 500).json(
      new ApiResponse(
        error.statusCode || 500,
        null,
        error.message || "Internal server error"
      )
    );
  }
};

export { finalcontroller };