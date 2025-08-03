import React from 'react';
import Card from '../../components/utils/Card';

function TripsSummary() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-10 mb-10">
      {/* Left: Trip Info Box */}
      <div className="flex-[1.8] bg-[#1f1a2e] p-6 rounded-2xl shadow-md w-full md:w-auto  ">
        <h1 className="text-2xl md:text-3xl font-bold text-green-300 mb-2">Trip to Jaipur</h1>
        <p className="text-gray-400 mb-1">Sep 12 - Sep 18</p>
        <p className="text-lg font-semibold text-green-400">₹12,000</p>
      </div>

      {/* Right: Freestanding Image */}
      <div className="flex-1">
        <Card className="shadow-md ml-18">
          <img
            src="/Master.webp"
            alt="Jaipur"
            className="h-45  object-cover rounded-xl "
          />
        </Card>
      </div>
    </div>
  );
}

export default TripsSummary;
