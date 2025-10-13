import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store';
import { toast } from "react-toastify";
import { signOutUser } from '../../store/auth/authThunks';
import { signOutAdmin } from '../../store/admin/adminThunks';
import { ApiResponse } from "../../models/ApiResponse";

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticatedUser } = useSelector((state: RootState) => state.authModule);
  const { admin, isAuthenticatedAdmin } = useSelector((state: RootState) => state.adminModule);
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      let response;

      if(admin && isAuthenticatedAdmin) {
        response = await dispatch(
          signOutAdmin()
        ).unwrap();
      } else if (user && isAuthenticatedUser) {
        response = await dispatch(
          signOutUser()
        ).unwrap();
      }

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
          {isAuthenticatedAdmin && admin ? (
            <>
              <Link to="/admin/list" className="text-blue-600">
                👑 Admin: {admin.name}
              </Link> /
              <a onClick={signOut} className="ml-1 cursor-pointer">
                Sign Out
              </a>
            </>
          ) : isAuthenticatedUser && user ? (
            <>
              <Link to="/profile/dashboard" className="text-blue-600">
                Welcome, {user.name}
              </Link> /
              <a onClick={signOut} className="ml-1 cursor-pointer">
                Sign Out
              </a>
            </>
          ) : (
            <>
              <Link to="/admin/signIn">Sign In Admin</Link> /
              <Link to="/admin/signUp" className="ml-1 mr-5">Sign Up Admin</Link>

              <Link className="ml-1" to="/signIn">Sign In</Link> /
              <Link to="/signUp" className="ml-1">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header;