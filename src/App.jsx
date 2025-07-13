import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import Dashboard from './Pages/Dashboard/Dashboard';
// import SideBar from './components/SideBar/SideBar';
import { Outlet } from 'react-router-dom';


 function App() {
  return (
     <div className="flex w-full bg-[#0f0b1d]">
     
      <div className=" w-full min-h-screen bg-[#0f0b1d] p-4">
        <Outlet />
      </div>
    </div>
  );
}

export  {App}
