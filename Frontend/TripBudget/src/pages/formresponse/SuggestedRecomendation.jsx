import React from 'react';
import Card from '../../components/utils/Card';

// Dummy Data Example (Replace with actual Response prop or state)
const Response = [
  {
    hotelname: 'The Grand Hotel',
    hoteltype: 'Hotel',
    hotelbudget: '₹4,500',
    image: '/zostel-jaipur.jpg',
  },
  {
    hotelname: 'Backpackers Hostel',
    hoteltype: 'Hostel',
    hotelbudget: '₹1,200',
    image: '/zostel.jpg',
  },
  {
    hotelname: 'Cozy Home',
    hoteltype: 'Homestay',
    hotelbudget: '₹2,800',
    image: '/hotel.avif',
  },
  {
    hotelname: 'Luxury Suites',
    hoteltype: 'Hotel',
    hotelbudget: '₹8,900',
    image: '/zostel-aurangabad.jpg',
  },
];

function SuggestedRecommendation() {
  return (
    <div className="mb-10 ml-7 ">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6 ml-10">
        Suggested Accommodations
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-7">
        {Response.map((res, index) => (
      <Card key={index} className="p-0 flex flex-col overflow-hidden bg-[#1f1a2e] hover:shadow-xl transition-all">
  <div className="w-full h-40">
    <img
      src={res.image}
      alt={res.hotelname}
      className="w-full h-full object-cover"
    />
  </div>
  <div className="p-5">
    <h3 className="text-white text-lg font-semibold mb-1">{res.hotelname}</h3>
    <p className="text-gray-400 text-sm mb-1">{res.hoteltype}</p>
    <p className="text-green-400 text-sm font-medium">
      {res.hotelbudget} <span className="text-gray-400">per night</span>
    </p>
  </div>
</Card>



        ))}
      </div>
    </div>
  );
}

export default SuggestedRecommendation;
