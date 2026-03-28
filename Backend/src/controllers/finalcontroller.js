import { findCheapestRoundTripTrains } from "./getcheapesttrain.js";
import { getPlaces } from "./places.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getCityID, getCoordinates, getHotelData, processHotels, getNearbyFoodOptions } from "./hotel.controller.js";
import { SavedTrip } from "../models/savedtrip.model.js";
import { PlanCache } from "../models/planCache.model.js";
import { log } from "console";
import NodeCache from "node-cache";
import {
  cacheDateKey,
  stableClassKey,
  diskHotelsGet,
  diskHotelsSet,
  diskPlacesGet,
  diskPlacesSet,
  diskFullGet,
  diskFullSet,
} from "../utils/planCacheDisk.js";

const PLAN_CACHE_TTL_SEC =
  Number(process.env.PLAN_CACHE_TTL_SEC) ||
  Number(process.env.TRAIN_CACHE_TTL_SEC) ||
  60 * 60 * 24 * 7;
const hotelsPlanCache = new NodeCache({ stdTTL: PLAN_CACHE_TTL_SEC });
const placesPlanCache = new NodeCache({ stdTTL: PLAN_CACHE_TTL_SEC });
const fullPlanCache = new NodeCache({ stdTTL: PLAN_CACHE_TTL_SEC });
const DISK = process.env.PLAN_CACHE_DISK === "1";
/** 1 = store full plan in MongoDB — survives restart/redeploy (recommended production) */
const MONGO_PLAN = process.env.PLAN_CACHE_MONGO === "1";
/** When train+hotels+places all cache hit, wait at least this many ms before respond. 0 = off */
const MIN_PLAN_RESPONSE_MS =
  process.env.MIN_PLAN_RESPONSE_MS !== undefined && process.env.MIN_PLAN_RESPONSE_MS !== ''
    ? Number(process.env.MIN_PLAN_RESPONSE_MS)
    : 10000;

