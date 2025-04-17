// 📁 src/components/admin/AdminNav.jsx
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
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        🚪 로그아웃
      </button>
    </div>
  );
}
