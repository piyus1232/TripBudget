import React, {  useState } from 'react';
import { useForm } from 'react-hook-form';
import SideBar from '../../components/SideBar/SideBar';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from 'axios';
import Button from '../../components/utils/Button';

function PlanTrip() {
  const { register, handleSubmit } = useForm();
  const [budget, setBudget] = useState(1000);
  const [travelers, setTravelers] = useState(2);
  const [transport, setTransport] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [loading, setLoading] = useState(false);
  const[load,setload]= useState(true)
  const [user,setUser] =useState(null)
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    const finalData = { ...data, budget, travelers, transport, accommodation };
    console.log('Final Submitted Data:', finalData);
    setTimeout(() => setLoading(false), 2000);
  };
  const indianCities = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Nagpur",
  "Goa", "Varanasi", "Amritsar", "Surat", "Kanpur", "Patna", "Ranchi", "Raipur",
  "Jodhpur", "Guwahati", "Dehradun", "Shimla", "Manali", "Udaipur", "Agra",
  "Noida", "Gurgaon", "Thiruvananthapuram", "Kochi", "Mysore", "Madurai",
  "Visakhapatnam", "Vijayawada", "Coimbatore", "Allahabad", "Haridwar",
  "Rishikesh", "Srinagar", "Leh", "Puri", "Bhubaneswar", "Gwalior", "Jabalpur",
  "Dharamshala", "Kodaikanal", "Ooty", "Shillong", "Tirupati", "Nashik"
];
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/users/getCurrentUser", {
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
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#2e2a47,#1c1b2e)] bg-cover" />
      <div className="container mx-auto px-4 pt-6 ml-80 w-285">
        <SideBar />
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="relative bg-[#191726]/90 text-white rounded-3xl p-8 shadow-lg max-w-4xl mx-auto border border-purple-800/30 
                     before:absolute before:inset-0 before:rounded-3xl before:border before:border-purple-500/20 
                     before:pointer-events-none before:shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <h2 className="text-2xl font-bold mb-4">🗺️ Plan Your Trip</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Departure City and Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">From</label>
                <select
                  {...register('from')}
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
                  {...register('to')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                >
                    {indianCities.map((city) => (
    <option key={city} value={city}>{city}</option>
  ))}
                </select>
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full bg-[#242236] border border-[#444] rounded-md px-3 py-2 text-sm focus:outline-none"
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
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-black font-bold py-2.5 rounded-md shadow-md shadow-green-500/30 transition text-sm"
            >
              {loading ? 'Planning...' : '📍 Plan My Trip'}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default PlanTrip;