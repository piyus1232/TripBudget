import React, { useState, useEffect } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import TripsSummary from './TripsSummary';
import TrainRecommendation from './TrainRecomendation';
import SuggestedRecommendation from './suggestedRecomendation';
import PlacestoVisit from './PlacestoVisit';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiUrl } from '../../conf/api.js';

/** Toast once per job id (avoids repeats on effect re-runs / Strict Mode). */
const fareJobToastShown = new Set();

function mergePlanWithFareJob(planData, results) {
  if (planData.farePending === false) return planData;

  const byKey = new Map();
  for (const r of results || []) {
    if (!r?.leg || !r?.fare) continue;
    const k = `${r.leg.trainNo}|${r.leg.from}|${r.leg.to}`;
    byKey.set(k, r.fare);
  }
  const patchTrain = (tr) => {
    if (!tr?.train_base) return tr;
    const k = `${tr.train_base.train_no}|${tr.train_base.from_stn_code}|${tr.train_base.to_stn_code}`;
    const fare = byKey.get(k);
    if (!fare) return tr;
    return { ...tr, fare };
  };
  const cheapestOutTrain = patchTrain(planData.cheapestOutTrain);
  const secondCheapestOutTrain = patchTrain(planData.secondCheapestOutTrain);
  const cheapestReturnTrain = patchTrain(planData.cheapestReturnTrain);
  const secondCheapestReturnTrain = patchTrain(planData.secondCheapestReturnTrain);
  const cls = planData.classCodes?.[0] || 'SL';
  const perPerson = (tr) => {
    const raw = tr?.fare?.fare?.totalFare?.general?.[cls];
    if (raw == null || raw === '-') return 0;
    const n = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };
  const tv = Number(planData.travelers) || 1;
  const trainPart = (perPerson(cheapestOutTrain) + perPerson(cheapestReturnTrain)) * tv;
  /** Hotel-only base — pending response uses totalfare = hotel + 0 train; never stack train twice. */
  const hotelBase =
    typeof planData.totalWithoutTrain === 'number'
      ? planData.totalWithoutTrain
      : planData.totalfare;

  return {
    ...planData,
    cheapestOutTrain,
    secondCheapestOutTrain,
    cheapestReturnTrain,
    secondCheapestReturnTrain,
    totalfare: hotelBase + trainPart,
    totalWithoutTrain: hotelBase,
    farePending: false,
  };
}

function FormResponse() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.state?.data;
  const fareJobIdFromState = location.state?.fareJobId ?? initial?.fareJobId;

  const [planData, setPlanData] = useState(initial);

  useEffect(() => {
    const jobId = fareJobIdFromState;
    if (!jobId || !initial?.farePending) return undefined;

    let intervalId;

    const tick = async () => {
      try {
        const res = await axios.get(apiUrl(`/api/v1/users/fare-job/${jobId}`), {
          withCredentials: true,
        });
        const job = res.data?.data;
        if (!job) return;

        if (job.status === 'completed') {
          if (intervalId != null) clearInterval(intervalId);
          setPlanData((prev) => mergePlanWithFareJob(prev, job.results));
          if (!fareJobToastShown.has(jobId)) {
            fareJobToastShown.add(jobId);
            toast.success('Train fares loaded');
          }
          return;
        }
        if (job.status === 'failed') {
          if (intervalId != null) clearInterval(intervalId);
          if (!fareJobToastShown.has(jobId)) {
            fareJobToastShown.add(jobId);
            toast.error(job.error || 'Could not load train fares');
          }
          setPlanData((prev) => ({ ...prev, farePending: false }));
        }
      } catch (e) {
        console.error('fare-job poll:', e);
      }
    };

    tick();
    intervalId = setInterval(tick, 2500);
    return () => {
      if (intervalId != null) clearInterval(intervalId);
    };
    // Only re-poll when job id changes — not when `initial` object identity changes (avoids duplicate intervals).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial.farePending read once per job
  }, [fareJobIdFromState]);

  const data = planData;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#171221] text-white flex flex-col sm:flex-row">
        <SideBar />
        <div className="flex-1 min-w-0 pt-24 sm:pt-12 ml-0 sm:ml-[280px] px-6">
          <p className="text-gray-300 mb-4 max-w-md">
            No plan data found. Plan a trip from the dashboard, or this page was opened directly / refreshed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plantrip')}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500"
          >
            Plan a trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171221] text-white flex flex-col sm:flex-row">
      <SideBar />

      <div className="flex-1 min-w-0 overflow-y-auto pt-14 sm:pt-0 ml-0 sm:ml-[280px] md:ml-[300px] px-4 sm:px-6 py-6 space-y-12">
        {data.farePending ? (
          <p className="text-sm text-cyan-300/90 ml-0 sm:ml-4 md:ml-10 -mb-6">
            Loading train fares in the background… totals will update when ready.
          </p>
        ) : null}
        <TripsSummary planData={data} />
        <TrainRecommendation planData={data} />
        <SuggestedRecommendation planData={data} />
        <PlacestoVisit planData={data} />
      </div>
    </div>
  );
}

export default FormResponse;
