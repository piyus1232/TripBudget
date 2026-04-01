import React, { useEffect, useMemo, useState } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import { motion } from 'framer-motion';
import TypingText from '../../framermotion/TypingText';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaTrain,
  FaHotel,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaRupeeSign,
  FaFilePdf,
  FaEye,
  FaTrash,
  FaSearch,
} from 'react-icons/fa';
import PageLoader from '../../components/utils/PageLoader';
import { toast } from 'react-toastify';
import { apiUrl } from '../../conf/api.js';

function tripSearchBlob(trip) {
  const parts = [
    trip.destination,
    trip.startDate && new Date(trip.startDate).toLocaleDateString(),
    trip.returnDate && new Date(trip.returnDate).toLocaleDateString(),
    String(trip.travelers ?? ''),
    String(trip.totalfare ?? ''),
    trip.cheapestOutTrain?.train_base?.train_no,
    trip.cheapestOutTrain?.train_base?.train_name,
    trip.cheapestReturnTrain?.train_base?.train_no,
    trip.cheapestReturnTrain?.train_base?.train_name,
    trip.hotels?.hotels?.name,
  ];
  const hotels = trip.hotels?.hotels;
  if (Array.isArray(hotels)) {
    hotels.forEach((h) => parts.push(h?.name));
  }
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function SavedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  /** { id, destination } | null */
  const [confirmOne, setConfirmOne] = useState(null);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [deleteAllInput, setDeleteAllInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl('/api/v1/users/getsavetrip'), {
        withCredentials: true,
      });
      setTrips(res.data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      toast.error('Could not load saved trips');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    try {
      await axios.delete(apiUrl(`/api/v1/users/getsavetrip/${id}`), {
        withCredentials: true,
      });
      setTrips((prev) => prev.filter((trip) => trip._id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      console.error('Error deleting trip:', err);
      toast.error('Could not delete trip');
    }
  };

  const runDeleteAll = async () => {
    if (deleteAllInput.trim() !== 'DELETE') {
      toast.error('Type DELETE exactly to confirm');
      return;
    }
    setDeletingAll(true);
    try {
      await axios.delete(apiUrl('/api/v1/users/getsavetrip/all'), {
        withCredentials: true,
      });
      setTrips([]);
      setSearchQuery('');
      setConfirmAllOpen(false);
      setDeleteAllInput('');
      toast.success('All trips removed');
    } catch (err) {
      console.error('Error deleting all trips:', err);
      toast.error('Could not delete all trips');
    } finally {
      setDeletingAll(false);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteAllInput('');
    setConfirmAllOpen(true);
  };

  const filteredTrips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((trip) => tripSearchBlob(trip).includes(q));
  }, [trips, searchQuery]);

  const formatTotalFare = (tf) => {
    const n = Number(tf);
    return Number.isFinite(n) ? Math.round(n) : '—';
  };

  const exportPDF = (trip) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Trip to ${trip.destination}`, 10, 15);

    doc.setFontSize(12);
    let yOffset = 30;

    if (trip.cheapestOutTrain) {
      doc.text(
        `Out Train: ${trip.cheapestOutTrain.train_base.train_no} ${trip.cheapestOutTrain.train_base.train_name}`,
        10,
        yOffset
      );
      yOffset += 10;
    }
    if (trip.cheapestReturnTrain) {
      doc.text(
        `Return Train: ${trip.cheapestReturnTrain.train_base.train_no} ${trip.cheapestReturnTrain.train_base.train_name}`,
        10,
        yOffset
      );
      yOffset += 10;
    }

    doc.text(`Hotel: ${trip.hotels?.hotels?.name || 'N/A'}`, 10, yOffset);
    yOffset += 10;

    if (trip.places?.places?.length) {
      doc.text(
        `Places: ${trip.places.places.slice(0, 3).map((p) => p.name).join(', ')}`,
        10,
        yOffset
      );
      yOffset += 10;
    } else {
      doc.text('Places: N/A', 10, yOffset);
      yOffset += 10;
    }

    doc.text(`Travelers: ${trip.travelers || 'N/A'}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Start Date: ${trip.startDate}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Return Date: ${trip.returnDate}`, 10, yOffset);
    yOffset += 10;
    doc.text(`Total Fare: ${formatTotalFare(trip.totalfare)}`, 10, yOffset);

    doc.save(`${trip.destination}-trip.pdf`);
  };

  if (loading) {
    return (
      <PageLoader
        message="Loading saved trips"
        subMessage="Fetching your itineraries…"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#171221] flex w-full max-w-[100vw] min-w-0">
      {/* Confirm delete one trip */}
      {confirmOne && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-one-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-purple-800/50 bg-[#1f1a2e] p-6 shadow-2xl">
            <h2 id="confirm-one-title" className="text-lg font-semibold text-white">
              Delete this trip?
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Remove saved trip to <span className="text-cyan-300">{confirmOne.destination}</span>. This
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10"
                onClick={() => setConfirmOne(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                onClick={async () => {
                  const id = confirmOne.id;
                  setConfirmOne(null);
                  await deleteTrip(id);
                }}
              >
                Delete trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete all */}
      {confirmAllOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-all-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-[#1f1a2e] p-6 shadow-2xl">
            <h2 id="confirm-all-title" className="text-lg font-semibold text-red-200">
              Delete all trips
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              This removes every saved trip for your account. Type{' '}
              <strong className="text-white">DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteAllInput}
              onChange={(e) => setDeleteAllInput(e.target.value)}
              placeholder="Type DELETE"
              className="mt-4 w-full rounded-xl border border-purple-800/40 bg-[#171221] px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
              autoComplete="off"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10"
                onClick={() => {
                  setConfirmAllOpen(false);
                  setDeleteAllInput('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAll}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                onClick={runDeleteAll}
              >
                {deletingAll ? 'Deleting…' : 'Delete all'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SideBar />

      <div className="flex-1 flex flex-col pt-14 sm:pt-3 ml-0 sm:ml-[280px] md:ml-[300px] px-4 sm:px-6 md:px-10 py-3 max-w-full min-w-0 overflow-x-hidden">
        <h1 className="text-3xl font-bold mb-6 text-white text-center flex items-center justify-center gap-2">
          <TypingText delay={0.19} text="Saved Trips" />
        </h1>

        {trips.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            No Saved Trips Found
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-xl">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/80" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by destination, dates, trains, hotels…"
                  className="w-full rounded-xl bg-[#1f1a2e] border border-purple-800/40 pl-10 pr-4 py-2.5 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={deletingAll}
                onClick={openDeleteAllModal}
                className="shrink-0 rounded-xl border border-red-800/60 bg-red-950/50 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-900/40 disabled:opacity-50"
              >
                {deletingAll ? 'Deleting…' : 'Delete all trips'}
              </button>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-purple-800/30 bg-[#1f1a2e]/50 py-12 text-gray-400">
                <p className="text-lg">No trips match your search</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-cyan-400 hover:underline text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 mb-0.5">
                {filteredTrips.map((trip, i) => (
                  <motion.div
                    key={trip._id}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(i * 0.05, 0.4),
                      ease: 'easeOut',
                    }}
                    className="bg-[#1f1a2e] border border-purple-800/40 rounded-xl shadow-lg p-5
                 w-full md:w-[48%] lg:w-[48%] min-h-[220px] flex flex-col justify-between
                 hover:shadow-purple-700/50 transition-all duration-300"
                  >
                    <h3 className="text-white text-xl font-semibold mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-purple-400 text-2xl" />{' '}
                      {trip.destination}
                    </h3>

                    {trip.cheapestOutTrain && trip.cheapestReturnTrain && (
                      <div className="flex items-start mb-2 gap-2 text-purple-300 text-sm">
                        <FaTrain className="mt-0.5 text-green-400 text-lg" />
                        <div className="flex flex-col gap-1">
                          <span>
                            {trip.cheapestOutTrain.train_base.train_no}{' '}
                            {trip.cheapestOutTrain.train_base.train_name}
                          </span>
                          <span>
                            {trip.cheapestReturnTrain.train_base.train_no}{' '}
                            {trip.cheapestReturnTrain.train_base.train_name}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start mb-2 gap-2 text-sm text-purple-300">
                      <FaHotel className="mt-0.5 text-green-400 text-lg" />
                      <div className="flex flex-wrap gap-1">
                        {trip.hotels?.hotels?.length > 0
                          ? trip.hotels.hotels.slice(0, 2).map((hotel, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-2 py-0.5 bg-purple-900/30 rounded-full border border-purple-500"
                              >
                                <FaHotel className="text-purple-400 text-xs" />{' '}
                                {hotel.name}
                              </span>
                            ))
                          : 'N/A'}
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 mb-2 space-y-1">
                      <p className="flex items-center gap-1">
                        <FaCalendarAlt className="text-green-400 text-lg" />{' '}
                        Start: {new Date(trip.startDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1">
                        <FaCalendarAlt className="text-red-400 text-lg" />{' '}
                        Return:{' '}
                        {new Date(trip.returnDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1">
                        <FaRupeeSign className="text-yellow-400 text-lg" />{' '}
                        {formatTotalFare(trip.totalfare)}
                      </p>
                      <p className="flex items-center gap-1">
                        <FaUsers className="text-blue-400 text-lg" />{' '}
                        {trip.travelers || 'N/A'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md text-sm"
                        onClick={() =>
                          navigate(`/full-trip/${trip._id}`, { state: { trip } })
                        }
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
                        onClick={() =>
                          setConfirmOne({ id: trip._id, destination: trip.destination })
                        }
                      >
                        <FaTrash className="text-base" /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SavedTrips;
