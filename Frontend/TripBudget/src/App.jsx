import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import Dashboard from './pages/Dashboard/DashBoard';
// import SideBar from './components/SideBar/SideBar';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login, logout } from './conf/authSlice.js';
import { apiUrl } from './conf/api.js';
import PageLoader from './components/utils/PageLoader';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    axios
      .get(apiUrl('/api/v1/users/getCurrentUser'), { withCredentials: true })
      .then((userData) => {
        if (userData?.data?.data) {
          dispatch(login({ userdata: userData.data.data }));
        } else {
          dispatch(logout());
        }
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <PageLoader
        message="Starting TripBudget"
        subMessage="Restoring your session…"
      />
    );
  }

  return (
    <>
      <div className="flex w-full max-w-[100vw] overflow-x-hidden bg-[#171221]">
        <div className="min-h-screen w-full bg-[#171221] px-3 py-3 sm:p-4">
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
  );
}

export  {App}
