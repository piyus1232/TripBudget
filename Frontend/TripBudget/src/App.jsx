import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import Dashboard from './pages/Dashboard/DashBoard';
// import SideBar from './components/SideBar/SideBar';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login, logout } from './conf/authSlice.js';

 function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
     axios.post('http://localhost:3000/api/v1/users/getCurrentUser',{},{withCredentials: true})
    .then((userData) => {
      if (userData) {
        dispatch(login({userdata: userData.data.data}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  return  !loading ? (
    <>
     <div className="flex w-full bg-[#0f0b1d]">
     
      <div className=" w-full min-h-screen bg-[#0f0b1d] p-4">
        <Outlet />
      </div>
    </div>
     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </>
  ):null
}

export  {App}
