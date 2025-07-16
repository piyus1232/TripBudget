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
  const [loading,setLoading]= useState()
  const [user,setUser] = useState(true)


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
    navigate("/login");
  }
}, [loading,user, navigate]);
  return (
    <div className="min-h-screen bg-[#171221] text-white flex flex-col sm:flex-row">
      
      <SideBar  />
      <div className="ml-0 sm:ml-[280px] md:ml-[300px] p-1 w-full">
        <div className="mx-4 sm:mx-8 lg:ml-20 flex flex-col gap-8">
          <HeroSection />
          <TravelStats />
          <UpcomingTrip />
          <GroupTeaser />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
