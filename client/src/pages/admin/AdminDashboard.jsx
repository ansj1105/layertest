// 📁 src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ userCount: 0, messageCount: 0 });

  useEffect(() => {
    axios.get("http://localhost:4000/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("통계 로드 실패:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 rounded p-4 shadow">
          <h2 className="text-lg font-semibold">총 사용자 수</h2>
          <p className="text-2xl">{stats.userCount}</p>
        </div>

        <div className="bg-green-100 rounded p-4 shadow">
          <h2 className="text-lg font-semibold">총 채팅 메시지</h2>
          <p className="text-2xl">{stats.messageCount}</p>
        </div>
      </div>

      <div className="space-x-4 mt-6">
        <Link to="/chat" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">채팅 관리</Link>
        <Link to="/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">대시보드</Link>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}