import { addFare } from "../controllers/train.controller.js";
import puppeteer from "puppeteer-extra";
import { FareJob } from "../models/fareJob.model.js";
import { SavedTrip } from "../models/savedtrip.model.js";
import { applyFareJobToTrip } from "../utils/savedTripFareEnrich.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs after POST /fare-job: same addFare() as the main train flow, shared browser per job.
 */
export function scheduleFareJobProcessing(jobId) {
  setImmediate(() => {
    processFareJob(jobId).catch((err) => {
      console.error("[fare-job] unhandled:", err);
    });
  });
}

async function processFareJob(jobId) {
  const job = await FareJob.findById(jobId);
  if (!job || job.status !== "pending") return;

  job.status = "processing";
  await job.save();

  let browser;
  try {
    const launchOpts = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--mute-audio",
      ],
      timeout: 120000,
    };
    const chrome = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
    if (chrome) launchOpts.executablePath = chrome;

    browser = await puppeteer.launch(launchOpts);

    const results = [];
    for (const leg of job.legs) {
      const fare = await addFare(
        leg.trainNo,
        leg.from,
        leg.to,
        leg.classCode || "SL",
        browser
      );
      results.push({ leg, fare });
      await delay(800);
    }

    job.results = results;
    job.status = "completed";
    job.completedAt = new Date();
    await job.save();

    const jobDoc = job.toObject ? job.toObject() : job;
    const saved = await SavedTrip.find({ fareJobId: job._id });
    for (const doc of saved) {
      const updated = applyFareJobToTrip(doc.toObject(), jobDoc);
      await SavedTrip.updateOne(
        { _id: doc._id },
        {
          $set: {
            cheapestOutTrain: updated.cheapestOutTrain,
            secondCheapestOutTrain: updated.secondCheapestOutTrain,
            cheapestReturnTrain: updated.cheapestReturnTrain,
            secondCheapestReturnTrain: updated.secondCheapestReturnTrain,
            totalfare: updated.totalfare,
          },
        }
      );
    }
  } catch (e) {
    job.status = "failed";
    job.error = e?.message || String(e);
    job.completedAt = new Date();
    await job.save();
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
