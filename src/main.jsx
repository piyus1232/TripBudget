import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {App} from './App';
import Dashboard from './Pages/Dashboard/Dashboard';
import { Provider } from 'react-redux';
import store from './store/store.js'
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Account from './pages/Account.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/DashBoard', element: <Dashboard /> },
      { path: '/login', element: <Login/>},
      { path: '/register', element: <Register/> },
      { path: '/Account', element: <Account/> },
    //   { path: '/BudgetEstimator', element: <BudgetEstimator /> },
    //   { path: '/Account', element: <Account /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <RouterProvider router={router} 
    
    
    
    />
  </Provider>
    
  </React.StrictMode>
);
