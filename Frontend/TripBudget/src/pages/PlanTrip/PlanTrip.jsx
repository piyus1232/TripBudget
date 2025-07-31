import React, { useState } from 'react';
import Card from '../../components/utils/Card';
import Button from '../../components/utils/Button';
import Input from '../../components/utils/Input';
import { useForm } from 'react-hook-form';
import SideBar from '../../components/SideBar/SideBar';
import { motion } from 'framer-motion';

function PlanTrip() {
  const {
    register,
    handleSubmit,
  } = useForm();

  // Manage local UI selections with useState
  const [budget, setBudget] = useState('medium');
  const [travelers, setTravelers] = useState('');
  const [transport, setTransport] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [food, setFood] = useState('');

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      budget,
      travelers,
      transport,
      accommodation,
      food
    };
    console.log('Final Submitted Data:', data);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 ml-80 w-285">
      <SideBar />

      {/* Hero Section */}
      <motion.div
        className="  border bg-gradient-to-br from-[#1f1b2d] to-[#261e38] border-[#604490] rounded-xl p-6 mb-8 text-white shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-500">Advanced Budget Trip Planner</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <Card className="bg-[#2f2748] hover:bg-[#3b2f59] text-white py-4 transition">
            <h2 className="text-2xl font-bold">2K+</h2>
            <p className="text-sm text-gray-300">Trips Planned</p>
          </Card>
          <Card className="bg-[#2f2748] hover:bg-[#3b2f59] text-white py-4 transition">
            <h2 className="text-2xl font-bold">₹500+</h2>
            <p className="text-sm text-gray-300">Avg Savings</p>
          </Card>
          <Card className="bg-[#2f2748] hover:bg-[#3b2f59] text-white py-4 transition">
            <h2 className="text-2xl font-bold">4.9★</h2>
            <p className="text-sm text-gray-300">User Rating</p>
          </Card>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#1e1b2e] text-white rounded-xl p-6 shadow-xl space-y-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-center text-purple-400">Plan Your Budget Trip</h2>

        {/* Locations & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="From" {...register("from")} placeholder="Jaipur" />
          <Input label="To" {...register("to")} placeholder="Mumbai" />
          <Input label="Start Date" type="date" {...register("startDate")} />
          <Input label="End Date" type="date" {...register("endDate")} />
        </div>

        {/* Travelers */}
        <div>
          <label className="block mb-2 font-medium text-sm text-gray-300">Travelers</label>
          <div className="flex gap-3">
            {['1', '2', '3', '4+'].map((val) => (
              <Button
                key={val}
                type="button"
                className={`px-4 py-2 rounded ${travelers === val ? 'bg-purple-600' : 'bg-[#322E3B]'} text-white`}
                onClick={() => setTravelers(val)}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        {/* Budget Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['low', 'medium'].map((b) => (
            <Card
              key={b}
              onClick={() => setBudget(b)}
              className={`p-4 cursor-pointer rounded-xl text-center transition duration-200 ${
                budget === b ? 'bg-purple-600' : 'bg-[#2b2540]'
              }`}
            >
              <h3 className="font-semibold text-white capitalize">{b} Budget</h3>
              <p className="text-sm text-gray-300">
                {b === 'low'
                  ? 'Affordable stays, local transport, street food'
                  : 'Comfortable hotels, mixed transport, dining'}
              </p>
            </Card>
          ))}
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          {/* Transport */}
          <div>
            <label className="block font-medium mb-2 text-sm text-gray-300">Preferred Transport</label>
            <div className="flex gap-3 flex-wrap">
              {['Bus', 'Train', 'Flight'].map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  className={`px-4 py-2 rounded ${transport === mode ? 'bg-purple-600' : 'bg-[#322E3B]'} text-white`}
                  onClick={() => setTransport(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <label className="block font-medium mb-2 text-sm text-gray-300">Accommodation Type</label>
            <div className="flex gap-3 flex-wrap">
              {['Hostel', 'Lodge', 'Hotel'].map((acc) => (
                <Button
                  key={acc}
                  type="button"
                  className={`px-4 py-2 rounded ${accommodation === acc ? 'bg-purple-600' : 'bg-[#322E3B]'} text-white`}
                  onClick={() => setAccommodation(acc)}
                >
                  {acc}
                </Button>
              ))}
            </div>
          </div>

          {/* Food Preferences */}
          <div>
            <label className="block font-medium mb-2 text-sm text-gray-300">Food Preferences</label>
            <div className="flex gap-3 flex-wrap">
              {['Veg', 'Non-Veg', 'Local'].map((f) => (
                <Button
                  key={f}
                  type="button"
                  className={`px-4 py-2 rounded ${food === f ? 'bg-purple-600' : 'bg-[#322E3B]'} text-white`}
                  onClick={() => setFood(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center pt-4">
          <Button
            type="submit"
           
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            Generate Budget Plan
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

export default PlanTrip;
