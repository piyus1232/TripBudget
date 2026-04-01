import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import SideBar from '../../components/SideBar/SideBar';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from 'axios';
import { apiUrl } from '../../conf/api.js';
import Button from '../../components/utils/Button';
import TypingText from '../../framermotion/TypingText';
const PLAN_STAGES = [
  'Mapping routes and train options…',
  'Finding stays that fit your budget…',
  'Loading places and local highlights…',
  'Crunching your trip estimate…',
];

function formatElapsed(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function PlanTrip() {
  const location = useLocation();
  const prefillDestination =
    typeof location.state?.destination === 'string' ? location.state.destination : '';

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: {
      destination: prefillDestination,
    },
  });
  const [budget, setBudget] = useState(1000);
  const [travelers, setTravelers] = useState(2);
  const [transport, setTransport] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [loading, setLoading] = useState(false);
  const [planElapsedSec, setPlanElapsedSec] = useState(0);
  const[load,setload]= useState(true)
  const [user,setUser] =useState(null)
  const navigate = useNavigate(); 
  const today=new Date().toISOString().split("T")[0];

  useEffect(() => {
    const d = location.state?.destination;
    if (typeof d === 'string' && d) {
      reset({
        ...getValues(),
        destination: d,
      });
    }
  }, [location.state, location.key, reset, getValues]);

  useEffect(() => {
    if (!loading) {
      setPlanElapsedSec(0);
      return undefined;
    }
    setPlanElapsedSec(0);
    const id = setInterval(() => {
      setPlanElapsedSec((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [loading]);

  const planStageIndex = Math.min(
    PLAN_STAGES.length - 1,
    Math.floor(planElapsedSec / 3)
  );
  const planStageText = PLAN_STAGES[planStageIndex];
  /** Eases toward ~94% so it never looks “stuck at 100%” before navigation */
  const planProgressPct = useMemo(
    () => Math.min(94, 6 + planElapsedSec * 2.2),
    [planElapsedSec]
  );

const onSubmit = async (data) => {
  // ✅ Validation for empty fields
  if (!data.source || !data.destination || !data.startDate || !data.returnDate || !transport || !accommodation) {
    toast.error("All fields are required.");
    return;
  }

  // ✅ Validation for same start and end date
  if (data.startDate === data.returnDate) {
    toast.error("Start date and end date should not be the same.");
    return;
  }

  // ✅ Validation for same From & To
  if (data.source === data.destination) {
    toast.error("Source and destination should not be the same.");
    return;
  }

  setLoading(true);

  try {
    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    const finalData = {
      ...data,
      startDate: formatDate(data.startDate),
      returnDate: formatDate(data.returnDate),
      budget,
      travelers,
      transport,
      accommodation,
      /** Fast first response: train list + hotels/places; fares load in background */
      asyncFares: true,
    };

    const res = await axios.post(
      apiUrl("/api/v1/users/train"),
      finalData,
      {
        withCredentials: true,
        /** Train lists + hotels are fast; large timeout for slow hotel/place APIs */
        timeout: 120000,
      }
    );

    navigate('/response', {
      state: {
        data: res.data.data,
        fareJobId: res.data.data?.fareJobId,
        cacheStatus: res.headers['x-cache-status'],
        originalInputs: {
          source: data.source,
          destination: data.destination,
          startDate: finalData.startDate,
          returnDate: finalData.returnDate,
        },
      },
    });

  } catch (error) {
    console.error("Error in trip submission:", error);
    const code = error?.code;
    const status = error?.response?.status;
    if (code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      toast.error("Request timed out. Train fares can take 1–2 minutes on first load — try again or pick a different date.");
    } else if (status >= 500) {
      toast.error("Server error while planning. Please try again in a moment.");
    } else if (status === 401) {
      toast.error("Session expired. Please log in again.");
    } else {
      toast.error(error?.response?.data?.message || "Something went wrong while planning the trip.");
    }
  } finally {
    setLoading(false);
  }
};


  const indianCities = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Nagpur",
  "Goa", "Varanasi", "Amritsar", "Surat", "Kanpur", "Patna", "Ranchi", "Raipur",
  "Jodhpur", "Guwahati", "Dehradun", "Shimla", "Manali", "Udaipur", "Agra",
   "Gurgaon", "Thiruvananthapuram", "Kochi", "Mysore", "Madurai",
  "Visakhapatnam", "Vijayawada", "Coimbatore", "Allahabad", "Haridwar",
  "Rishikesh", "Srinagar", "Leh", "Puri", "Bhubaneswar", "Gwalior", "Jabalpur","Pushkar",
  "Dharamshala", "Kodaikanal", "Ooty", "Shillong", "Tirupati", "Nashik","MIDNAPORE","Jammu","Kathgodam"
];
  const indianCitiess = [
  "Jaipur", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Pushkar",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Nagpur",
  "Goa", "Varanasi", "Amritsar", "Surat", "Kanpur", "Patna", "Ranchi", "Raipur",
  "Jodhpur", "Guwahati", "Dehradun", "Shimla", "Manali", "Udaipur", "Agra", "Delhi",
   "Gurgaon", "Thiruvananthapuram", "Kochi", "Mysore", "Madurai",
  "Visakhapatnam", "Vijayawada", "Coimbatore", "Allahabad", "Haridwar",
  "Rishikesh", "Srinagar", "Leh", "Puri", "Bhubaneswar", "Gwalior", "Jabalpur",
  "Dharamshala", "Kodaikanal", "Ooty", "Shillong", "Tirupati", "Nashik","MIDNAPORE","Jammu","Kathgodam"
];
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(apiUrl("/api/v1/users/getCurrentUser"), {
        withCredentials: true,
      });
     
      setUser(res.data.data);
    } catch {
     
      toast.error("Session expired");
    
    } finally {
      setload(false);
    }
  };

  fetchUser(); 
}, []);

