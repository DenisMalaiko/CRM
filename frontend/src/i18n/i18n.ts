import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '../locales/en/common.json';
import homeEn from '../locales/en/home.json';
import commonUa from '../locales/ua/common.json';
import homeUa from '../locales/ua/home.json';

const savedLanguage = localStorage.getItem('language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      home: homeEn,
    },
    ua: {
      common: commonUa,
      home: homeUa,
    },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
