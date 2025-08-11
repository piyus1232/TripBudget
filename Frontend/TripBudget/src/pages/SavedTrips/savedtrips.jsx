import React, { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import { motion } from 'framer-motion';
import TypingText from '../../framermotion/TypingText';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function SavedTrips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/users/getsavetrip", {
        withCredentials: true,
      });
      console.log("API Response:", res.data);
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

      {trips.length === 0 && (
        <div className="flex-1 flex items-center ml-115 mb-30 text-white font-bold text-2xl">
          No Saved Trips Found
        </div>
      )}

      {trips.length > 0 && (
        <div className="flex-1 flex flex-col px-10">
          <h1 className="text-3xl font-bold mb-8 text-white text-center">
            <TypingText delay={0.19} text="Saved Trips" />
          </h1>

          <div className="flex flex-col gap-7">
            {trips.map((trip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  delay: i * 0.9,
                  ease: 'easeOut'
                }}
                className="bg-[#171221] border border-purple-800/70 rounded-xl shadow-lg p-6 w-full ml-3"
              >
                <h3 className="text-white text-lg font-semibold mb-2 capitalize">{trip.destination}</h3>

                {/* Trains */}
                {trip.cheapestOutTrain && trip.cheapestReturnTrain && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <p className="text-xs text-green-400">
                      <span className="font-extrabold">Trains:</span>
                    </p>
                    {[
                      `${trip.cheapestOutTrain.train_base.train_no} ${trip.cheapestOutTrain.train_base.train_name}`,
                      `${trip.cheapestReturnTrain.train_base.train_no} ${trip.cheapestReturnTrain.train_base.train_name}`
                    ].map((train, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 border border-purple-500 rounded-full text-purple-300 text-xs"
                      >
                        {train}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hotels */}
                <p className="text-sm text-gray-100 mb-2 flex flex-wrap gap-2">
                  <span className="font-medium text-green-400">Hotels:</span>
                  {trip.hotels?.hotels?.slice(0, 6).map((hotel, idx) => (
                    <span
                      key={idx}
                      className="bg-transparent border border-purple-500 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {hotel.name}
                    </span>
                  )) || "N/A"}
                </p>

                {/* Places */}
                <div className="flex flex-wrap gap-2 mb-2 text-green-400">
                  Places:
                  {trip.places?.places?.slice(0, 6).map((place, index) => (
                    <span
                      key={index}
                      className="bg-transparent border border-purple-500 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {place.name}
                    </span>
                  ))}
                </div>

                {/* Dates and Fare */}
                <p className="text-xs text-green-400 mb-2">
                  <span className="font-bold">Start Date:</span>{" "}
                  {new Date(trip.startDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                  <span className="mx-1">|</span>
                  <span className="font-bold">Return Date:</span>{" "}
                  {new Date(trip.returnDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
                <p className="text-xs text-green-400 mb-3">
                  <span className="font-bold">Total Fare:</span> ₹{Math.round(trip.totalfare)}
                </p>
                <p className="text-xs text-white mb-1">
                  <span className="font-extrabold">Travelers:</span> {trip.travelers || "N/A"}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                    onClick={() => navigate(`/full-trip/${trip._id}`, { state: { trip } })}
                  >
                    View Full Trip
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    onClick={() => exportPDF(trip)}
                  >
                    Export to PDF
                  </button>
               <button
  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
  onClick={() => {
    if (window.confirm(`Are you sure you want to delete the trip to ${trip.destination}?`)) {
      deleteTrip(trip._id);
    }
  }}
>
  Delete
</button>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedTrips;
