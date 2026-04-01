import { FareJob } from "../models/fareJob.model.js";
import { USD_TO_INR } from "./currency.js";

/** Per-person general fare for class (same logic as finalcontroller). */
function parseGeneralFareForClass(train, classCode) {
  const raw = train?.fare?.fare?.totalFare?.general?.[classCode];
  if (raw == null || raw === "-") return 0;
  const n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function computeHotelFareINR(trip) {
  const list = trip.hotels?.hotels || [];
  const prices = list
    .map((h) => parseFloat(h.price))
    .filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length === 0) return 0;

  const avgPriceUSD = prices.reduce((a, b) => a + b, 0) / prices.length;
  const avgPriceINR = avgPriceUSD * USD_TO_INR;
  const travelers = Number(trip.travelers) || 1;
  const roomsNeeded = Math.ceil(travelers / 2);

  const start = new Date(trip.startDate);
  const end = new Date(trip.returnDate);
  const timeDiff = Math.abs(end - start);
  const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return avgPriceINR * roomsNeeded * totalDays;
}

function legKeyFromTrain(tr, isOutbound, routeFrom, routeTo) {
  const trainNo = String(tr?.train_base?.train_no || "");
  const from = String(
    tr?.train_base?.from_stn_code ||
      (isOutbound ? routeFrom : routeTo) ||
      ""
  ).toUpperCase();
  const to = String(
    tr?.train_base?.to_stn_code ||
      (isOutbound ? routeTo : routeFrom) ||
      ""
  ).toUpperCase();
  return `${trainNo}|${from}|${to}`;
}

function buildFareMapFromJob(job) {
  const m = new Map();
  for (const r of job.results || []) {
    const leg = r.leg;
    if (!leg || !r.fare?.success || !r.fare?.fare) continue;
    const k = `${String(leg.trainNo)}|${String(leg.from).toUpperCase()}|${String(leg.to).toUpperCase()}`;
    m.set(k, r.fare);
  }
  return m;
}

function mergeTrainFare(tr, fareMap, isOutbound, routeFrom, routeTo) {
  if (!tr?.train_base?.train_no) return tr;
  const k = legKeyFromTrain(tr, isOutbound, routeFrom, routeTo);
  const fareObj = fareMap.get(k);
  if (fareObj && fareObj.success && fareObj.fare) {
    return { ...tr, fare: fareObj };
  }
  return tr;
}

/**
 * Merge a completed FareJob into a plain saved-trip object (trains + totalfare).
 * Exported for DB sync after fare jobs finish.
 */
export function applyFareJobToTrip(trip, job) {
  if (!job || job.status !== "completed" || !job.results?.length) return trip;

  const out = trip.cheapestOutTrain;
  let routeFrom = out?.train_base?.from_stn_code;
  let routeTo = out?.train_base?.to_stn_code;
  if (!routeFrom || !routeTo) {
    const leg0 = job.legs?.[0];
    if (leg0) {
      routeFrom = routeFrom || leg0.from;
      routeTo = routeTo || leg0.to;
    }
  }
  if (!routeFrom || !routeTo) return trip;

  const fareMap = buildFareMapFromJob(job);
  const next = { ...trip };
  next.cheapestOutTrain = mergeTrainFare(
    trip.cheapestOutTrain,
    fareMap,
    true,
    routeFrom,
    routeTo
  );
  next.secondCheapestOutTrain = mergeTrainFare(
    trip.secondCheapestOutTrain,
    fareMap,
    true,
    routeFrom,
    routeTo
  );
  next.cheapestReturnTrain = mergeTrainFare(
    trip.cheapestReturnTrain,
    fareMap,
    false,
    routeFrom,
    routeTo
  );
  next.secondCheapestReturnTrain = mergeTrainFare(
    trip.secondCheapestReturnTrain,
    fareMap,
    false,
    routeFrom,
    routeTo
  );

  const primaryClass =
    (Array.isArray(trip.classCodes) && trip.classCodes[0]) || "SL";
  const tv = Number(trip.travelers) || 1;
  const trainPerPerson =
    parseGeneralFareForClass(next.cheapestOutTrain, primaryClass) +
    parseGeneralFareForClass(next.cheapestReturnTrain, primaryClass);
  const trainTotal = trainPerPerson * tv;
  const hotelTotal = computeHotelFareINR(next);
  next.totalfare = String(Math.round(hotelTotal + trainTotal));

  return next;
}

/**
 * Merge completed FareJob results into saved trips (async fare flow).
 */
export async function enrichSavedTripsWithFareJobs(trips) {
  const ids = [
    ...new Set(
      trips.map((t) => t.fareJobId).filter(Boolean).map((id) => String(id))
    ),
  ];
  if (ids.length === 0) return trips;

  const jobs = await FareJob.find({ _id: { $in: ids } }).lean();
  const jobMap = new Map(jobs.map((j) => [String(j._id), j]));

  return trips.map((t) => applyFareJobToTrip(t, jobMap.get(String(t.fareJobId))));
}
