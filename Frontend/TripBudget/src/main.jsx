import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App } from './App';

import store from './store/store';
import Dashboard from './pages/Dashboard/DashBoard';

import Account from './pages/Account/Account';
import Landing from './pages/Landingpage/Landing';
import ContactPage from './pages/Landingpage/Contactus';
import AboutPage from './pages/Landingpage/AboutPage';
import PlanTrip from './pages/PlanTrip/PlanTrip';
import FormResponse from './pages/formresponse/formresponse';
import ExploreCities from './pages/ExploreCities/explorecities';
import SavedTrips from './pages/SavedTrips/savedtrips';
import FullResponse from './pages/fullresponse.jsx/fullresponse';
import HotelWithFood from './pages/formresponse/SuggestFoodoptions';
import HotelSavedFood from './pages/hotelsavedfood/hotelsavedfood';
import PlaceRoutePage from './pages/formresponse/PlaceRoutePage.jsx';
import PageNotFound from './pages/PageNotFound.jsx';
import GroupDiscussionComingSoon from './pages/GroupDiscussion/GroupDiscussionComingSoon.jsx';

// Single stable router — do not recreate when user logs in/out, or App remounts
// and the full-screen session loader would run again on every page / auth change.
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/Contact', element: <ContactPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/ExploreCities', element: <ExploreCities /> },
      { path: '/response', element: <FormResponse /> },
      { path: '/account', element: <Account /> },
      { path: '/plantrip', element: <PlanTrip /> },
      { path: '/MyTrips', element: <SavedTrips /> },
      { path: '/full-trip/:id', element: <FullResponse /> },
      { path: '/hotelfood/:id', element: <HotelWithFood /> },
      { path: '/hotelsavedfood/:id', element: <HotelSavedFood /> },
      { path: '/place/:placeId', element: <PlaceRoutePage /> },
      { path: '/GroupDiscussions', element: <GroupDiscussionComingSoon /> },
      { path: '/group-discussion', element: <GroupDiscussionComingSoon /> },
      { path: '*', element: <PageNotFound /> },
    ],
  },
]);

const Main = () => <RouterProvider router={router} />;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Main />
    </Provider>
  </React.StrictMode>
);