function cloneForCache(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Avoid inserting another SavedTrip when this user already saved this exact plan (same cache key). */
async function createSavedTripIfNew(userId, planKey, payload) {
  const exists = await SavedTrip.findOne({ userId, planKey }).select('_id').lean();
  if (exists) return;
  await SavedTrip.create({ ...payload, planKey });
}

// Helper function to normalize input strings (matches train.controller.js)
const normalizeInput = (str) => {
  return str?.toUpperCase().trim() || '';
};

const finalcontroller = async (req, res) => {
  const planStartedAt = Date.now();
  try {
    const {
      source,
      destination,
      startDate,
      budget,
      travelers = 1,
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
    const normalizedStartDate = cacheDateKey(startDate);
    const normalizedReturnDate = cacheDateKey(returnDate);
    const r = Number(rooms) || 1;
    const a = Number(adults) || 2;
    const rad = Number(radius) || 10;
    const tv = Number(travelers) || 1;
    const classK = stableClassKey(classCodes);
    const fullKey = `full|${normalizedSource}|${normalizedDestination}|${normalizedStartDate}|${normalizedReturnDate}|${classK}|${r}|${a}|${rad}|${tv}`;

    if (!forceRefresh) {
      let snap = fullPlanCache.get(fullKey);
      if (!snap && DISK) {
        snap = diskFullGet(fullKey, PLAN_CACHE_TTL_SEC);
        if (snap) fullPlanCache.set(fullKey, snap);
      }
      if (!snap && MONGO_PLAN) {
        try {
          const doc = await PlanCache.findOne({
            key: fullKey,
            expiresAt: { $gt: new Date() },
          })
            .lean()
            .exec();
          if (doc?.payload) {
            snap = doc.payload;
            fullPlanCache.set(fullKey, snap);
            console.log(`FULL plan Mongo hit: ${fullKey}`);
          }
        } catch (e) {
          console.warn("PlanCache Mongo read:", e.message);
        }
      }
      if (snap) {
        console.log(`FULL plan cache hit: ${fullKey}`);
        const {
          cheapestOutTrain,
          secondCheapestOutTrain,
          cheapestReturnTrain,
          secondCheapestReturnTrain,
          hotels,
          places,
          totalfare: tf,
        } = snap;
        await createSavedTripIfNew(req.user._id, fullKey, {
          userId: req.user._id,
          destination,
          startDate,
          returnDate,
          cheapestOutTrain,
          secondCheapestOutTrain,
          cheapestReturnTrain,
          secondCheapestReturnTrain,
          hotels,
          totalfare: tf,
          travelers,
          places,
        });
        res.setHeader("X-Cache-Status", "full:hit;train:hit;hotels:hit;places:hit");
        const pad =
          MIN_PLAN_RESPONSE_MS > 0
            ? MIN_PLAN_RESPONSE_MS - (Date.now() - planStartedAt)
            : 0;
        if (pad > 0) await new Promise((r) => setTimeout(r, pad));
        return res.status(200).json(
          new ApiResponse(200, {
            destination,
            startDate,
            returnDate,
            cheapestOutTrain,
            secondCheapestOutTrain,
            cheapestReturnTrain,
            secondCheapestReturnTrain,
            hotels,
            totalfare: tf,
            travelers,
            places,
            placeCount: places.count,
            coordinates: places.coordinates,
          }, "Travel details fetched successfully")
        );
      }
    }

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
    // console.log(`finalcontroller Cache Key: ${cacheKey}`);

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

    const gettotaltrainfare = function () {
      const cheapestOutTrainfare = cheapestOutTrain?.fare?.fare?.totalFare.general.SL;
      const secondCheapestOutTrainfare = secondCheapestOutTrain?.fare?.fare?.totalFare.general.SL;
      const cheapestReturnTrainfare = cheapestReturnTrain?.fare?.fare?.totalFare.general.SL;
      const secondCheapestReturnTrainfare = secondCheapestReturnTrain?.fare?.fare?.totalFare.general.SL;
      const sum = parseInt(cheapestOutTrainfare) || 0 + parseInt(cheapestReturnTrainfare) || 0;

      return sum;
    };

    const hotelsCacheKey = `h:${normalizedDestination}:${normalizedStartDate}:${normalizedReturnDate}:${r}:${a}:${rad}`;
    let hotels;
    let hotelsCacheHit = false;

    if (!forceRefresh) {
      let cachedHotels = hotelsPlanCache.get(hotelsCacheKey);
      if (!cachedHotels && DISK) {
        cachedHotels = diskHotelsGet(hotelsCacheKey, PLAN_CACHE_TTL_SEC);
        if (cachedHotels) hotelsPlanCache.set(hotelsCacheKey, cachedHotels);
      }
      if (cachedHotels) {
        hotels = cloneForCache(cachedHotels);
        hotelsCacheHit = true;
        console.log(`Hotels cache hit: ${hotelsCacheKey}`);
      }
    }

    if (!hotels) {
      const cityCoordinates = await getCoordinates(destination);

      if (!cityCoordinates) {
        throw new ApiError(400, "Could not retrieve coordinates for destination");
      }

      let cityId;
      try {
        cityId = await getCityID(cityCoordinates, normalizedStartDate, normalizedReturnDate, r, a, rad);
      } catch (err) {
        console.log(err);
        throw new ApiError(400, `Failed to retrieve city ID: ${err.message}`);
      }

      let hotelData;
      try {
        hotelData = await getHotelData(cityId, normalizedStartDate, normalizedReturnDate, r, a);
      } catch (err) {
        console.log(err);
        throw new ApiError(400, `Failed to retrieve hotel data: ${err.message}`);
      }

      try {
        hotels = await processHotels(hotelData);
        console.log(
          "Hotels from processHotels:",
          hotels.hotels.map((h) => ({
            name: h.name,
            id: h.id,
            latitude: h.latitude,
            longitude: h.longitude,
          }))
        );
      } catch (err) {
        throw new ApiError(400, `Failed to process hotels: ${err.message}`);
      }

      try {
        for (let hotel of hotels.hotels) {
          const lat = hotel.latitude;
          const lon = hotel.longitude;
          if (lat && lon) {
            console.log(`Fetching food options for hotel ${hotel.name} at (${lat}, ${lon})`);
            try {
              const foodOptions = await getNearbyFoodOptions(lat, lon);
              hotel.foodOptions = foodOptions || [];
              console.log(`Appended ${hotel.foodOptions.length} food options to hotel ${hotel.name}`);
            } catch (err) {
              console.warn(`Failed to fetch food options for hotel ${hotel.name}: ${err.message}`);
              hotel.foodOptions = [];
            }
          } else {
            console.warn(`Missing coordinates for hotel ${hotel.name}, appending empty foodOptions`);
            hotel.foodOptions = [];
          }
        }
      } catch (err) {
        console.error(`Unexpected error while fetching food options: ${err.message}`);
        hotels.hotels.forEach((hotel) => {
          hotel.foodOptions = hotel.foodOptions || [];
        });
      }

      hotels.hotels.forEach((hotel) => {
        if (!hotel.hasOwnProperty("foodOptions")) hotel.foodOptions = [];
      });

      const hCopy = cloneForCache(hotels);
      hotelsPlanCache.set(hotelsCacheKey, hCopy);
      if (DISK) diskHotelsSet(hotelsCacheKey, hCopy, PLAN_CACHE_TTL_SEC);
      console.log(`Hotels cached: ${hotelsCacheKey} disk=${DISK}`);
    }

    const getTotalHotelFare = function () {
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
        parseFloat(hotelprice4) +
        parseFloat(hotelprice5) +
        parseFloat(hotelprice6) +
        parseFloat(hotelprice7) +
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

      return avgPriceINR * roomsNeeded * totalDays;
    };

    const hotelprice1 = hotels?.hotels[0]?.price;
    console.log("hotelprice1", hotelprice1);

    const hotelfare = getTotalHotelFare();
    const totalhotelfare = hotelfare;
    console.log("hotelfare", totalhotelfare);

    const trainfare = gettotaltrainfare();
    const totaltrainfare = trainfare * travelers;
    console.log("trainfare", totaltrainfare);

    const totalfare = totalhotelfare + totaltrainfare;
    console.log("totalfare", totalfare);

    const placesCacheKey = `p:${normalizedDestination}`;
    let places;
    let placesCacheHit = false;

    if (!forceRefresh) {
      let cachedPlaces = placesPlanCache.get(placesCacheKey);
      if (!cachedPlaces && DISK) {
        cachedPlaces = diskPlacesGet(placesCacheKey, PLAN_CACHE_TTL_SEC);
        if (cachedPlaces) placesPlanCache.set(placesCacheKey, cachedPlaces);
      }
      if (cachedPlaces) {
        places = cloneForCache(cachedPlaces);
        placesCacheHit = true;
        console.log(`Places cache hit: ${placesCacheKey}`);
      }
    }

    if (!places) {
      try {
        places = await getPlaces(destination);
        const pCopy = cloneForCache(places);
        placesPlanCache.set(placesCacheKey, pCopy);
        if (DISK) diskPlacesSet(placesCacheKey, pCopy, PLAN_CACHE_TTL_SEC);
        console.log(`Places cached: ${placesCacheKey}`);
      } catch (err) {
        throw new ApiError(400, `Failed to retrieve places data: ${err.message}`);
      }
    }
    console.log(places);

    const fullSnap = {
      cheapestOutTrain,
      secondCheapestOutTrain,
      cheapestReturnTrain,
      secondCheapestReturnTrain,
      hotels: cloneForCache(hotels),
      places: cloneForCache(places),
      totalfare,
    };
    fullPlanCache.set(fullKey, fullSnap);
    if (DISK) diskFullSet(fullKey, fullSnap, PLAN_CACHE_TTL_SEC);
    if (MONGO_PLAN) {
      try {
        await PlanCache.findOneAndUpdate(
          { key: fullKey },
          {
            key: fullKey,
            payload: fullSnap,
            expiresAt: new Date(Date.now() + PLAN_CACHE_TTL_SEC * 1000),
          },
          { upsert: true }
        );
        console.log(`FULL plan Mongo cached: ${fullKey}`);
      } catch (e) {
        console.warn("PlanCache Mongo write:", e.message);
      }
    }
    console.log(`FULL plan cached: ${fullKey}`);

    await createSavedTripIfNew(req.user._id, fullKey, {
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
      places,
    });

    res.setHeader(
      "X-Cache-Status",
      [
        trains.__fromCache ? "train:hit" : "train:miss",
        hotelsCacheHit ? "hotels:hit" : "hotels:miss",
        placesCacheHit ? "places:hit" : "places:miss",
      ].join(";")
    );
    console.log('Hotels before sending:', hotels.hotels.map(h => ({
      name: h.name,
      id: h.id,
      latitude: h.latitude,
      longitude: h.longitude,
      foodOptions: h.foodOptions.map(fo => ({ name: fo.name, rating: fo.rating, priceText: fo.priceText }))
    })));

    const fullCacheHit =
      !!trains.__fromCache && hotelsCacheHit && placesCacheHit;
    if (fullCacheHit && MIN_PLAN_RESPONSE_MS > 0) {
      const pad = MIN_PLAN_RESPONSE_MS - (Date.now() - planStartedAt);
      if (pad > 0) await new Promise((r) => setTimeout(r, pad));
    }

    // Return response with trains, hotels (with foodOptions), and places
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
          places,
          placeCount: places.count,
          coordinates: places.coordinates,
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