import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";

export default function UserReferralPage({ onLogout }) {
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [settings, setSettings] = useState({
    level1: 21,
    level2: 7,
    level3: 3,
  });

  const fetchReferrals = async () => {
    const res = await axios.get("http://localhost:4000/api/referral/network");
    setReferrals(res.data.data);
  };

  const fetchRewards = async () => {
    const res = await axios.get("http://localhost:4000/api/referral/rewards");
    setRewards(res.data.data.rewards);
  };

  const handleSettingChange = (level, value) => {
    setSettings((prev) => ({ ...prev, [level]: parseFloat(value) }));
  };

  const saveSettings = async () => {
    await axios.post("http://localhost:4000/api/admin/referral/rewards-config", settings);
    alert("✅ 보상 설정이 저장되었습니다.");
  };

  useEffect(() => {
    fetchReferrals();
    fetchRewards();
  }, []);

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold mb-4">🎁 초대 및 레퍼럴 관리</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">📊 레퍼럴 네트워크</h2>
          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">닉네임</th>
                <th className="p-2">레벨</th>
                <th className="p-2">가입일</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="text-center border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.username}</td>
                  <td className="p-2">{r.level}</td>
                  <td className="p-2">{new Date(r.signupDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">💰 보상 내역</h2>
          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">유저</th>
                <th className="p-2">보상금액</th>
                <th className="p-2">유형</th>
                <th className="p-2">상태</th>
                <th className="p-2">날짜</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="text-center border-t">
                  <td className="p-2">{r.referredUser}</td>
                  <td className="p-2">{r.amount}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">⚙️ 보상 설정</h2>
          <div className="space-y-2">
            <div>
              <label>1단계 보상 (%): </label>
              <input
                type="number"
                value={settings.level1}
                onChange={(e) => handleSettingChange("level1", e.target.value)}
                className="border px-2 py-1 ml-2 w-24"
              />
            </div>
            <div>
              <label>2단계 보상 (%): </label>
              <input
                type="number"
                value={settings.level2}
                onChange={(e) => handleSettingChange("level2", e.target.value)}
                className="border px-2 py-1 ml-2 w-24"
              />
            </div>
            <div>
              <label>3단계 보상 (%): </label>
              <input
                type="number"
                value={settings.level3}
                onChange={(e) => handleSettingChange("level3", e.target.value)}
                className="border px-2 py-1 ml-2 w-24"
              />
            </div>
            <button onClick={saveSettings} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              저장하기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
