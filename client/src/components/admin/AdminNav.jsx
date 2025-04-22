// 📁 src/components/admin/AdminNav.jsx
/*
import { Link } from "react-router-dom";

export default function AdminNav({ onLogout }) {
  return (
    <div className="space-x-2 mb-6 text-center">
      <Link to="/chat" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        💬 채팅 관리
      </Link>
      <Link to="/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        📊 대시보드
      </Link>
      <Link to="/content" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
        🖼️ 콘텐츠 관리
      </Link>
      <Link to="/users" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        👤 사용자 관리
      </Link>
      <Link to="/popup" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
        📢 팝업 알림 관리
      </Link>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        🚪 로그아웃
      </button>
    </div>
  );
}
*/

import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminNav({ onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  return (
    <div className="w-64 h-screen p-4 bg-green-100 border-r-2 border-green-300 fixed top-0 left-0 overflow-y-auto">
      <div className="mb-4">
        <Link
          to="/chat"
          className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
        >
          💬 채팅 관리
        </Link>
        <Link
          to="/dashboard"
          className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-2"
        >
          📊 대시보드
        </Link>
        <Link
          to="/content"
          className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-2"
        >
          🖼️ 콘텐츠 관리
        </Link>

        {/* 사용자 관리 메뉴 - 클릭 시 하위 메뉴 노출 */}
        <div className="mb-2">
          <button
            onClick={toggleUserMenu}
            className="w-full text-left bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            👤 사용자 관리 {isUserMenuOpen ? "▲" : "▼"}
          </button>

          {isUserMenuOpen && (
            <div className="bg-green-200 border-t mt-1">
              <Link
                to="/users/info"
                className="block px-4 py-2 hover:bg-green-300"
              >
                사용자 정보 조회 및 수정
              </Link>
              <Link
                to="/users/level"
                className="block px-4 py-2 hover:bg-green-300 border-t"
              >
                레벨업 시스템 관리
              </Link>
              <Link
                to="/users/referral"
                className="block px-4 py-2 hover:bg-green-300 border-t"
              >
                초대 및 레퍼럴 시스템 관리
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/popup"
          className="block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-2"
        >
          📢 팝업 알림 관리
        </Link>

        <button
          onClick={onLogout}
          className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          🚪 로그아웃
        </button>
      </div>
    </div>
  );
}
