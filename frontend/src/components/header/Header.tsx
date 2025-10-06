import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store';
import { toast } from "react-toastify";
import { signOutUser } from '../../store/auth/authThunks';
import { ApiResponse } from "../../models/ApiResponse";

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.authModule)
  const navigate = useNavigate();

  const signOut = async () => {

    try {
      const response: any = await dispatch(
        signOutUser()
      ).unwrap();

      navigate("/signIn");

      toast.success(response.message);

    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">CRM</Link>
        </div>

        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
        </nav>

        <nav>
          {isAuthenticated && user ? <Link to="/profile/dashboard" className="text-blue-600">Welcome, { user.name }</Link> : <Link to="/signIn">Sign In</Link>} /
          {isAuthenticated && user ? <a className="ml-1 cursor-pointer" onClick={signOut}>Sign Out</a> : <Link to="/signUp" className="ml-1">Sign Up</Link>}
        </nav>
      </div>
    </header>
  )
}

export default Header;