useEffect(() => {
  if (!load && !user) {

    navigate("/");
    toast.error("Session expired");

  }
}, [load,user, navigate]);

  return (
    <div className="relative min-h-screen min-w-0 overflow-x-hidden w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <AnimatePresence>
        {loading ? (
          <Motion.div
            key="plan-overlay"
            role="status"
            aria-live="polite"
            aria-busy="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-[#0f0d18]/85 backdrop-blur-md" />
            <Motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1728]/95 p-6 sm:p-8 shadow-2xl shadow-teal-900/20"
            >
              <div className="flex items-start gap-4">
                <div className="relative mt-0.5 h-12 w-12 shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500/25" />
                  <Motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 border-r-cyan-400/80"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-white tracking-tight">
                    Building your trip
                  </p>
                  <Motion.p
                    key={planStageText}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1 text-sm text-gray-400 leading-snug"
                  >
                    {planStageText}
                  </Motion.p>
                  <p className="mt-3 text-xs text-gray-500">
                    Train fares may finish on the next screen — you can browse the plan right away.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Elapsed</span>
                  <span className="font-mono tabular-nums text-teal-300/90">
                    {formatElapsed(planElapsedSec)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                  <Motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-600 via-cyan-500 to-emerald-400"
                    initial={{ width: '0%' }}
                    animate={{ width: `${planProgressPct}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#2e2a47,#1c1b2e)] bg-cover" />
      <SideBar />
      {/* w-full + large ml overflows the row; use explicit width = parent minus sidebar so mx-auto centers in the real column */}
      <main className="box-border min-w-0 pt-14 pb-8 sm:pt-8 ml-0 w-full sm:ml-[260px] sm:w-[calc(100%-260px)] md:ml-[280px] md:w-[calc(100%-280px)] lg:ml-[300px] lg:w-[calc(100%-300px)] px-4 sm:px-8 flex justify-center">
        <Motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="relative bg-[#191726]/90 text-white rounded-3xl p-4 sm:p-8 shadow-lg w-full max-w-4xl shrink-0 border border-purple-800/30 
                     before:absolute before:inset-0 before:rounded-3xl before:border before:border-purple-500/20 
                     before:pointer-events-none before:shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
        >
         <h2  className="text-2xl font-bold mb-4">
           <TypingText
          delay={0.1}
           text=" 🗺️ Plan Your Trip"
         /> 
         </h2>
         {prefillDestination ? (
           <p className="mb-4 text-sm text-cyan-300/90">
             Destination set to <span className="font-semibold text-white">{prefillDestination}</span> — you can change it below.
           </p>
         ) : null}

          <div className="grid grid-cols-1 gap-4">
            {/* Departure City and Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">From</label>
                <select
                  {...register('source')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                >
                   {indianCities.map((city) => (
    <option key={city} value={city}>{city}</option>
  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">To</label>
                <select
                  {...register('destination')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                >
                    {indianCitiess.map((city) => (
    <option key={city} value={city}>{city}</option>
  ))}
                </select>
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                  min={today}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  {...register('returnDate')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                  min={today}
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm mb-1">Preferred Budget</label>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full accent-green-500 h-3"
              />
              <p className="text-right text-sm font-medium text-green-400 mt-1">₹{budget}</p>
            </div>

            {/* Mode of Travel */}
            <div>
              <label className="block text-sm mb-1">Mode of Travel</label>
              <div className="flex gap-2">
                {['Flight', 'Train', 'Bus'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransport(mode)}
                    className={`flex-1 py-2 px-3 rounded-md border text-sm transition duration-200 ${
                      transport === mode
                        ? 'bg-green-500 text-black font-semibold'
                        : 'bg-[#242236] border-[#444] text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation Preference */}
            <div>
              <label className="block text-sm mb-1">Accommodation</label>
              <select
                onChange={(e) => setAccommodation(e.target.value)}
                value={accommodation}
                className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select accommodation</option>
                <option value="Hotel">Hotel</option>
                <option value="Hostel">Hostel</option>
                <option value="Homestay">Homestay</option>
              </select>
            </div>

            {/* Number of Travelers */}
            <div>
              <label className="block text-sm mb-1">Travelers</label>
              <div className="flex items-center justify-start gap-3 bg-[#242236] border border-[#444] px-3 py-2 rounded-md w-fit">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="text-white text-lg"
                >
                  −
                </button>
                <span className="text-sm">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers(travelers + 1)}
                  className="text-white text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
         

         { user?.verified ?  (
         <div className="pt-4">
            <p className="text-xs text-gray-500 mb-2 text-center">
              We load your route and stays first; train fares fill in on the next screen (usually under a minute).
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-black font-bold py-2.5 rounded-md shadow-md shadow-green-500/30 transition text-sm"
            >
              {loading ? 'Planning...' : '📍 Plan My Trip'}
            </Button>

          </div>
  )
 :
 <div className="pt-4 space-y-3">
   <p className="text-xs text-center text-gray-400 leading-relaxed px-1">
     Tap to verify email and unlock trip planning.
   </p>
   <Button
     type="button"
     className="text-sm w-full font-bold py-2.5 rounded-md shadow-md shadow-amber-500/25 transition bg-gradient-to-r from-amber-500 to-orange-500 text-black"
     onClick={() => navigate("/account?section=verify")}
   >
     Tap to verify email
   </Button>
   <p className="text-xs text-center text-gray-500">
     Opens Account — send the link, then check your inbox.
   </p>
 </div>
}
            

        </Motion.form>
      </main>
    </div>
  );
}

export default PlanTrip;