import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    changeLanguage,
  };
}
