import mongoose from "mongoose";

const legSchema = new mongoose.Schema(
  {
    trainNo: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    classCode: { type: String, default: "SL" },
  },
  { _id: false }
);

const fareJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    legs: { type: [legSchema], required: true },
    results: { type: [mongoose.Schema.Types.Mixed], default: [] },
    error: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const FareJob = mongoose.model("FareJob", fareJobSchema);
