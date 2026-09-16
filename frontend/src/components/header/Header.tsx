import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store';
import { toast } from "react-toastify";
import { ApiResponse } from "../../models/ApiResponse";
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from "../../store/hooks";
import { useSignOutAdminMutation } from "../../store/admin/adminApi";
import { useSignOutUserMutation} from "../../store/auth/authApi";
import { logout } from "../../store/auth/authSlice";
import { logoutAdmin } from "../../store/admin/adminSlice";
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const [ signOutUser ] = useSignOutUserMutation();
  const [ signOutAdmin ] = useSignOutAdminMutation();
  const dispatch = useAppDispatch();

  const { user, isAuthenticatedUser } = useSelector((state: RootState) => state.authModule);
  const { admin, isAuthenticatedAdmin } = useSelector((state: RootState) => state.adminModule);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signOut = async () => {
    try {
      let response;

      if(admin && isAuthenticatedAdmin) {
        response = await signOutAdmin().unwrap();
        dispatch(logoutAdmin());
      } else if (user && isAuthenticatedUser) {
        response = await signOutUser().unwrap();
        dispatch(logout());
      }

      navigate("/signIn");

      toast.success(response?.message);
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <nav className="flex items-center gap-2">
            {isAuthenticatedAdmin && admin ? (
              <>
                <Link to="/admin/list" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {t('Header.adminLabel', { name: admin.name })}
                </Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  {t('Header.signOut')}
                </button>
              </>
            ) : isAuthenticatedUser && user ? (
              <>
                <Link to="/profile/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {t('Header.welcomeUser', { name: user.name })}
                </Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  {t('Header.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signIn"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('Header.signIn')}
                </Link>
                <Link
                  to="/signUp"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {t('Header.signUp')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header;
