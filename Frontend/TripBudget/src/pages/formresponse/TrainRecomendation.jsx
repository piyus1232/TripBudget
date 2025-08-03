import React from 'react';

function TrainRecommendation() {
  return (
    <div className=" p-6 rounded-2xl shadow-md mb-1 ml-7 ">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6">
        Top Train Recommendations
      </h2>

      {/* Going Trains Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
          <thead className="bg-[#353045] text-white">
            <tr>
              <th className="px-6 py-3">Train Name</th>
              <th className="px-6 py-3">Departure Time & Arrival Time</th>
              <th className="px-6 py-3">Fare</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-t border-[#444056]">
              <td className="px-6 py-4 text-green-400 font-medium">Express 123</td>
              <td className="px-6 py-4">10:00 AM - 6:00 PM</td>
              <td className="px-6 py-4 text-cyan-400 font-medium">₹2,000</td>
              <td className="px-6 py-4">8 hours</td>
            </tr>
            <tr className="border-t border-[#444056]">
              <td className="px-6 py-4 text-green-400 font-medium">Superfast 456</td>
              <td className="px-6 py-4">12:00 PM - 8:00 PM</td>
              <td className="px-6 py-4 text-cyan-400 font-medium">₹2,500</td>
              <td className="px-6 py-4">8 hours</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Return Trains Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left table-auto bg-[#29263b] rounded-xl overflow-hidden">
          <thead className="bg-[#353045] text-white">
            <tr>
              <th className="px-6 py-3">Train Name</th>
              <th className="px-6 py-3">Departure Time & Arrival Time</th>
              <th className="px-6 py-3">Fare</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-t border-[#444056]">
              <td className="px-6 py-4 text-green-400 font-medium">Express 789</td>
              <td className="px-6 py-4">10:00 AM - 6:00 PM</td>
              <td className="px-6 py-4 text-cyan-400 font-medium">₹2,000</td>
              <td className="px-6 py-4">8 hours</td>
            </tr>
            <tr className="border-t border-[#444056]">
              <td className="px-6 py-4 text-green-400 font-medium">Superfast 012</td>
              <td className="px-6 py-4">12:00 PM - 8:00 PM</td>
              <td className="px-6 py-4 text-cyan-400 font-medium">₹2,500</td>
              <td className="px-6 py-4">8 hours</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrainRecommendation;
