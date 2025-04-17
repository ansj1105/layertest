// 📁 src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav'; // ✅ 네비게이션 컴포넌트 임포트

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({ userCount: 0, messageCount: 0 });

  useEffect(() => {
    axios.get("http://localhost:4000/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("통계 로드 실패:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ 공통 네비게이션 */}
      <AdminNav onLogout={onLogout} />

      {/* ✅ 콘텐츠 */}
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
      </div>
    </div>
  );
}
