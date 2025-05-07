// 📁 src/pages/AppDownloadPage.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
export default function AppDownloadPage() {
  // QR 코드에 활용할 URL
  const downloadUrl = 'https://www.Upstarts.top/download';

  // 앱 버전 (필요에 따라 .env 등에서 불러올 수도 있습니다)
  const appVersion = '1.0.2.3';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      {/* 상단 로고 */}
            <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-black-200 hover:text-red-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>
      <img
        src="/logo192.png"
        alt="Upstart Logo"
        className="w-24 h-24 rounded-full mb-4"
      />

      {/* 앱 이름 & 버전 */}
      <h1 className="text-2xl font-bold mb-1">Upstart</h1>
      <p className="text-sm text-gray-500 mb-8">Version: {appVersion}</p>


      {/* QR 코드 */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <QRCodeCanvas value={downloadUrl} size={180} fgColor="#000000" />
      </div>
      <p className="text-xs text-gray-600 mb-8">
        Or scan the QR code with your mobile phone to install
      </p>

      {/* 앱스토어 버튼 */}
      <div className="flex space-x-4 mb-12">
        {/*
        <a href="https://play.google.com/store/apps/details?id=com.Upstart.app" target="_blank" rel="noopener noreferrer">
          <img src="/img/android-badge.png" alt="Download on Android" className="h-12"/>
        </a>
        <a href="https://apps.apple.com/app/Upstart/id123456789" target="_blank" rel="noopener noreferrer">
          <img src="/img/appstore-badge.png" alt="Download on the App Store" className="h-12"/>
        </a>
        */}
      </div>

      {/* 준비중 배너 */}
      <p className="text-gray-400 italic">현재 준비중입니다.</p>

      {/* 언어 선택 (예시) */}
      <div className="mt-auto pt-12">
        <nav className="flex space-x-4 text-sm text-gray-500">
          <Link to="?lang=en" className="hover:underline">English</Link>
          <span>|</span>
          <Link to="?lang=fr" className="hover:underline">Français</Link>
          <span>|</span>
          <Link to="?lang=de" className="hover:underline">Deutsch</Link>
        </nav>
      </div>
    </div>
  );
}
