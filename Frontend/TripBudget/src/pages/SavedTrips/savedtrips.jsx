import React, { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import { motion } from 'framer-motion';
import TypingText from '../../framermotion/TypingText';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaTrain, FaHotel, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaRupeeSign, FaFilePdf, FaEye, FaTrash } from "react-icons/fa";

function SavedTrips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');


  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/users/getsavetrip", {
        withCredentials: true,
     
      });
      setTrips(res.data.data || []);
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  const deleteTrip = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/users/getsavetrip/${id}`, {
        
        withCredentials: true,
      });
      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== id));
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  const exportPDF = (trip) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Trip to ${trip.destination}`, 10, 15);

    doc.setFontSize(12);
    let yOffset = 30;

    if (trip.cheapestOutTrain) {
      doc.text(`Out Train: ${trip.cheapestOutTrain.train_base.train_no} ${trip.cheapestOutTrain.train_base.train_name}`, 10, yOffset);
      yOffset += 10;
    }
    if (trip.cheapestReturnTrain) {
      doc.text(`Return Train: ${trip.cheapestReturnTrain.train_base.train_no} ${trip.cheapestReturnTrain.train_base.train_name}`, 10, yOffset);
      yOffset += 10;
    }

    doc.text(`Hotel: ${trip.hotels?.hotels?.name || "N/A"}`, 10, yOffset);
    yOffset += 10;

    if (trip.places?.places?.length) {
      doc.text(`Places: ${trip.places.places.slice(0, 3).map(p => p.name).join(', ')}`, 10, yOffset);
      yOffset += 10;
    } else {
      doc.text(`Places: N/A`, 10, yOffset);
      yOffset += 10;
    }

    doc.text(`Travelers: ${trip.travelers || "N/A"}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Start Date: ${trip.startDate}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Return Date: ${trip.returnDate}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Total Fare: ${trip.totalfare}`, 10, yOffset);

    doc.save(`${trip.destination}-trip.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#171221] flex">
      <div className="w-64 min-h-screen bg-[#171221]">
        <SideBar />
      </div>

      <div className="flex-1 flex flex-col px-10 py-3">
        <h1 className="text-3xl font-bold mb-8 text-white text-center flex items-center justify-center gap-2">
          <TypingText delay={0.19} text="Saved Trips" />
        </h1>

        {trips.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            No Saved Trips Found
          </div>
        ) : (
         <div className="flex flex-wrap gap-6 mb-0.5">
  {trips.map((trip, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: i * 0.1,
        ease: 'easeOut'
      }}
      className="bg-[#1f1a2e] border border-purple-800/40 rounded-xl shadow-lg p-5
                 w-full md:w-[48%] lg:w-[48%] min-h-[220px] flex flex-col justify-between
                 hover:shadow-purple-700/50 transition-all duration-300 "
    >
      {/* Destination */}
      <h3 className="text-white text-xl font-semibold mb-3 flex items-center gap-2">
        <FaMapMarkerAlt className="text-purple-400 text-2xl" /> {trip.destination}
      </h3>

      {/* Trains */}
      {trip.cheapestOutTrain && trip.cheapestReturnTrain && (
        <div className="flex items-start mb-2 gap-2 text-purple-300 text-sm">
          <FaTrain className="mt-0.5 text-green-400 text-lg" />
          <div className="flex flex-col gap-1">
            <span>{trip.cheapestOutTrain.train_base.train_no} {trip.cheapestOutTrain.train_base.train_name}</span>
            <span>{trip.cheapestReturnTrain.train_base.train_no} {trip.cheapestReturnTrain.train_base.train_name}</span>
          </div>
        </div>
      )}

      {/* Hotels */}
      <div className="flex items-start mb-2 gap-2 text-sm text-purple-300">
        <FaHotel className="mt-0.5 text-green-400 text-lg" />
        <div className="flex flex-wrap gap-1">
          {trip.hotels?.hotels?.length > 0
            ? trip.hotels.hotels.slice(0, 2).map((hotel, idx) => (
                <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 rounded-full border border-purple-500">
                  <FaHotel className="text-purple-400 text-xs" /> {hotel.name}
                </span>
              ))
            : "N/A"}
        </div>
      </div>

      {/* Dates & Fare */}
      <div className="text-sm text-gray-300 mb-2 space-y-1">
        <p className="flex items-center gap-1"><FaCalendarAlt className="text-green-400 text-lg"/> Start: {new Date(trip.startDate).toLocaleDateString()}</p>
        <p className="flex items-center gap-1"><FaCalendarAlt className="text-red-400 text-lg"/> Return: {new Date(trip.returnDate).toLocaleDateString()}</p>
        <p className="flex items-center gap-1"><FaRupeeSign className="text-yellow-400 text-lg"/> {Math.round(trip.totalfare)}</p>
        <p className="flex items-center gap-1"><FaUsers className="text-blue-400 text-lg"/> {trip.travelers || "N/A"}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md text-sm"
          onClick={() => navigate(`/full-trip/${trip._id}`, { state: { trip } })}
        >
          <FaEye className="text-base" /> View
        </button>
        <button
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-sm"
          onClick={() => exportPDF(trip)}
        >
          <FaFilePdf className="text-base" /> PDF
        </button>
        <button
          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-sm"
          onClick={() => {
            if (window.confirm(`Delete trip to ${trip.destination}?`)) {
              deleteTrip(trip._id);
            }
          }}
        >
          <FaTrash className="text-base" /> Delete
        </button>
      </div>
    </motion.div>
  ))}
</div>

        )}
      </div>
    </div>
  );
}

export default SavedTrips;
