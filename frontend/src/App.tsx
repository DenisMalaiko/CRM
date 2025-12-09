import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Guard, AdminGuard } from "./router/guard";
import './App.css';

import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/header/Header';
import { useConfirmDialog } from './components/confirmDlg/ConfirmDlg';

// Auth
import Home from './pages/home/home';
import SignIn from './pages/auth/signIn/SignIn';
import SignUp from './pages/auth/signUp/SignUp';

// Admin
import SignInAdmin from './pages/admin/signIn/signInAdmin';
import SignUpAdmin from './pages/admin/signUp/signUpAdmin';
import Panel from './pages/admin/panel/panel';
import List from './pages/admin/list/list';
import Agency from './pages/admin/agency/agency';

// Profile
import Profile from "./pages/profile/Profile";
import Dashboard from './pages/profile/dashboard/Dashboard';
import Products from './pages/profile/products/Products';

// Clients
import Clients from "./pages/profile/clients/Clients";
import Client from "./pages/profile/clients/:id/Client";

// AI
import Accountant from "./pages/profile/ai/accountant/Accountant";
import Manager from "./pages/profile/ai/manager/Manager";
import Marketer from "./pages/profile/ai/marketer/Marketer";

import { useAppDispatch } from "./store/hooks";
import { useSignInByTokenMutation } from "./store/auth/authApi";
import { setUser, setAccessToken, logout } from "./store/auth/authSlice";


function App() {
  const ConfirmDialog = useConfirmDialog();
  const [ signInByToken ] = useSignInByTokenMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token: string | null = localStorage.getItem('accessToken');
    if (!token) return;

    const checkAuth = async () => {
      try {
        const response = await signInByToken(token).unwrap();
        dispatch(setUser(response.data.user));
        dispatch(setAccessToken(response.data.accessToken));

        toast.success(response.message);
        navigate("/profile/dashboard");
      } catch (error) {
        dispatch(logout());
      }
    }

    checkAuth();
  }, [])

  return (
    <div className="App">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/admin/signIn" element={<SignInAdmin />} />
        <Route path="/admin/signUp" element={<SignUpAdmin />} />

        <Route
          path="/profile"
          element={
            <Guard>
              <Profile />
            </Guard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />

          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId" element={<Client />} />

          <Route path="marketer" element={<Marketer />} />
        </Route>


        <Route
          path="/admin"
          element={
            <AdminGuard>
              <Panel />
            </AdminGuard>
          }
        >
          <Route path="list" element={<List />} />
          <Route path="list/:id" element={<Agency />} />
        </Route>
      </Routes>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {ConfirmDialog}
    </div>
  );
}

export default App;
