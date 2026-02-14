import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Guard, AdminGuard } from "./router/guard";
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';


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
import SignInAdmin from './pages/adminSuper/signIn/signInAdmin';
import SignUpAdmin from './pages/adminSuper/signUp/signUpAdmin';
import Panel from './pages/adminSuper/panel/panel';
import List from './pages/adminSuper/list/list';
import Agency from './pages/adminSuper/agency/agency';

// Profile
import Profile from "./pages/admin/Profile";
import Dashboard from './pages/admin/dashboard/Dashboard';
/*import Products from './pages/admin/products/Products';*/

// Businesses
import Businesses from "./pages/admin/business/Businesses";
import Business from "./pages/admin/business/:id/Business";
import BaseData from "./pages/admin/business/components/BaseData/BaseData";
import Products from "./pages/admin/business/components/Products/Products"
import Platforms from "./pages/admin/business/components/old/Platforms/Platforms"
import Profiles from "./pages/admin/business/components/Profiles/Profiles";
import Audiences from "./pages/admin/business/components/Audiences/Audiences";
import Creatives from "./pages/admin/business/components/Creatives/Creatives";
import Prompts from "./pages/admin/business/components/Prompts/Prompts";
import Settings from "./pages/admin/business/components/old/Settings/Settings";
import Competitors from "./pages/admin/business/components/Сompetitors/Competitors";
import Competitor from "./pages/admin/business/components/Сompetitors/:id/Competitor";

// AI
import Accountant from "./pages/admin/ai/accountant/Accountant";
import Manager from "./pages/admin/ai/manager/Manager";
/*import Marketer from "./pages/admin/ai/marketer/Marketer";*/

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
        navigate("/profile/businesses");
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

          <Route path="businesses" element={<Businesses />} />

          <Route path="businesses/:businessId" element={<Business />}>
            <Route path="baseData" element={<BaseData />} />
            <Route path="products" element={<Products />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="creatives" element={<Creatives />} />
            <Route path="platforms" element={<Platforms />} />
            <Route path="audiences" element={<Audiences />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="settings" element={<Settings />} />

            <Route path="competitors" element={<Competitors />}></Route>
            <Route path="competitors/:id" element={<Competitor/>} />
          </Route>
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
