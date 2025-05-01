// 📁 src/pages/LanguageSettingsPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';

export default function LanguageSettingsPage() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const handleChange = (lang) => {
    if (!lang.implemented) {
      alert('해당 언어는 현재 개발 중입니다.');
      return;
    }
    i18n.changeLanguage(lang.code);
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <button
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
        onClick={() => window.history.back()}
      >
        ← 뒤로
      </button>
      <h2 className="text-center text-xl font-semibold mb-6">언어 설정</h2>

      <ul className="divide-y divide-yellow-700 bg-[#2c1f0f] rounded-lg overflow-hidden">
        {LANGUAGES.map((lang) => {
          const isActive = current.startsWith(lang.code);
          return (
            <li
              key={lang.code}
              className={`
                flex items-center justify-between px-4 py-3 cursor-pointer
                ${isActive ? 'bg-yellow-800' : 'hover:bg-yellow-900'}
                ${!lang.implemented ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleChange(lang)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm">{lang.label}</span>
              </div>
              <div className="text-sm">
                {isActive ? '✔️' : lang.implemented ? '' : '개발중'}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
