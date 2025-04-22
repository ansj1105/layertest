import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import ReferralStatsBox from '../components/ReferralStatsBox';

export default function MyTeamPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0,
    todayJoined: 0,
    todayEarnings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    axios.get('http://localhost:4000/api/referral/network')
      .then(res => {
        setReferrals(res.data.data || []);
        setStats({
          totalCount: res.data.data.length,
          todayJoined: res.data.data.filter(r =>
            new Date(r.created_at).toDateString() === new Date().toDateString()
          ).length,
          todayEarnings: res.data.todayEarnings || 0,
          totalEarnings: res.data.totalEarnings || 0,
        });
      })
      .catch(err => {
        console.error("❌ 레퍼럴 조회 실패:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderByLevel = (level) => {
    return referrals
      .filter(r => r.level === level)
      .map(r => (
        <div key={r.id} className="bg-white shadow p-3 rounded mb-2">
          <div className="font-semibold">{r.username}</div>
          <div className="text-sm text-gray-500">가입일: {new Date(r.created_at).toLocaleDateString()}</div>
          <div className="text-sm">상태: {r.status === 'active' ? '✅' : '❌'}</div>
        </div>
      ));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">👥 내 팀 보기 (레퍼럴 구조)</h1>

        {/* ✅ 요약 박스 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ReferralStatsBox label="총 팀원 수" value={`${stats.totalCount}명`} color="bg-blue-100" />
          <ReferralStatsBox label="오늘 가입자 수" value={`${stats.todayJoined}명`} color="bg-purple-100" />
          <ReferralStatsBox label="오늘 수익" value={`${stats.todayEarnings} USDT`} color="bg-green-100" />
          <ReferralStatsBox label="총 수익" value={`${stats.totalEarnings} USDT`} color="bg-yellow-100" />
        </div>

        {loading ? (
          <p>⏳ 불러오는 중...</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-blue-600 my-2">직접 추천 (A단계)</h2>
            {renderByLevel(1)}
            <h2 className="text-xl font-semibold text-purple-600 my-2">간접 추천 (B단계)</h2>
            {renderByLevel(2)}
            <h2 className="text-xl font-semibold text-green-600 my-2">3단계 추천 (C단계)</h2>
            {renderByLevel(3)}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
