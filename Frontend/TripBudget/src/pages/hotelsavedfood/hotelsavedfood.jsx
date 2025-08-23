import React, { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function HotelSavedFood() {
  const { state } = useLocation();
  const { hotel } = state || {};
  const defaultImage = "./hotel.avif";
    const [expanded, setExpanded] = React.useState(false);

  // prevent browser restoring old scroll
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => { window.history.scrollRestoration = prev; };
    }
  }, []);

  // start at top on mount
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  if (!hotel) return <p className="text-white p-10">No hotel selected.</p>;

  return (
    <div className="px-6 sm:px-10 py-8 min-h-screen bg-[#171221]">
      <div className="flex items-center mb-8">
        <img
          src={hotel.photoURL || defaultImage}
          alt={hotel.name}
          className="w-24 h-24 object-cover rounded-lg mr-5"
        />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{hotel.name}</h2>
          <p className="text-gray-400 text-sm">{hotel.address}</p>
          <p className="text-green-400 text-sm font-medium mt-1">
            ₹{hotel.price ? Math.round(parseFloat(hotel.price) * 87.68) : "N/A"}{" "}
            <span className="text-gray-400">per night</span>
          </p>
        </div>
      </div>

      <h3 className="text-xl text-white font-semibold mb-5">Nearby Food Options</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {hotel.foodOptions?.length ? (
          hotel.foodOptions.map((food, idx) => (
            <div key={idx} className="bg-[#1b1730] rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-full h-40 rounded-t-2xl overflow-hidden">
                <img
                  src={food.photoURL || defaultImage}
                  alt={food.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold text-base line-clamp-1">{food.name}</h4>
                    
                  <span className="text-yellow-400 text-sm">⭐ {food.rating}</span>
                </div>
          <p className="text-gray-300 text-sm mt-2 mb-4">
                <span className="inline-block">
                  📍 {expanded ? food.address : hotel.address?.slice(0, 30)}
                </span>
                {hotel.address?.length > 30 && (
                  <button
                    className="ml-1 text-teal-400 hover:underline text-xs"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </p>
                <span className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded mt-3 inline-block">
                  {food.priceText}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No food options available.</p>
        )}
      </div>
    </div>
  );
}

export default HotelSavedFood;
