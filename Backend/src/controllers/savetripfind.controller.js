import { SavedTrip } from "../models/savedtrip.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enrichSavedTripsWithFareJobs } from "../utils/savedTripFareEnrich.js";

// GET all saved trips
const getSavedTrips = asyncHandler(async (req, res) => {
  const trips = await SavedTrip.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  const data = await enrichSavedTripsWithFareJobs(trips);

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});
const deletedtrips = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await SavedTrip.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Trip deleted successfully",
    data: trip,
  });
});

const deleteAllTrips = asyncHandler(async (req, res) => {
  const result = await SavedTrip.deleteMany({ userId: req.user._id });
  res.status(200).json({
    success: true,
    message: "All saved trips removed",
    deletedCount: result.deletedCount,
  });
});



// GET one saved trip by ID
// const getSavedTripById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const trip = await SavedTrip.findById(id);
//   if (!trip) {
//     return res.status(404).json({
//       success: false,
//       message: "Trip not found"
//     });
//   }

//   res.status(200).json({
//     success: true,
//     data: trip
//   });
// });

export { getSavedTrips, deletedtrips, deleteAllTrips };
