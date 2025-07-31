import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";

import HeroSection from './Herosection';
import UpcomingTrip from './UpcomingTrip';
import TravelStats from './TravelStats';
import SideBar from '../../components/SideBar/SideBar';
import GroupTeaser from './GroupDiscussion';
import { useState,useEffect } from 'react';

const Dashboard = () => {
  // const isAuthenticated = useSelector((state) => state.auth.status);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate() 
  const [loading,setLoading]= useState(true)
  const [user,setUser] = useState(null)


  // 🚫 If not logged in, redirect to login
  
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/users/getCurrentUser", {
        withCredentials: true,
      });
     
      setUser(res.data.data);
    } catch {
      toast.error("Session expired");
    
    } finally {
      setLoading(false);
    }
  };

  fetchUser(); 
}, []);
useEffect(() => {
  if (!loading && !user) {
    navigate("/home");
  }
}, [loading,user, navigate]);
  return (
    <div className="flex flex-col sm:flex-row bg-[#171221] text-white min-h-screen w-full mb-4">
      {/* Sidebar */}
      <SideBar />
      {/* Main Content */}
      <main className="flex-1 w-full py-2 transition-all duration-300 ml-0 sm:ml-[280px] md:ml-[300px]">
        {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div> */}

    {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rotate-45 animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '4s'}} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-green-500/10 to-teal-500/10 rotate-12 animate-spin" style={{animationDuration: '20s'}} />
      </div> */}

        <div className="max-w-full w-full mx-auto px-6 flex flex-col gap-6" style={{ zoom: '0.75' }}>
          <HeroSection />
          <TravelStats />
          <UpcomingTrip />
          <GroupTeaser />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
