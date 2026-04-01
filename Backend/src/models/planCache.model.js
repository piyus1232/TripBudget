import mongoose from "mongoose";

/** Survives server restart / redeploy (same DB). Full plan snapshot by key. */
const planCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

planCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PlanCache = mongoose.model("PlanCache", planCacheSchema);
