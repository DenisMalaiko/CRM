import 'i18next';

import commonEn from '../locales/en/common.json';
import homeEn from '../locales/en/home.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      common: typeof commonEn;
      home: typeof homeEn;
    };
  }
}
