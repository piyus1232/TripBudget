import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/utils/Button';
import WordByWordReveal from '../../framermotion/WordReveal';
import upcomingImg from '../../assets/upcoming.webp';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 40 },
};

const UpcomingTrip = () => {
  const [latestTrip, setLatestTrip] = useState(null);
     const [loading,setLoading]= useState(true);
      const navigate = useNavigate();
       

  useEffect(() => {
    const fetchLatestTrip = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/users/getsavetrip",
          { withCredentials: true }
        );
        let fetchedTrips = res.data.data || [];

        // Sort by createdAt (latest first)
        fetchedTrips.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Keep only the latest trip
        if (fetchedTrips.length > 0) {
          setLatestTrip(fetchedTrips[0]);
        }
      } catch (err) {
        console.error("Error fetching latest trip:", err);
      }
    };
    fetchLatestTrip();
  }, []);

  const [user,setUser] = useState(null)
      useEffect(() => {
        const fetchUser = async () => {
          try {
            const res = await axios.get(
              "http://localhost:5000/api/v1/users/getCurrentUser",
              { withCredentials: true }
            );
            setUser(res.data.data);
          } catch {
            toast.error("Session expired");
            navigate("/");
          } finally {
            setLoading(false);
          }
        };
        fetchUser();
      }, [navigate]);

  return (
    <motion.div
      key="upcoming"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
      className="p-4 sm:p-8 rounded-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8 w-full min-h-[210px]"
    >
      {/* Left Info Section */}
      <div className="flex-1 w-full text-center md:text-left space-y-2">
        <WordByWordReveal
          text="Upcoming Trip"
          className="text-xl sm:text-2xl md:text-3xl text-white font-bold"
          delay={0.6}
        />
       
         {!loading && user && (
 <WordByWordReveal
          text={
            latestTrip
              ? `Summer in ${latestTrip.destination}`
              : "No trips planned yet"
          }
          className="text-lg sm:text-xl text-white/80 mt-4"
          delay={0.4}
        />
)}
        <WordByWordReveal
          text={
            latestTrip
              ? `${new Date(latestTrip.startDate).toLocaleDateString()} – ${new Date(
                  latestTrip.returnDate
                ).toLocaleDateString()}`
              : ""
          }
          className="text-base sm:text-lg text-white/50 mb-6"
          delay={0.6}
        />
        {latestTrip  &&  (<div className="mb-6 flex justify-center md:justify-start">
          <Button  onClick={()=>navigate(`/full-trip/${latestTrip._id}`,{ state: { trip: latestTrip } })}>View Trip</Button>
        </div>)}
        
      </div>

      {/* Right Image Section */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="max-w-xs md:w-80 h-40 sm:h-48 md:h-44 rounded-xl overflow-hidden flex-shrink-0"
      >
        <img
          src={upcomingImg}
          alt="Upcoming trip"
          className="w-full h-full object-cover rounded-xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default UpcomingTrip;
