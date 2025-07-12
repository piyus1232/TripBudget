// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
// const router = createBrowserRouter([
//   {path:'/',
//     element: <App/>,
//      children: [
//       { path: '/', element: <Dashboard/> },
//       { path: '/MyTrips', element: <MyTrips/> },
//        { path: '/ExploreCities', element: <ExploreCities /> },
//         { path: '/PlanTrip', element: <PlanTrip /> },
//          { path: 'BudgetEstimator', element: <BudgetEstimator /> },
//           { path: '/Account', element: <Account /> },
           
       
       
//     ]
//   }
  
// ]

//   );


createRoot(document.getElementById('root')).render(
 
    <App />

)
