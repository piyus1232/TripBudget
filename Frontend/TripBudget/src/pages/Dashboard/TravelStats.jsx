import React from 'react';
import Card from '../../components/utils/Card';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 40 },
};

const TravelStats = () => {

   const [latestTrip, setLatestTrip] = useState(null);
     const [trips, setTrips] = useState([]);
  useEffect(() => {
  const fetchSecondLastTrip = async () => {
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

      // Get the second last trip
      if (fetchedTrips.length > 1) {
        setLatestTrip(fetchedTrips[1]);
      }
    } catch (err) {
      console.error("Error fetching second last trip:", err);
    }
  };
   const fetchAllTrips = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/users/getsavetrip",
          { withCredentials: true }
        );
        let fetchedTrips = res.data.data || [];

        // Sort newest first
        fetchedTrips.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTrips(fetchedTrips);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    };

   
  fetchSecondLastTrip();
   fetchAllTrips();
}, []);

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
      {['Total Trips Planned', 'Average Budget', 'Last Destination'].map((title, index) => (
        <motion.div
          key={index}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 1.4,
            delay: 0.5,
            ease: 'easeInOut',
          }}
          whileHover={{
            scale: 1.04, // just a tiny "towards you" effect
            transition: { type: 'spring', stiffness: 100 },
          }}
          className="w-full"
        >
          <Card className="bg-transparent border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col items-center">
            <h3 className="text-xs sm:text-sm md:text-base uppercase text-white/80 tracking-wide text-center">
              {title}
            </h3>

            <p className="text-2xl sm:text-3xl font-bold text-white/ mt-2 text-center">
              {
              title === 'Total Trips Planned' && (trips?.length > 0 ? trips.length : '-')
              }
              {title === 'Average Budget' && '1500' }
              {title === 'Last Destination' &&   (latestTrip?.destination || '-')}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TravelStats;
