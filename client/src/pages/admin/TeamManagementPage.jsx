import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";

export default function TeamManagementPage({ onLogout }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newVipLevel, setNewVipLevel] = useState(1);

  useEffect(() => {
    axios.get("/api/referral/admin/my-team", { withCredentials: true })
      .then(res => {
        //console.log("[DEBUG] API 응답 데이터:", res.data);
        const teamsArr = res.data.data || []; // 배열 그대로 사용
        setTeams(teamsArr);
      })
      .catch(err => {
        console.error("팀 트리 불러오기 실패", err);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleVipChange = async (userId) => {
    try {
      await axios.patch(
        `/api/admin/users/${userId}/vip`,
        { vip_level: newVipLevel },
        { withCredentials: true }
      );
      setTeams(prev => prev.map(group => ({
        ...group,
        team: {
          A: group.team.A.map(u => u.id === userId ? { ...u, vip_level: newVipLevel } : u),
          B: group.team.B.map(u => u.id === userId ? { ...u, vip_level: newVipLevel } : u),
          C: group.team.C.map(u => u.id === userId ? { ...u, vip_level: newVipLevel } : u),
        }
      })));
      setEditingUserId(null);
    } catch (err) {
      console.error("VIP 등급 변경 실패", err);
    }
  };

  if (loading) return <div className="text-white p-4">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 팀 관리 & 리더보드</h2>
        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-6">조회 가능한 팀 구성이 없습니다.</p>
        ) : (
          teams.map((group, idx) => (
            <div key={idx} className="mb-12">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🔝 리더 S: {group.S.email} (VIP {group.S.vip_level})
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-600 mb-2">◾ 리더 S</h4>
                  <table className="min-w-full bg-white text-sm text-left shadow rounded">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="p-3">유저 ID</th>
                        <th className="p-3">이메일</th>
                        <th className="p-3">VIP 등급</th>
                        <th className="p-3">팀원 수</th>
                        <th className="p-3">총 수익</th>
                        <th className="p-3">최근 활동일</th>
                        <th className="p-3">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="p-3">{group.S.id}</td>
                        <td className="p-3">{group.S.email}</td>
                        <td className="p-3 font-semibold">
                          {editingUserId === group.S.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={newVipLevel}
                                onChange={(e) => setNewVipLevel(parseInt(e.target.value))}
                                className="w-16 px-2 py-1 border rounded"
                                min={1}
                                max={6}
                              />
                              <button
                                onClick={() => handleVipChange(group.S.id)}
                                className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                              >
                                저장
                              </button>
                            </div>
                          ) : (
                            <>VIP {group.S.vip_level || 1}</>
                          )}
                        </td>
                        <td className="p-3">{group.S.team_count || 0}</td>
                        <td className="p-3">{group.S.total_profit || 0} USDT</td>
                        <td className="p-3">{new Date(group.S.last_active).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setEditingUserId(group.S.id);
                              setNewVipLevel(group.S.vip_level || 1);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                          >
                            등급수정
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </h3>
              {['A', 'B', 'C'].map(levelKey => (
                <div key={levelKey} className="mb-6">
                  <h4 className="font-semibold text-gray-600 mb-2">◾ 계층 {levelKey}</h4>
                  {group[levelKey].length === 0 ? (
                    <p className="text-sm text-gray-400 ml-2">해당 계층 팀원이 없습니다.</p>
                  ) : (
                    <table className="min-w-full bg-white text-sm text-left shadow rounded">
                      <thead className="bg-gray-200 text-gray-700">
                        <tr>
                          <th className="p-3">유저 ID</th>
                          <th className="p-3">이메일</th>
                          <th className="p-3">VIP 등급</th>
                          <th className="p-3">팀원 수</th>
                          <th className="p-3">총 수익</th>
                          <th className="p-3">최근 활동일</th>
                          <th className="p-3">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group[levelKey].map((user, uidx) => (
                          <tr key={uidx} className="border-b hover:bg-gray-100">
                            <td className="p-3">{user.id}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3 font-semibold">
                              {editingUserId === user.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={newVipLevel}
                                    onChange={(e) => setNewVipLevel(parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border rounded"
                                    min={1}
                                    max={6}
                                  />
                                  <button
                                    onClick={() => handleVipChange(user.id)}
                                    className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                                  >
                                    저장
                                  </button>
                                </div>
                              ) : (
                                <>VIP {user.vip_level || 1}</>
                              )}
                            </td>
                            <td className="p-3">{user.team_count || 0}</td>
                            <td className="p-3">{user.total_profit || 0} USDT</td>
                            <td className="p-3">{new Date(user.last_active).toLocaleDateString()}</td>
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setNewVipLevel(user.vip_level || 1);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                              >
                                등급수정
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          ))
        )}

      </div>
    </div>
  );
}