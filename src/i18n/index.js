import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // saveMissing: !!process.env.REACT_APP_LOCIZE_KEY,
    // updateMissing: !!process.env.REACT_APP_LOCIZE_KEY,

    react: {
      wait: true,
    },

    // backend: {
    //   projectId: '9d23463c-e755-497a-a773-bca079f5bff1',
    //   apiKey: process.env.REACT_APP_LOCIZE_KEY,
    //   version: process.env.REACT_APP_LOCIZE_VERSION || 'latest',
    //   referenceLng: 'en',
    // },

    resources: {
      en: { translation: require('./translations/en.json') },
      zh: { translation: require('./translations/zh.json') },
      'zh-Hant': { translation: require('./translations/zh-Hant.json') },
    },
  });

export default i18n;
