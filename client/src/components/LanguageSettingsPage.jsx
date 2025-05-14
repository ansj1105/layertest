// 📁 src/pages/LanguageSettingsPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import '../styles/topbar.css';
import '../styles/LanguageSettingsPage.css';
import { Check, Lock } from "lucide-react"; // 또는 Heroicons 등 사용 가능
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
  <div className="page-wrapper-rang">
    <div className="project-list-container-rang">
      {/* 상단 */}

      <div className="top-bar-rang">
        <button className="language-back-button" onClick={() => window.history.back()}>
          ←
        </button>
        <h2 className="language-title">언어 설정</h2>
      </div>
        <ul className="language-list">
          {LANGUAGES.map((lang) => {
            const isActive = current.startsWith(lang.code);
            const isDisabled = !lang.implemented;

            return (
              <li
                key={lang.code}
                className={`
                  language-item
                  ${isActive ? 'active' : ''}
                  ${isDisabled ? 'disabled' : ''}
                `}
                onClick={() => !isDisabled && handleChange(lang)}
              >
                <div className="language-label">
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                <div className="language-check">
                  {isActive ? (
                    <Check className="w-6 h-6 text-yellow-400" />
                  ) : isDisabled ? (
                    <Lock className="w-4 h-4 text-gray-500" />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>

  );
}
