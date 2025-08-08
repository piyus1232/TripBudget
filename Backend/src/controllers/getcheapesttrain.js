import { getRoundTripTrains } from "./train.controller.js"; // Adjust if this causes a circular dependency
import { ApiError } from "../utils/ApiError.js";
import NodeCache from 'node-cache';

// Create a single NodeCache instance at module level (TTL: 15 minutes for testing)
const trainCache = new NodeCache({ stdTTL: 60 * 15 });

// Helper function to normalize train name for comparison
const normalizeTrainName = (name) => {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/EXPRESS|EXP|MAIL/g, '')
    .trim();
};

// Helper function to normalize input strings (for cache key consistency)
const normalizeInput = (str) => {
  return str?.toUpperCase().trim() || '';
};

// Helper function to extract fare value for comparison, supporting multiple classes
function getFareValue(train, classCodes = ['SL']) {
  const fares = {};
  try {
    if (!train.fare || !train.fare.success || !train.fare.fare || !train.fare.fare.totalFare) {
      console.log(`Invalid fare data for train ${train.train_base?.train_no}`);
      classCodes.forEach(code => fares[code] = Infinity);
      return fares;
    }
    const totalFare = train.fare.fare.totalFare.general;
    classCodes.forEach(code => {
      const fare = totalFare?.[code];
      if (fare && fare !== '-' && !isNaN(parseFloat(fare))) {
        fares[code] = parseFloat(fare);
      } else {
        console.log(`No valid fare for ${code} in train ${train.train_base?.train_no}`);
        fares[code] = Infinity;
      }
    });
    return fares;
  } catch (error) {
    console.error(`Error extracting fare for train ${train.train_base?.train_no}: ${error.message}`);
    classCodes.forEach(code => fares[code] = Infinity);
    return fares;
  }
}

// Helper function to convert time string (HH.MM) to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split('.').map(Number);
  return hours * 60 + minutes;
};

// Helper function to check if return time is 6-7 hours after outbound time
const isValidReturnTimeGap = (outTime, returnTime) => {
  const outMinutes = timeToMinutes(outTime);
  const returnMinutes = timeToMinutes(returnTime);
  const gapMinutes = (returnMinutes - outMinutes + 1440) % 1440; // Handle day wrap-around
  return gapMinutes >= 360 && gapMinutes <= 420; // 6-7 hours in minutes
};

