// 📁 src/components/admin/FundingMonitoring.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function FundingMonitoring() {
  const [projects, setProjects]       = useState([]);
  const [projectId, setProjectId]     = useState("");
  const [stats, setStats]             = useState(null);
  const [investors, setInvestors]     = useState([]);
  const [loadingStats, setLoadingStats]     = useState(false);
  const [loadingInvestors, setLoadingInvestors] = useState(false);

  // 1) 프로젝트 목록 불러오기
  useEffect(() => {
    axios.get("/api/wallet/projects", { withCredentials: true })
      .then(res => setProjects(res.data.data || res.data))
      .catch(console.error);
  }, []);

  // 2) projectId 변경 시 stats & investors 동시 호출
  useEffect(() => {
    if (!projectId) return;
    setStats(null);
    setInvestors([]);
    setLoadingStats(true);
    setLoadingInvestors(true);

    // stats
    axios.get(`/api/wallet/projects/${projectId}/stats`, { withCredentials: true })
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    // investors
    axios.get(`/api/wallet/projects/${projectId}/investors`, { withCredentials: true })
      .then(res => setInvestors(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoadingInvestors(false));
  }, [projectId]);

  return (
    <div className="space-y-6">
      {/* 프로젝트 선택 */}
      <div>
        <label className="block mb-1 font-medium">프로젝트 선택</label>
        <select
          className="border px-3 py-2 rounded w-full max-w-xs"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          <option value="">-- 프로젝트 선택 --</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (ID: {p.id})
            </option>
          ))}
        </select>
      </div>

      {/* 진행 통계 */}
      {projectId && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">진행 통계</h3>
          {loadingStats ? (
            <p>로딩 중…</p>
          ) : stats ? (
            <>
              <p>목표금액: {stats.target.toFixed(6)} USDT</p>
              <p>현재금액: {stats.current.toFixed(6)} USDT</p>
              <p>진행률: {stats.progressPercent.toFixed(2)}%</p>
              <p>남은 기간: {stats.daysLeft}일</p>
              <div className="w-full h-4 bg-gray-200 rounded mt-2">
                <div
                  className="h-4 bg-yellow-500 rounded"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </>
          ) : (
            <p>통계를 불러오지 못했습니다.</p>
          )}
        </div>
      )}

      {/* 투자자 목록 */}
      {projectId && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">투자자 목록</h3>
          {loadingInvestors ? (
            <p>로딩 중…</p>
          ) : investors.length === 0 ? (
            <p>투자자가 없습니다.</p>
          ) : (
            <table className="min-w-full bg-white rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">투자자 ID</th>
                  <th className="p-2">이메일</th>
                  <th className="p-2">금액 (USDT)</th>
                  <th className="p-2">투자 일시</th>
                </tr>
              </thead>
              <tbody>
                {investors.map(inv => (
                  <tr key={inv.id} className="border-t">
                    <td className="p-2">{inv.userId}</td>
                    <td className="p-2">{inv.email}</td>
                    <td className="p-2">{parseFloat(inv.amount).toFixed(6)}</td>
                    <td className="p-2">{new Date(inv.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
