import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/header/Header';
import Home from './pages/home/home';
import SignIn from './pages/auth/signIn/SignIn';
import SignUp from './pages/auth/signUp/SignUp';

// Profile
import Profile from "./pages/profile/Profile";
import Dashboard from './pages/profile/dashboard/Dashboard';
import Products from './pages/profile/products/Products';
import Clients from "./pages/profile/clients/Clients";
import Orders from "./pages/profile/orders/Orders"

// AI
import Accountant from "./pages/profile/ai/accountant/Accountant";
import Manager from "./pages/profile/ai/manager/Manager";
import Marketer from "./pages/profile/ai/marketer/Marketer";

function App() {
  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />

        <Route path="/profile" element={<Profile />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />
          <Route path="orders" element={<Orders />} />

          <Route path="accountant" element={<Accountant />} />
          <Route path="manager" element={<Manager />} />
          <Route path="marketer" element={<Marketer />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // "light" | "dark" | "colored"
      />
    </div>
  );
}

export default App;
