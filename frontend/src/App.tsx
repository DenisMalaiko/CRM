import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Guard, AdminGuard } from "./router/guard";
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import {ToastContainer} from 'react-toastify';
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
import AdminGallery from "./pages/adminSuper/gallery/AdminGallery";

// Profile
import Profile from "./pages/admin/Profile";
import Dashboard from './pages/admin/dashboard/Dashboard';
/*import Products from './pages/admin/products/Products';*/

// Businesses
import Businesses from "./pages/admin/business/Businesses";
import Business from "./pages/admin/business/:id/Business";
import BaseData from "./pages/admin/business/components/Info/BaseData/BaseData";
import Products from "./pages/admin/business/components/Info/Products/Products"
import Profiles from "./pages/admin/business/components/Assets/Profiles/Profiles";
import Audiences from "./pages/admin/business/components/Info/Audiences/Audiences";
import Posts from "./pages/admin/business/components/Content/Posts/Posts";
import Prompts from "./pages/admin/business/components/Assets/Prompts/Prompts";
import { BusinessDashboard } from "./pages/admin/business/components/Dashboard/BusinessDashboard";
import Competitors from "./pages/admin/business/components/Competitors/List/Competitors";
import Competitor from "./pages/admin/business/components/Competitors/List/:id/Competitor";
import Gallery from "./pages/admin/business/components/Assets/Gallery/Gallery";
import DesignSystem from "./pages/admin/business/components/Assets/Gallery/DesignSystem";
import FacebookPostsIdeas from "./pages/admin/business/components/Competitors/Ideas/FacebookPostsIdeas";
import InstagramIdeas from "./pages/admin/business/components/Competitors/Ideas/InstagramIdeas";
import MetaAdsIdeas from "./pages/admin/business/components/Competitors/Ideas/MetaAdsIdeas";
import Stories from "./pages/admin/business/components/Content/Stories/Stories";
import Tiktok from "./pages/admin/business/components/Trends/Tiktok/Tiktok";

// AI
import AiIdeas from "./pages/admin/business/components/AI/AiIdeas/AiIdeas";
import AiPhoto from "./pages/admin/business/components/AI/AiPhotos/AiPhoto";
import ContentPlan from "./pages/admin/business/components/ContentPlan/ContentPlan";
import Calendar from "./pages/admin/business/components/ContentPlan/Calendar/Calendar";

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useSignInByTokenMutation } from "./store/auth/authApi";
import { setUser, setAccessToken, logout, setAuthInitialized } from "./store/auth/authSlice";
import { TUser } from "./models/User";
import { useTokenExpiration } from "./hooks/useTokenExpiration";

function App() {
  const ConfirmDialog = useConfirmDialog();
  const [ signInByToken ] = useSignInByTokenMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { authInitialized } = useAppSelector((state) => state.authModule);
  useTokenExpiration();


  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      dispatch(setAuthInitialized());
      return;
    }

    const checkAuth = async () => {
      try {
        const response: { accessToken: string, refreshToken: string, user: TUser } = await signInByToken(token).unwrap();
        dispatch(setUser(response.user));
        dispatch(setAccessToken(response.accessToken));
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setAuthInitialized());
      }
    }

    checkAuth();
  }, []);

  if (!authInitialized) {
    return <div>Loading...</div>;
  }

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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BusinessDashboard />} />

            {/*Base Data*/}
            <Route path="baseData" element={<BaseData />} />

            {/*Context*/}
            <Route path="profiles" element={<Profiles />} />
            <Route path="products" element={<Products />} />
            <Route path="audiences" element={<Audiences />} />

            {/*Generation*/}
            <Route path="posts" element={<Posts />} />
            <Route path="stories" element={<Stories />} />
            <Route path="prompts" element={<Prompts />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="designSystem" element={<DesignSystem />} />

            {/*Competitors*/}
            <Route path="competitors" element={<Competitors />}></Route>
            <Route path="competitors/:id" element={<Competitor/>} />
            <Route path="ideas/facebook-posts" element={<FacebookPostsIdeas />} />
            <Route path="ideas/instagram" element={<InstagramIdeas />} />
            <Route path="ideas/meta-ads" element={<MetaAdsIdeas />} />

            {/*Content Plan*/}
            <Route path="contentPlan" element={<ContentPlan />} />
            <Route path="calendar" element={<Calendar />} />

            {/*AI*/}
            <Route path="ideasAI" element={<AiIdeas />}></Route>
            <Route path="aiPhoto" element={<AiPhoto />}></Route>

            {/*Tiktok*/}
            <Route path="trends" element={<Tiktok />}></Route>

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
          <Route path="gallery" element={<AdminGallery />} />
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
