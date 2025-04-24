// 📁 src/pages/admin/QuantLeaderboardPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";

export default function QuantLeaderboardPage({ onLogout }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/quanttrade/leaderboard', { withCredentials: true })
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error('팀 리더보드 불러오기 실패', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center mt-10">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 양적거래 팀 리더보드</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-500">현재 랭킹 정보가 없습니다.</p>
        ) : (
          <table className="min-w-full bg-white text-sm text-left shadow rounded">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">순위</th>
                <th className="p-3">유저 ID</th>
                <th className="p-3">이메일</th>
                <th className="p-3">팀 총 수익</th>
                <th className="p-3">총 거래 횟수</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, idx) => (
                <tr key={item.user_id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{item.user_id}</td>
                  <td className="p-3">{item.email}</td>
                  <td className="p-3">{item.team_profit} USDT</td>
                  <td className="p-3">{item.trade_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
