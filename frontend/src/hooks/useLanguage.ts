import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { useUpdateLanguageMutation } from '../store/auth/authApi';

export function useLanguage() {
  const { i18n } = useTranslation();
  const isAuthenticated = useAppSelector((state) => state.authModule.isAuthenticatedUser);
  const [updateLanguage] = useUpdateLanguageMutation();

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (isAuthenticated) {
      updateLanguage({ language: lang });
    }
  }, [i18n, isAuthenticated, updateLanguage]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
  };
}