// Core logic to find the cheapest round-trip trains
const findCheapestRoundTripTrains = async ({ source, destination, startDate, returnDate, classCodes = ['SL'], forceRefresh = false }) => {
  try {
    // Validate inputs
    if (!source || !destination || !startDate || !returnDate || !classCodes || classCodes.length === 0) {
      throw new ApiError(400, "All fields are required, including at least one class code");
    }

    // Normalize inputs for cache key
    const normalizedSource = normalizeInput(source);
    const normalizedDestination = normalizeInput(destination);
    const normalizedStartDate = new Date(startDate).toISOString().split('T')[0];
    const normalizedReturnDate = new Date(returnDate).toISOString().split('T')[0];
    const isSameDay = normalizedStartDate === normalizedReturnDate;
    console.log("Normalized Inputs:", { normalizedSource, normalizedDestination, normalizedStartDate, normalizedReturnDate, isSameDay });

    // Generate cache key
    const cacheKey = `${normalizedSource}-${normalizedDestination}-${normalizedStartDate}-${normalizedReturnDate}-${classCodes.join(',')}`;
    console.log(`Generated cache key: ${cacheKey}`);

    // Check cache if forceRefresh is false
    if (!forceRefresh) {
      const cached = trainCache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
      console.log(`Cache miss for key: ${cacheKey}`);
    } else {
      console.log(`forceRefresh enabled, bypassing cache for key: ${cacheKey}`);
    }

    // Fetch round-trip trains
    const roundTripResponse = await getRoundTripTrains({
      body: { source, destination, startDate, returnDate, classCode: classCodes[0], forceRefresh }
    });

    const { filteredOutTrains = [], filteredReturnTrains = [], isSameDay: upstreamIsSameDay } = roundTripResponse;
    const isSameDayFinal = isSameDay || upstreamIsSameDay;

    // Debug: Log input data
    console.log("Filtered Outbound Trains:", JSON.stringify(filteredOutTrains, null, 2));
    console.log("Filtered Return Trains:", JSON.stringify(filteredReturnTrains, null, 2));

    // Filter trains with valid fares for at least one requested class
    const validOutTrains = filteredOutTrains.filter(train => {
      const fares = getFareValue(train, classCodes);
      return classCodes.some(code => fares[code] !== Infinity);
    });
    const validReturnTrains = filteredReturnTrains.filter(train => {
      const fares = getFareValue(train, classCodes);
      return classCodes.some(code => fares[code] !== Infinity);
    });

    // Find the two cheapest outbound trains based on the first class code
    let cheapestOutTrain = null, secondCheapestOutTrain = null;
    if (validOutTrains.length > 0) {
      const sortedOutTrains = [...validOutTrains].sort((a, b) => {
        const aFare = getFareValue(a, classCodes)[classCodes[0]];
        const bFare = getFareValue(b, classCodes)[classCodes[0]];
        return aFare - bFare;
      });
      cheapestOutTrain = sortedOutTrains[0];
      secondCheapestOutTrain = sortedOutTrains.length > 1 ? sortedOutTrains[1] : null;
    }

    // Find the cheapest and second-cheapest return trains with 6-7 hour gap if same day
    let cheapestReturnTrain = null, secondCheapestReturnTrain = null;
    if (cheapestOutTrain && validReturnTrains.length > 0) {
      const sortedReturnTrains = [...validReturnTrains].sort((a, b) => {
        const aFare = getFareValue(a, classCodes)[classCodes[0]];
        const bFare = getFareValue(b, classCodes)[classCodes[0]];
        return aFare - bFare;
      });

      // Apply 6-7 hour gap logic for cheapest pair
      let filteredReturnTrainsWithGap = sortedReturnTrains;
      if (isSameDayFinal) {
        filteredReturnTrainsWithGap = sortedReturnTrains.filter(train => 
          isValidReturnTimeGap(cheapestOutTrain.train_base.from_time, train.train_base.from_time)
        );
        if (filteredReturnTrainsWithGap.length === 0) {
          console.log("No return trains found within 6-7 hour gap for cheapest, using cheapest available");
          filteredReturnTrainsWithGap = [sortedReturnTrains[0]];
        }
      }
      cheapestReturnTrain = filteredReturnTrainsWithGap[0];

      // Apply 6-7 hour gap logic for second-cheapest pair if available
      if (secondCheapestOutTrain && validReturnTrains.length > 1) {
        let filteredSecondReturnTrainsWithGap = sortedReturnTrains.filter(train => 
          train.train_base.train_no !== cheapestReturnTrain?.train_base.train_no
        );
        if (isSameDayFinal) {
          filteredSecondReturnTrainsWithGap = filteredSecondReturnTrainsWithGap.filter(train => {
            const gap = isValidReturnTimeGap(secondCheapestOutTrain.train_base.from_time, train.train_base.from_time);
            if (!gap) console.log(`Train ${train.train_base.train_no} at ${train.train_base.from_time} does not meet 6-7 hour gap`);
            return gap;
          });
          if (filteredSecondReturnTrainsWithGap.length === 0) {
            console.log("No return trains found within 6-7 hour gap for second-cheapest, using next available");
            filteredSecondReturnTrainsWithGap = sortedReturnTrains.filter(train => {
              const gap = isValidReturnTimeGap(secondCheapestOutTrain.train_base.from_time, train.train_base.from_time);
              return train.train_base.train_no !== cheapestReturnTrain?.train_base.train_no && gap;
            });
            if (filteredSecondReturnTrainsWithGap.length === 0) {
              console.log("No valid second-cheapest return train found, using next cheapest available");
              filteredSecondReturnTrainsWithGap = [sortedReturnTrains.find(train => 
                train.train_base.train_no !== cheapestReturnTrain?.train_base.train_no
              ) || sortedReturnTrains[1] || sortedReturnTrains[0]];
            }
          }
        }
        secondCheapestReturnTrain = filteredSecondReturnTrainsWithGap[0];
      } else {
        secondCheapestReturnTrain = sortedReturnTrains.length > 1 && 
          sortedReturnTrains[1]?.train_base.train_no !== cheapestReturnTrain?.train_base.train_no 
          ? sortedReturnTrains[1] : null;
      }

      // Avoid same train for return if possible
      const outTrainName = normalizeTrainName(cheapestOutTrain.train_base?.train_name || '');
      if (cheapestReturnTrain && normalizeTrainName(cheapestReturnTrain.train_base?.train_name || '') === outTrainName) {
        const differentTrains = filteredReturnTrainsWithGap.filter(train => 
          normalizeTrainName(train.train_base?.train_name || '') !== outTrainName
        );
        cheapestReturnTrain = differentTrains[0] || cheapestReturnTrain;
      }
      if (secondCheapestReturnTrain && normalizeTrainName(secondCheapestReturnTrain.train_base?.train_name || '') === outTrainName) {
        const differentTrains = filteredSecondReturnTrainsWithGap.filter(train => 
          normalizeTrainName(train.train_base?.train_name || '') !== outTrainName
        );
        secondCheapestReturnTrain = differentTrains[0] || secondCheapestReturnTrain;
      }
    }

    // Construct response
    const response = {
      success: true,
      secondCheapestOutTrain: secondCheapestOutTrain ? {
        ...secondCheapestOutTrain,
        fares: getFareValue(secondCheapestOutTrain, classCodes)
      } : null,
      cheapestOutTrain: cheapestOutTrain ? {
        ...cheapestOutTrain,
        fares: getFareValue(cheapestOutTrain, classCodes)
      } : null,
      cheapestReturnTrain: cheapestReturnTrain ? {
        ...cheapestReturnTrain,
        fares: getFareValue(cheapestReturnTrain, classCodes)
      } : null,
      secondCheapestReturnTrain: secondCheapestReturnTrain ? {
        ...secondCheapestReturnTrain,
        fares: getFareValue(secondCheapestReturnTrain, classCodes)
      } : null,
      note: isSameDayFinal && !isValidReturnTimeGap(cheapestOutTrain?.train_base.from_time, cheapestReturnTrain?.train_base.from_time)
        ? "No return train found within 6-7 hour gap for cheapest, using cheapest available."
        : isSameDayFinal && secondCheapestOutTrain && !isValidReturnTimeGap(secondCheapestOutTrain?.train_base.from_time, secondCheapestReturnTrain?.train_base.from_time)
          ? "No return train found within 6-7 hour gap for second-cheapest, using next cheapest available."
          : isSameDayFinal ? "Return trains selected with 6-7 hour gap from outbound departures." : null
    };

    if (!response.cheapestOutTrain && !response.cheapestReturnTrain) {
      throw new ApiError(404, "No trains with valid fares found for the specified route and class");
    }

    // Cache the response
    trainCache.set(cacheKey, response);
    console.log(`Cached response for key: ${cacheKey}`);

    console.log("Cheapest Outbound Train:", response.cheapestOutTrain?.train_base?.train_no, response.cheapestOutTrain?.train_base?.train_name);
    console.log("Second Cheapest Outbound Train:", response.secondCheapestOutTrain?.train_base?.train_no, response.secondCheapestOutTrain?.train_base?.train_name);
    console.log("Cheapest Return Train:", response.cheapestReturnTrain?.train_base?.train_no, response.cheapestReturnTrain?.train_base?.train_name);
    console.log("Second Cheapest Return Train:", response.secondCheapestReturnTrain?.train_base?.train_no, response.secondCheapestReturnTrain?.train_base?.train_name);

    return response;
  } catch (error) {
    console.error("Error in findCheapestRoundTripTrains:", error);
    throw error;
  }
};

// Express controller to handle HTTP requests
const getCheapestRoundTripTrains = async (req, res) => {
  try {
    const { source, destination, startDate, returnDate, classCodes, forceRefresh } = req.body;
    const result = await findCheapestRoundTripTrains({ source, destination, startDate, returnDate, classCodes, forceRefresh });
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export { getCheapestRoundTripTrains, findCheapestRoundTripTrains };