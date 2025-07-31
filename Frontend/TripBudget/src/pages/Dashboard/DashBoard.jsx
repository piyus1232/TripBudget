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
      const res = await axios.get("http://localhost:5000/api/v1/users/getCurrentUser", {
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
    navigate("/");
  }
}, [loading,user, navigate]);
  return (
    <div className="flex flex-col sm:flex-row bg-[#171221] text-white min-h-screen w-full mb-4">
      {/* Sidebar */}
      <SideBar />
      {/* Main Content */}
      <main className="flex-1 w-full py-2 transition-all duration-300 ml-0 sm:ml-[280px] md:ml-[300px]">
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
