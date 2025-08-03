import React from 'react';
import Card from '../../components/utils/Card';

const Response = [
  {
    placename: 'Hawa Mahal',
    distance: '1.2 km away',
    image: '/images/hawa-mahal.svg',
  },
  {
    placename: 'Amber Fort',
    distance: '11.4 km away',
    image: '/images/amber-fort.svg',
  },
  {
    placename: 'City Palace',
    distance: '3.0 km away',
    image: '/images/city-palace.svg',
  },
  {
    placename: 'Jantar Mantar',
    distance: '2.5 km away',
    image: '/images/jantar-mantar.svg',
  },
];

function PlacestoVisit() {
  return (
    <div className="mb-10 ml-13">
      <h2 className="text-2xl font-semibold text-white border-l-4 border-teal-400 pl-3 mb-6  ml-7 ">
        Nearby Places to Visit
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ml-7">
        {Response.map((res, index) => (
          <Card key={index} className="p-5 flex flex-col items-start bg-[#1f1a2e] hover:shadow-xl transition-all ml-2">
            <img
              src={res.image}
              alt={res.placename}
              className="mb-4 w-full h-36 object-contain rounded-md"
            />
            <h3 className="text-white text-lg font-semibold mb-1">{res.placename}</h3>
            <p className="text-gray-400 text-sm">📍 {res.distance}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default PlacestoVisit;
