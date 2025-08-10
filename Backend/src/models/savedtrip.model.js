import mongoose from "mongoose";

const trainBaseSchema = new mongoose.Schema({
  train_no: String,
  train_name: String,
  source_stn_name: String,
  source_stn_code: String,
  dstn_stn_name: String,
  dstn_stn_code: String,
  from_stn_name: String,
  from_stn_code: String,
  to_stn_name: String,
  to_stn_code: String,
  from_time: String,
  to_time: String,
  travel_time: String,
  running_days: String
}, { _id: false });

const fareDetailSchema = new mongoose.Schema({
  totalFare: {
    general: mongoose.Schema.Types.Mixed,
    tatkal: mongoose.Schema.Types.Mixed
  },
  individualFare: {
    adult: mongoose.Schema.Types.Mixed,
    child: mongoose.Schema.Types.Mixed,
    adult_tatkal: mongoose.Schema.Types.Mixed,
    child_tatkal: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const fareSchema = new mongoose.Schema({
  success: Boolean,
  fare: fareDetailSchema,
  metadata: {
    sourceUrl: String,
    scrapedAt: Date
  }
}, { _id: false });

const trainSchema = new mongoose.Schema({
  train_base: trainBaseSchema,
  fare: fareSchema,
  fares: mongoose.Schema.Types.Mixed
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: String,
  price: String,
  starRating: Number,
  address: String,
  amenities: [String]
}, { _id: false });

const placeLocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number
}, { _id: false });

const placeSchema = new mongoose.Schema({
  name: String,
  address: String,
  category: String,
  location: placeLocationSchema,
  distance: String,
  metadata: {
    score: Number
  }
}, { _id: false });

const placesSchema = new mongoose.Schema({
  destination: String,
  coordinates: placeLocationSchema,
  places: [placeSchema],
  count: Number
}, { _id: false });

const savedTripSchema = new mongoose.Schema({
 userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: String,

  startDate: Date,
  returnDate: Date,
  cheapestOutTrain: trainSchema,
  secondCheapestOutTrain: trainSchema,
  cheapestReturnTrain: trainSchema,
  secondCheapestReturnTrain: trainSchema,
  hotels: {
    hotels: [hotelSchema],
    totalRecords: Number
  },
   totalfare:String,
  travelers:Number,
  places: placesSchema,
  placeCount: Number,
  coordinates: placeLocationSchema
}, { timestamps: true });

export const SavedTrip = mongoose.model("SavedTrip", savedTripSchema);
