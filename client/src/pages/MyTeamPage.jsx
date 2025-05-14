// 📁 src/pages/MyTeamPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../components/ProtectedRoute';
import ReferralStatsBox from '../components/ReferralStatsBox';
import '../styles/MyTeamPage.css';
import '../styles/topbar.css';

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
          axios.get('/api/referral/my-team',    { withCredentials: true }),
          axios.get('/api/referral/stats',      { withCredentials: true }),
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
      <div className="page-wrapper-my">
        {/* 헤더 */}
        <div className="top-bar">
          <button onClick={() => history.back()} className="top-tran">←</button>
          <h1 className="top-h-text">{t('team.title')}</h1>
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
        <div className="flex-my">
          <button
            onClick={() => setActiveTab('members')}
            className={`v-token-r-my ${activeTab==='members'? "active-button" : "inactive-button"}`}
          >
            {t('team.tabs.members')}
          </button>
          <button
            onClick={() => setActiveTab('contrib')}
            className={`v-token-r-my ${activeTab==='contrib'? "active-button" : "inactive-button"}`}
          >
            {t('team.tabs.contrib')}
          </button>
        </div>
        
        {/* ── 팀 멤버 리스트 ── */}
        {activeTab === 'members' && (
          <>
            <div className="referra-dro">
              {/* 왼쪽: 오늘 등록한 사람 수 */}
              <div className="level-title">
                {t('team.todayJoinedCount', { count: stats?.todayJoined ?? 0  })}
              </div>
              {stats?.todayJoined ?? 0}
              {/* 오른쪽: 레벨 필터 드롭다운 */}
              <div>
                <label className="level-title mr-1">{t('team.filter.level')}</label>
                <select
                  className="level-hierarchy"
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
            </div>

            <div className="data-box-container-m">
              {team[filterLevel].map(u => (
                <div key={u.id} className="data-card-my">
                  <div>
                    <div className="data-card-my-title">{u.name || u.email}</div>
                    <div className="data-card-my-sub">
                      {t('team.registered')}: {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{t('team.vip')}: {u.vip_level}</div>
                    <div className="text-sm">{t('team.teamSize')}: {u.team_count}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}


        {/* ── 팀 기여 리스트 ── */}
        {activeTab === 'contrib' && (
          <>
            
            <div className="referra-dro">
              {/* 왼쪽: 오늘 등록한 사람 수 */}
    
    {/* 1. 오늘/누적 수익 박스 */}
    {contribStats && (
      <div className="level-title">
        <div>
          {t('team.contrib.totalEarnings')}:
          <span> {contribStats.totalEarnings.toFixed(6)} USDT</span>
        </div>
      </div>
    )}




    {/* 2. Period 필터 (새 줄) */}
    <div className="level-title ">
      <label className="level-title">{t('team.filter.period')}</label>
      <select
        className="level-hierarchy"
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
            </div>

            


            {contribLoading ? (
              <p className="text-center text-yellow-200 py-4">{t('team.loading')}</p>
            ) : contribList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-box-container-m1">
                  <thead>
                    <tr className="ta-11">
                      <th className="p-2">{t('team.table.account')}</th>
                      <th className="p-2">{t('team.table.level')}</th>
                      <th className="p-2">{t('team.table.time')}</th>
                      <th className="p-2">{t('team.table.earning')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contribList.map((item, idx) => (
                      <tr key={idx} className="ta-12">
                        <td className="p-2">{item.user_name}</td>
                        <td className="p-2">{item.level}</td>
                        <td className="p-2">
                          {new Date(item.time).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {item.earning.toLocaleString()} USC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="data-box-container-m no-data text-center text-gray-400 py-4">
                {t('team.noRecords')}
              </div>
            )}
            
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
