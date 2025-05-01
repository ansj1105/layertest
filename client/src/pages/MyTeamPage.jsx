// 📁 src/pages/MyTeamPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import ReferralStatsBox from '../components/ReferralStatsBox';

export default function MyTeamPage() {
  const [team, setTeam] = useState({ S: [], A: [], B: [], C: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [teamRes, statsRes] = await Promise.all([
          axios.get('http://54.85.128.211:4000/api/referral/my-team', { withCredentials: true }),
          axios.get('http://54.85.128.211:4000/api/referral/stats',   { withCredentials: true }),
        ]);
      // 여기서 받아온 전체 응답 객체와 .data 내용을 찍어봅니다.
      console.log('=== teamRes 전체 응답 ===', teamRes);
      console.log('=== teamRes.data ===', teamRes.data);
      console.log('=== statsRes 전체 응답 ===', statsRes);
      console.log('=== statsRes.data ===', statsRes.data);
        // teamRes.data.data === { S, A, B, C }
        setTeam(teamRes.data.data);

        // statsRes.data === { totalMembers, todayJoined, totalEarnings, todayEarnings }
        setStats(statsRes.data);
      } catch (err) {
        console.error('❌ 레퍼럴 데이터 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const renderList = (list) =>
    list.map(u => (
      <div key={u.id} className="bg-white shadow p-3 rounded mb-2">
        <div className="font-semibold">{u.name || u.email}</div>
        <div className="text-sm text-gray-500">
          최근 활동: {new Date(u.last_active).toLocaleDateString()}
        </div>
        <div className="text-sm">
          VIP: {u.vip_level}  |  팀원수: {u.team_count}  |  수익: {u.total_profit.toFixed(6)} USDT
        </div>
      </div>
    ));

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-6 bg-gray-100 text-center text-gray-500">
          ⏳ 불러오는 중...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">👥 내 팀 보기 (레퍼럴 구조)</h1>

        {stats && <ReferralStatsBox stats={{
          totalMembers: stats.totalMembers,
          todayEarnings: stats.todayEarnings,
          totalEarnings: stats.totalEarnings,
          todayJoined: stats.todayJoined
        }} />}

        <h2 className="text-xl font-semibold text-blue-600 my-2">직접 추천 (A 단계)</h2>
        {team.A.length > 0
          ? renderList(team.A)
          : <p className="text-gray-500">A 단계 추천이 없습니다.</p>
        }

        <h2 className="text-xl font-semibold text-purple-600 my-2">간접 추천 (B 단계)</h2>
        {team.B.length > 0
          ? renderList(team.B)
          : <p className="text-gray-500">B 단계 추천이 없습니다.</p>
        }

        <h2 className="text-xl font-semibold text-green-600 my-2">3단계 추천 (C 단계)</h2>
        {team.C.length > 0
          ? renderList(team.C)
          : <p className="text-gray-500">C 단계 추천이 없습니다.</p>
        }
      </div>
    </ProtectedRoute>
  );
}
