// 📁 src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';


i18n
  // 브라우저 언어 감지기 (querystring, cookie, localStorage, navigator)
  .use(LanguageDetector)
  // react-i18next 바인딩
  .use(initReactI18next)
  .init({
    // 지원하는 언어들
    supportedLngs: ['en', 'ko', 'fr', 'de', 'ru', 'ja', 'vi'],
    // 지원하지 않는 언어 감지 시 fallback
    fallbackLng: 'en',

    debug: true,

    // 감지 옵션
    detection: {
      // URL ?lng=ko
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      // querystring 으로 사용할 key
      lookupQuerystring: 'lng',
    },

    resources: {
      en: { translation: en },
      ko: { translation: ko },
      fr: { translation: fr },
      de: { translation: de },
      ru: { translation: ru },
      ja: { translation: ja },
      vi: { translation: vi },
    },


    interpolation: {
      escapeValue: false, // react already safe
    }
  });

export default i18n;
