import React from 'react';
import { useLocation } from 'react-router-dom';

// --- Helper to convert "09.25" to "09:25 AM" ---
function formatRailwayTime(timeStr) {
  const [hours, minutes] = timeStr.split('.').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// --- Helper to calculate duration, even across midnight ---
function calculateDuration(startStr, endStr) {
  const [startH, startM] = startStr.split('.').map(Number);
  const [endH, endM] = endStr.split('.').map(Number);

  const start = new Date(0, 0, 0, startH, startM);
  let end = new Date(0, 0, 0, endH, endM);

  if (end <= start) {
    end.setDate(end.getDate() + 1); // handle overnight trains
  }

  const diffMs = end - start;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHrs}h ${diffMins}m`;
}

function TrainRecommendation() {
  const location = useLocation();
  const { data } = location.state || {};

  const {
    destination,
    startDate,
    returnDate,
    cheapestOutTrain,
    secondCheapestOutTrain,
    cheapestReturnTrain,
    secondCheapestReturnTrain,
  } = data || {};

  // Filter out null/undefined trains
  const outboundTrains = [cheapestOutTrain, secondCheapestOutTrain].filter(Boolean);
  const returnTrains = [cheapestReturnTrain, secondCheapestReturnTrain].filter(Boolean);

  return (
    <div className="p-6 rounded-2xl shadow-md mb-1 ml-7">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6">
        Top Train Recommendations
      </h2>

      {/* 🚆 Outbound Trains */}
      <h3 className="text-xl font-semibold text-white mb-2">🚆 Outbound Trains (To Destination)</h3>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
          <thead className="bg-[#353045] text-white">
            <tr>
              <th className="px-6 py-3">Train Name</th>
              <th className="px-6 py-3">Departure & Arrival</th>
              <th className="px-6 py-3">Fare</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {outboundTrains.map((train, index) => (
              <tr key={index} className="border-t border-[#444056]">
                <td className="px-6 py-4 text-green-400 font-medium">
                  {train?.train_base?.train_name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {`${formatRailwayTime(train.train_base.from_time)} - ${formatRailwayTime(train.train_base.to_time)}`}
                </td>
                <td className="px-6 py-4 text-cyan-400 font-medium">
                  ₹{train?.fare?.fare?.totalFare?.general?.SL || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {calculateDuration(train.train_base.from_time, train.train_base.to_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🚆 Return Trains */}
      <h3 className="text-xl font-semibold text-white mb-2">🚆 Return Trains (Back to Source)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
          <thead className="bg-[#353045] text-white">
            <tr>
              <th className="px-6 py-3">Train Name</th>
              <th className="px-6 py-3">Departure & Arrival</th>
              <th className="px-6 py-3">Fare</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {returnTrains.map((train, index) => (
              <tr key={index} className="border-t border-[#444056]">
                <td className="px-6 py-4 text-green-400 font-medium">
                  {train?.train_base?.train_name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {`${formatRailwayTime(train.train_base.from_time)} - ${formatRailwayTime(train.train_base.to_time)}`}
                </td>
                <td className="px-6 py-4 text-cyan-400 font-medium">
                  ₹{train?.fare?.fare?.totalFare?.general?.SL || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {calculateDuration(train.train_base.from_time, train.train_base.to_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrainRecommendation;
