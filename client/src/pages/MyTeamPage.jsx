// 📁 src/pages/MyTeamPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import ReferralStatsBox from '../components/ReferralStatsBox';

const LEVELS = [
  { value: 'A', label: '레벨 1 (직접)' },
  { value: 'B', label: '레벨 2 (간접)' },
  { value: 'C', label: '레벨 3' },
];

const PERIODS = [
  { value: 'today', label: '오늘' },
  { value: 'week',  label: '이번 주' },
  { value: 'month', label: '이번 달' },
];

export default function MyTeamPage() {
  const [team, setTeam] = useState({ A: [], B: [], C: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab]           = useState('members'); // 'members' | 'contrib'
  const [filterLevel, setFilterLevel]       = useState('A');
  const [period, setPeriod]                 = useState('today');
  const [contribStats, setContribStats]     = useState(null);
  const [contribList, setContribList]       = useState([]);
  const [contribLoading, setContribLoading] = useState(false);

  // 첫 로딩에 팀+통계만 가져옴
  useEffect(() => {
    async function fetchAll() {
      try {
        const [teamRes, statsRes] = await Promise.all([
          axios.get('http://localhost:4000/api/referral/my-team',    { withCredentials: true }),
          axios.get('http://localhost:4000/api/referral/stats',      { withCredentials: true }),
          
        ]);
        console.log(teamRes);
        console.log(statsRes);
        setTeam(teamRes.data.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('❌ 레퍼럴 데이터 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // 팀 기여 탭 진입하거나 period 바뀔 때마다 다시 불러오기
  useEffect(() => {
    if (activeTab !== 'contrib') return;
    setContribLoading(true);
    axios.get('/api/referral/contributions', {
      params: { period },
      withCredentials: true
    })
      .then(res => {
        // { stats: {...}, list: [...] }
        setContribStats(res.data.stats);
        setContribList(res.data.list);
      })
      .catch(err => console.error('❌ 기여 데이터 불러오기 실패:', err))
      .finally(() => setContribLoading(false));
  }, [activeTab, period]);

  const renderMemberCard = u => (
    <div key={u.id} className="bg-[#2c1f0f] p-4 rounded mb-3 flex justify-between items-center">
      <div>
        <div className="text-lg font-semibold text-yellow-100">{u.name || u.email}</div>
        <div className="text-sm text-yellow-300 mt-1">
          등록: {new Date(u.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="text-sm">VIP: {u.vip_level}</div>
        <div className="text-sm">팀원: {u.team_count}</div>
      </div>
    </div>
  );

  const renderContribRow = (c, idx) => (
    <tr key={idx} className="even:bg-[#3a270e] odd:bg-[#2b1e0f]">
      <td className="p-2 text-center">{c.user_name}</td>
      <td className="p-2 text-center">{c.level}</td>
      <td className="p-2 text-center">{new Date(c.time).toLocaleString()}</td>
      <td className="p-2 text-center">{c.earning.toFixed(6)} USDT</td>
    </tr>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center text-yellow-300">
          ⏳ 불러오는 중...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
        {/* 헤더 */}
        <div className="flex items-center mb-4">
          <button onClick={() => history.back()} className="mr-2">
            ←
          </button>
          <h1 className="text-xl font-semibold">👥 내 팀 보기</h1>
        </div>

        {/* 통계 박스 */}
        {stats && (
          <ReferralStatsBox stats={{
            totalMembers: stats.totalMembers,
            todayJoined:  stats.todayJoined,
            totalEarnings: stats.totalEarnings,
            todayEarnings: stats.todayEarnings
          }} />
        )}

        {/* 탭 */}
        <div className="flex bg-[#2c1f0f] rounded mb-4 overflow-hidden">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 font-medium ${activeTab==='members'? 'bg-yellow-700 text-black':'text-yellow-300'}`}
          >
            팀 멤버
          </button>
          <button
            onClick={() => setActiveTab('contrib')}
            className={`flex-1 py-2 font-medium ${activeTab==='contrib'? 'bg-yellow-700 text-black':'text-yellow-300'}`}
          >
            팀 기여
          </button>
        </div>

        {/* 팀 멤버 리스트 */}
        {activeTab==='members' && (
          <>
            {/* 레벨 필터 */}
            <div className="mb-4 flex items-center">
              <label className="mr-2">단계 필터:</label>
              <select
                className="bg-[#2c1f0f] text-yellow-100 p-2 rounded"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            {team[filterLevel].length>0
              ? team[filterLevel].map(renderMemberCard)
              : <p className="text-center text-yellow-300">추천된 사용자가 없습니다.</p>
            }
          </>
        )}

        {/* 팀 기여 리스트 */}
        {activeTab==='contrib' && (
          <>
            {/* 기간 필터 */}
            <div className="mb-4 flex items-center">
              <label className="mr-2">기간:</label>
              <select
                className="bg-[#2c1f0f] text-yellow-100 p-2 rounded"
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                {PERIODS.map(p=>(
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* 수익 요약 */}
            {contribStats && (
              <div className="mb-4 bg-[#2c1f0f] p-4 rounded flex justify-between text-sm">
                <div>오늘 누적 수입: <span className="text-red-500">{contribStats.todayEarnings.toFixed(6)} USDT</span></div>
                <div>총 수입: {contribStats.totalEarnings.toFixed(6)} USDT</div>
              </div>
            )}

            {/* 테이블 */}
            {contribLoading
              ? <p className="text-center">⏳ 불러오는 중...</p>
              : contribList.length>0 ? (
                <table className="w-full table-auto text-xs bg-[#2c1f0f] rounded overflow-hidden">
                  <thead>
                    <tr className="bg-[#3a270e]">
                      <th className="p-2">계정</th>
                      <th className="p-2">수준</th>
                      <th className="p-2">시간</th>
                      <th className="p-2">소득</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contribList.map(renderContribRow)}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-yellow-300">기록 없음</p>
              )
            }
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
