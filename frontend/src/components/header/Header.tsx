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

        <LanguageSwitcher />

        <nav>
          {isAuthenticatedAdmin && admin ? (
            <>
              <Link to="/admin/list" className="text-blue-600">
                {t('adminLabel', { name: admin.name })}
              </Link> /
              <a onClick={signOut} className="ml-1 cursor-pointer">
                {t('signOut')}
              </a>
            </>
          ) : isAuthenticatedUser && user ? (
            <>
              <Link to="/profile/dashboard" className="text-blue-600">
                {t('welcomeUser', { name: user.name })}
              </Link> /
              <a onClick={signOut} className="ml-1 cursor-pointer">
                {t('signOut')}
              </a>
            </>
          ) : (
            <>
              <Link className="ml-1" to="/signIn">{t('signIn')}</Link> /
              <Link to="/signUp" className="ml-1">{t('signUp')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header;
