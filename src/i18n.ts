import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['fr', 'en', 'ar'],
    fallbackLng: 'en',
    // The translation files are in /public/locales/{lang}/translation.json
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;