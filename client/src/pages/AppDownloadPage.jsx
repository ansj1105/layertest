// 📁 src/pages/AppDownloadPage.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
import { useTranslation } from 'react-i18next';
import '../styles/AppDownloadPage.css';
import '../styles/topbar.css';

export default function AppDownloadPage() {
  const { t } = useTranslation();
  
  // QR 코드에 활용할 URL
  const downloadUrl = 'https://www.Upstarts.top/download';

  // 앱 버전 (필요에 따라 .env 등에서 불러올 수도 있습니다)
  const appVersion = '1.0.2.3';
  
  return (
    <div className="download-page-wrapper">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => window.history.back()}
        className="download-back-button"
      >
        <ArrowLeftIcon size={20} />
        <span>{t('appDownload.back')}</span>
      </button>
 
      {/* 로고 */}
      <img
        src="/img/item/logo/applogo.png"
        alt={t('appDownload.logoAlt')}
        className="download-logo"
      />

      {/* 앱 이름 & 버전 */}
      <p className="download-version">{t('appDownload.version', { version: appVersion })}</p>

      {/* QR 코드 */}
      <div className="download-qr-wrapper">
        <QRCodeCanvas value={downloadUrl} size={180} fgColor="#000000" />
      </div>
      <p className="download-qr-text">
        {t('appDownload.qrCodeInstruction')}
      </p>

      {/* 앱스토어 버튼 (현재 비활성화) */}
      <div className="download-store-buttons">
        {/*
        <a href="https://play.google.com/store/apps/details?id=com.Upstart.app" target="_blank" rel="noopener noreferrer">
          <img src="/img/android-badge.png" alt={t('appDownload.androidAlt')} className="store-button-img" />
        </a>
        <a href="https://apps.apple.com/app/Upstart/id123456789" target="_blank" rel="noopener noreferrer">
          <img src="/img/appstore-badge.png" alt={t('appDownload.iosAlt')} className="store-button-img" />
        </a>
        */}
      </div>

      {/* 준비중 메시지 */}
      <p className="download-soon-message">{t('appDownload.comingSoon')}</p>

      {/* 언어 선택 */}
      <div className="download-footer-nav">
        <Link to="?lang=en">{t('languages.english')}</Link>
        <span>|</span>
        <Link to="?lang=fr">{t('languages.french')}</Link>
        <span>|</span>
        <Link to="?lang=de">{t('languages.german')}</Link>
      </div>
    </div>
  );
}



