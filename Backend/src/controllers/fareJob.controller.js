import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { FareJob } from "../models/fareJob.model.js";
import { scheduleFareJobProcessing } from "../services/fareJobProcessor.js";

/**
 * POST body: { legs: [{ trainNo, from, to, classCode? }] }
 * Background worker calls the same addFare() as round-trip planning (see fareJobProcessor).
 */
const createFareJob = asyncHandler(async (req, res) => {
  const { legs } = req.body;
  if (!Array.isArray(legs) || legs.length === 0) {
    throw new ApiError(400, "legs array is required");
  }
  for (const leg of legs) {
    if (!leg?.trainNo || !leg?.from || !leg?.to) {
      throw new ApiError(400, "Each leg needs trainNo, from, and to");
    }
  }

  const job = await FareJob.create({
    userId: req.user._id,
    legs: legs.map((l) => ({
      trainNo: String(l.trainNo),
      from: String(l.from),
      to: String(l.to),
      classCode: l.classCode ? String(l.classCode) : "SL",
    })),
    status: "pending",
  });

  scheduleFareJobProcessing(job._id.toString());

  return res.status(201).json(
    new ApiResponse(
      201,
      { jobId: job._id, status: job.status },
      "Fare job queued"
    )
  );
});

const getFareJob = asyncHandler(async (req, res) => {
  const job = await FareJob.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!job) throw new ApiError(404, "Job not found");

  return res.status(200).json(new ApiResponse(200, job, "OK"));
});

export { createFareJob, getFareJob };
