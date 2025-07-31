import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { App } from './App';

import store from './store/store';
import Dashboard from './pages/Dashboard/DashBoard';

import Account from './pages/Account/Account';
import Landing from './pages/Landingpage/Landing';
import ContactPage from './pages/Landingpage/Contactus';
import AboutPage from './pages/Landingpage/AboutPage';
import PlanTrip from './pages/PlanTrip/PlanTrip';

// Function to build router based on login state
const buildRouter = (isLoggedIn) =>
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: isLoggedIn
        ? [
            { path: '/', element: <Landing/> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/account', element: <Account /> },
                // { path: '/Contact', element: <ContactPage/> },
              
               
            
               
            
          ]
        : [
            { path: '/', element: <Landing /> },
           { path: '/Contact', element: <ContactPage/> },
              // { path: '/', element: <Dashboard /> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/account', element: <Account /> },
            { path: '/about', element: <AboutPage /> },
             { path: '/plantrip', element: <PlanTrip /> },
          ],
    },
  ]);

// Temporary wrapper to access Redux store before rendering router
const Main = () => {
  const user = useSelector((state) => state.auth.userdata);
  const router = buildRouter(!!user); // ✅ check if user exists
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  </React.StrictMode>
);
