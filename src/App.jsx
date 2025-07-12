import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
// import HeroSection from './page/Dashboard/Herosection';
import TravelStats from './pages/Dashboard/TravelStats';
import HeroSection from './Pages/Dashboard/Herosection';



function App() {
 

  return (
    <>
      {/* <Outlet />
        <Sidebar /> */}
       
      <>
  {/* <Outlet />
      <Sidebar /> */}
  
  <div className="min-h-screen bg-[#171221] text-white px-4 md:px-10 py-10 space-y-10">
    
    {/* Hero Section */}
    <div className="max-w-6xl mx-auto">
      <HeroSection />
    </div>

    {/* Travel Stats */}
    <div className="max-w-6xl mx-auto">
      <TravelStats />
    </div>

  </div>
</>

     

  
    </>
  )
}

export default App
