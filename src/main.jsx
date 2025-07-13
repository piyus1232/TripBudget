import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {App} from './App';
import Dashboard from './Pages/Dashboard/Dashboard';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/DashBoard', element: <Dashboard /> },
    //   { path: '/MyTrips', element: <MyTrips /> },
    //   { path: '/ExploreCities', element: <ExploreCities /> },
    //   { path: '/PlanTrip', element: <PlanTrip /> },
    //   { path: '/BudgetEstimator', element: <BudgetEstimator /> },
    //   { path: '/Account', element: <Account /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
