import React from 'react';
import { useState,useEffect } from 'react';
import SideBar from '../../components/SideBar/SideBar';
import TripsSummary from './TripsSummary';
import TrainRecommendation from './TrainRecomendation';
import SuggestedRecommendation from './suggestedRecomendation';
// import HotelWithFood from './SuggestFoodoptions';
import PlacestoVisit from './PlacestoVisit';
// import { useNavigate } from 'react-router-dom';

function FormResponse() {
    // const navigate = useNavigate() 
    // const [loading,setLoading]= useState(true)
    // const [user,setUser] = useState(null)
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5000/api/v1/users/getCurrentUser", {
  //         withCredentials: true,
  //       });
       
  //       setUser(res.data.data);
  //     } catch {
       
  //       toast.error("Session expired");
      
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchUser(); 
  // }, []);
  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/");
  //   }
  // }, [loading,user, navigate]);
  return (
    <div className="min-h-screen bg-[#171221] text-white flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-[#2a233f]">
        <SideBar />
      </div>

      {/* Main Sections */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12">
        <TripsSummary />
        <TrainRecommendation />
        <SuggestedRecommendation />
  {/* <HotelWithFood/> */}
        <PlacestoVisit />
      </div>
    </div>
  );
}

export default FormResponse;
