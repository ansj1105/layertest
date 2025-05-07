// 📁 src/pages/MyTeamPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../components/ProtectedRoute';
import ReferralStatsBox from '../components/ReferralStatsBox';

const LEVELS = [
  { value: 'A', labelKey: 'team.level.A' },
  { value: 'B', labelKey: 'team.level.B' },
  { value: 'C', labelKey: 'team.level.C' },
];

const PERIODS = [
  { value: 'today', labelKey: 'team.period.today' },
  { value: 'week',  labelKey: 'team.period.week' },
  { value: 'month', labelKey: 'team.period.month' },
];

export default function MyTeamPage() {
  const { t } = useTranslation();
  const [team, setTeam] = useState({ A: [], B: [], C: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab]           = useState('members');
  const [filterLevel, setFilterLevel]       = useState('A');

  // === 기여 탭용 state
  const [period, setPeriod]                 = useState('today');
  const [contribLoading, setContribLoading] = useState(false);
  const [contribStats, setContribStats]     = useState(null);
  const [contribList, setContribList]       = useState([]);

  // ▶ 멤버 목록 & 전체 통계 불러오기
  useEffect(() => {
    (async () => {
      try {
        const [teamRes, statsRes] = await Promise.all([
<<<<<<< HEAD
          axios.get('http://54.85.128.211:4000/api/referral/my-team',    { withCredentials: true }),
          axios.get('http://54.85.128.211:4000/api/referral/stats',      { withCredentials: true }),
          
=======
          axios.get('/api/referral/my-team',    { withCredentials: true }),
          axios.get('/api/referral/stats',      { withCredentials: true }),
>>>>>>> main
        ]);
        setTeam(teamRes.data.data);
        const { totalMembers, todayJoined, totalProfit, todayProfit } = statsRes.data.data;
        setStats({
          totalMembers,
          todayJoined,
          totalEarnings: totalProfit,
          todayEarnings: todayProfit,
        });
      } catch (err) {
        console.error('❌', t('team.errorLoad'), err);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  // ▶ “기여” 탭을 켰을 때, period 변화나 처음 진입 시 불러오기
  useEffect(() => {
    if (activeTab !== 'contrib') return;
        console.log('⏳ [contrib] fetching, period =', period);
        setContribLoading(true);
    
        axios.get('/api/referral/contributions', {
          params: { period },
          withCredentials: true
        })
        .then(res => {
          console.log('✅ [contrib] response.data:', res.data);
          setContribStats(res.data.stats);
          setContribList(res.data.list);
        })
        .catch(err => {
          console.error('❌ [contrib] error:', err.response?.data || err.message);
        })
        .finally(() => {
          setContribLoading(false);
        });
  }, [activeTab, period, t]);

  const renderMemberCard = u => (
    <div key={u.id} className="bg-[#2c1f0f] p-4 rounded mb-3 flex justify-between items-center">
      <div>
        <div className="text-lg font-semibold text-yellow-100">{u.name || u.email}</div>
        <div className="text-sm text-yellow-300 mt-1">
          {t('team.registered')}: {new Date(u.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="text-sm">{t('team.vip')}: {u.vip_level}</div>
        <div className="text-sm">{t('team.teamSize')}: {u.team_count}</div>
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
          {t('team.loading')}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
        {/* 헤더 */}
        <div className="flex items-center mb-4">
          <button onClick={() => history.back()} className="mr-2">←</button>
          <h1 className="text-xl font-semibold">{t('team.title')}</h1>
        </div>

        {/* 전체 통계 */}
        {stats && (
          <ReferralStatsBox stats={{
            totalMembers:  stats.totalMembers,
            todayJoined:   stats.todayJoined,
            totalEarnings: stats.totalEarnings,
            todayEarnings: stats.todayEarnings,
          }} />
        )}

        {/* 탭 버튼 */}
        <div className="flex bg-[#2c1f0f] rounded mb-4 overflow-hidden">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 font-medium ${activeTab==='members'? 'bg-yellow-700 text-black':'text-yellow-300'}`}
          >
            {t('team.tabs.members')}
          </button>
          <button
            onClick={() => setActiveTab('contrib')}
            className={`flex-1 py-2 font-medium ${activeTab==='contrib'? 'bg-yellow-700 text-black':'text-yellow-300'}`}
          >
            {t('team.tabs.contrib')}
          </button>
        </div>

        {/* ── 팀 멤버 리스트 ── */}
        {activeTab === 'members' && (
          <>
            <div className="mb-4 flex items-center">
              <label className="mr-2">{t('team.filter.level')}</label>
              <select
                className="bg-[#2c1f0f] text-yellow-100 p-2 rounded"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>
                    {t(l.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            {team[filterLevel].length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {team[filterLevel].map(renderMemberCard)}
              </div>
            ) : (
              <p className="text-center text-yellow-300">{t('team.noMembers')}</p>
            )}
          </>
        )}

        {/* ── 팀 기여 리스트 ── */}
        {activeTab === 'contrib' && (
          <>
            <div className="mb-4 flex items-center">
              <label className="mr-2">{t('team.filter.period')}</label>
              <select
                className="bg-[#2c1f0f] text-yellow-100 p-2 rounded"
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                {PERIODS.map(p => (
                  <option key={p.value} value={p.value}>
                    {t(p.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* stats: 오늘 / 누적 earnings */}
            {contribStats && (
              <div className="mb-4 bg-[#2c1f0f] p-4 rounded flex justify-between text-sm">
                <div>
                  {t('team.contrib.todayEarnings')}:
                  <span className="text-red-500"> {contribStats.todayEarnings.toFixed(6)} USDT</span>
                </div>
                <div>
                  {t('team.contrib.totalEarnings')}:
                  <span> {contribStats.totalEarnings.toFixed(6)} USDT</span>
                </div>
              </div>
            )}

            {contribLoading
              ? <p className="text-center">{t('team.loading')}</p>
              : contribList.length > 0 ? (
                <table className="w-full table-auto text-xs bg-[#2c1f0f] rounded overflow-hidden">
                  <thead>
                    <tr className="bg-[#3a270e]">
                      <th className="p-2">{t('team.table.account')}</th>
                      <th className="p-2">{t('team.table.level')}</th>
                      <th className="p-2">{t('team.table.time')}</th>
                      <th className="p-2">{t('team.table.earning')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contribList.map(renderContribRow)}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-yellow-300">{t('team.noRecords')}</p>
              )
            }
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
