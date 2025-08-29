// HotelWithFood.jsx
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getCached, setCached, preload } from "../../../src/components/utils/imageCache.js";

function HotelWithFood() {
  const { state } = useLocation();
  const { hotel, destination, hotelImage, preloadedFoodImages } = state || {};

  // ⬇️ Track expand state per-card (by id)
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const defaultImage = "./hotel.avif";
  const [heroImage, setHeroImage] = useState(hotelImage || defaultImage);
  const [foodImages, setFoodImages] = useState(preloadedFoodImages || {});

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => { window.history.scrollRestoration = prev; };
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!hotel?.id || !destination) return;

    (async () => {
      const hotelKey = `${destination}:${hotel.id}`;
      if (!getCached("hotel", hotelKey)) {
        try {
          const res = await axios.post("http://localhost:5000/api/hotel-image", {
            name: hotel.name, hotelId: hotel.id, city: destination,
          }, { withCredentials: true });

          const url = (res.data?.image && typeof res.data.image === "string")
            ? res.data.image : defaultImage;

          setCached("hotel", hotelKey, url);
          preload(url);
          setHeroImage(url);
        } catch {
          setHeroImage((prev) => prev || defaultImage);
        }
      }
    })();

    (async () => {
      const foods = hotel?.foodOptions || [];
      if (!foods.length) return;

      const updates = {};
      await Promise.all(foods.map(async (food) => {
        const key = `${hotel.id}:${food.foodid}`;
        if (getCached("food", key)) return;

        try {
          const res = await axios.post("http://localhost:5000/api/foodimage", {
            name: food.name, foodid: food.foodid, hotelId: hotel.id, city: destination,
          }, { withCredentials: true });

          const url = (res.data?.image && typeof res.data.image === "string")
            ? res.data.image : defaultImage;

          setCached("food", key, url);
          preload(url);
          updates[food.name] = url;
        } catch {
          updates[food.name] = defaultImage;
        }
      }));

      if (Object.keys(updates).length) {
        setFoodImages((prev) => ({ ...prev, ...updates }));
      }
    })();
  }, [hotel?.id, destination]);

  if (!hotel) return <p className="text-white p-10">No hotel selected.</p>;

  return (
    <div className="px-6 sm:px-10 py-8 min-h-screen bg-[#171221]">
      {/* Hotel header */}
      <div className="flex items-center mb-8">
        <img
          src={heroImage || defaultImage}
          alt={hotel.name}
          className="w-24 h-24 object-cover rounded-lg mr-5"
          loading="eager"
          decoding="async"
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

      {/* Food options */}
      <h3 className="text-xl text-white font-semibold mb-5">Nearby Food Options</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {hotel.foodOptions?.length ? (
          hotel.foodOptions.map((food, idx) => {
            const id = food.foodid ?? idx;           // stable key
            const isOpen = !!expanded[id];
            const addr = food.address || "";         // use food's address
            const shortAddr = addr.slice(0, 30);

            return (
              <div key={id} className="bg-[#1b1730] rounded-2xl shadow-md hover:shadow-xl transition-all">
                <div className="w-full h-40 rounded-t-2xl overflow-hidden">
                  <img
                    src={foodImages[food.name] || defaultImage}
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
                      📍 {isOpen ? addr : shortAddr}
                    </span>
                    {addr.length > 30 && (
                      <button
                        className="ml-1 text-teal-400 hover:underline text-xs"
                        onClick={() => toggleExpand(id)}
                      >
                        {isOpen ? "Show less" : "Read more"}
                      </button>
                    )}
                  </p>

                  <span className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded mt-3 inline-block">
                    {food.priceText}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No food options available.</p>
        )}
      </div>
    </div>
  );
}

export default HotelWithFood;
