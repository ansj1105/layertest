// 📁 src/pages/admin/AdminUserReferralPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function UserReferralPage({ onLogout, userId }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [teams, setTeams] = useState([]);
  const [settings, setSettings] = useState({ levelA: 0, levelB: 0, levelC: 0 });
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  // 사용자 목록 조회 (관리자용)
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/admin/users', { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err);
    }
  };

  // 전체 레퍼럴 네트워크 조회
  const fetchAllTeams = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/referral/users/all/my-teams', { withCredentials: true });
      setTeams(data.data);
      console.log(data);
    } catch (err) {
     
      console.error('전체 팀 조회 실패:', err);
      setTeams([]);
    }
  };

  // 보상 설정 조회
  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/referral/reward-settings', { withCredentials: true });
      setSettings(data.data);
    } catch (err) {
      console.error('보상 설정 조회 실패:', err);
    }
  };

  // 선택 사용자 레퍼럴 코드 조회
  const fetchReferralCode = async (userId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/referral/users/${userId}/code`,
        { withCredentials: true }
      );
      setReferralCode(data.data.referral_code || '');
    } catch (err) {
      console.error('레퍼럴 코드 조회 실패:', err);
      setReferralCode('');
    }
  };

  // 레퍼럴 코드 생성
  const generateCode = async () => {
    if (!selectedUserId) return;
    try {
      const { data } = await axios.post(
        `http://localhost:4000/api/referral/users/${selectedUserId}/code`,
        {},
        { withCredentials: true }
      );
      setReferralCode(data.data.referral_code);
      alert('✅ 레퍼럴 코드 생성됨');
    } catch (err) {
      console.error('레퍼럴 코드 생성 실패:', err);
      alert('❌ 코드 생성 중 오류 발생');
    }
  };

  // 레퍼럴 코드 저장
  const saveCode = async () => {
    if (!selectedUserId) return;
    try {
      await axios.put(
        `http://localhost:4000/api/referral/users/${selectedUserId}/code`,
        { referral_code: referralCode },
        { withCredentials: true }
      );
      alert('✅ 레퍼럴 코드 저장됨');
    } catch (err) {
      console.error('레퍼럴 코드 저장 실패:', err);
      alert('❌ 코드 저장 중 오류 발생');
    }
  };

  useEffect(() => {
    // 초기 로드: 사용자, 전체팀, 보상 설정
    Promise.all([fetchUsers(), fetchAllTeams(), fetchSettings()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchReferralCode(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: Number(value) }));
  };

  const saveSettings = async () => {
    try {
      await axios.put('http://localhost:4000/api/referral/reward-settings', settings, { withCredentials: true });
      alert('✅ 보상 설정이 저장되었습니다.');
    } catch (err) {
      console.error('보상 설정 저장 실패:', err);
      alert('❌ 저장 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-gray-500">⏳ 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50 space-y-8">
        <h1 className="text-2xl font-bold">🎁 유저별 레퍼럴 관리</h1>

        {/* 사용자 선택 */}
        <div className="bg-white p-4 rounded shadow max-w-md">
          <label className="block mb-2 font-medium">사용자 선택</label>
          <select
            className="border px-3 py-2 w-full"
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
          >
            <option value="">-- 사용자 선택 --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} (ID: {u.id})
              </option>
            ))}
          </select>
        </div>

        {/* 보상 설정 */}
        <section className="bg-white p-6 rounded shadow max-w-md">
          <h2 className="text-xl font-semibold mb-4">⚙️ 보상 비율 설정</h2>
          <div className="space-y-4">
            {['levelA', 'levelB', 'levelC'].map((key, idx) => (
              <div key={key} className="flex items-center">
                <label className="w-40">{`${idx+1}단계 보상 (%)`}</label>
                <input
                  type="number"
                  className="border px-2 py-1 flex-1 rounded"
                  value={settings[key]}
                  onChange={e => handleSettingChange(key, e.target.value)}
                />
              </div>
            ))}
            <button onClick={saveSettings} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              저장하기
            </button>
          </div>
        </section>

        {/* 레퍼럴 코드 관리 */}
        {selectedUserId && (
          <section className="bg-white p-6 rounded shadow max-w-md">
            <h2 className="text-xl font-semibold mb-4">🔗 레퍼럴 코드 관리</h2>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                className="border px-2 py-1 flex-1 rounded"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={generateCode}>
                생성
              </button>
              <button className="bg-indigo-500 text-white px-3 py-1 rounded" onClick={saveCode}>
                저장
              </button>
            </div>
          </section>
        )}

        {/* 전체 레퍼럴 네트워크 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📊 전체 레퍼럴 네트워크</h2>
          {teams.map((group, i) => (
            <div key={i} className="mb-6 bg-white p-4 rounded shadow">
              <div className="font-semibold bg-gray-100 p-2 rounded">
                🔰 {group.S.name} (ID: {group.S.id})
                <span className="ml-4">팀원 수: {group.S.team_count}</span>
                <span className="ml-4">총 수익: {group.S.total_profit} USDT</span>
              </div>
              {group.A.map(a => (
                <div key={a.id} className="ml-6 p-1">
                  A: {a.name} (ID: {a.id}) — 팀원: {a.team_count}, 수익: {a.total_profit} USDT
                </div>
              ))}
              {group.B.map(b => (
                <div key={b.id} className="ml-12 p-1">
                  B: {b.name} (ID: {b.id}) — 팀원: {b.team_count}, 수익: {b.total_profit} USDT
                </div>
              ))}
              {group.C.map(c => (
                <div key={c.id} className="ml-20 p-1">
                  C: {c.name} (ID: {c.id}) — 팀원: {c.team_count}, 수익: {c.total_profit} USDT
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
