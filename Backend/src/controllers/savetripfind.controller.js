import { SavedTrip } from "../models/savedtrip.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET all saved trips
const getSavedTrips = asyncHandler(async (req, res) => {
  const trips = await SavedTrip.find({ userId: req.user._id }).sort({ createdAt: -1 });
// console.log(trips);

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips
  });
});
const deletedtrips = asyncHandler(async (req, res) => {
    const { id } = req.params;
  const trip = await SavedTrip.findByIdAndDelete(id);
  
if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Trip deleted successfully",
    data: trip
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

export { getSavedTrips,deletedtrips};
