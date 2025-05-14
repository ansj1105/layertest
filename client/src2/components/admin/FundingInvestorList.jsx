// 📁 src/components/admin/FundingInvestorList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function FundingInvestorList() {
  const [projects, setProjects]       = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [investors, setInvestors]     = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingInvestors, setLoadingInvestors] = useState(false);

  // 1) 프로젝트 목록 불러오기
  useEffect(() => {
    setLoadingProjects(true);
    axios.get("/api/wallet/projects", { withCredentials: true })
      .then(res => {
        // API가 { data: [...] } 형태면 res.data.data
        setProjects(res.data.data || res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  // 2) selectedProjectId 변경 시 투자자 조회
  useEffect(() => {
    if (!selectedProjectId) {
      setInvestors([]);
      return;
    }
    setLoadingInvestors(true);
    axios.get(
      `/api/wallet/projects/${selectedProjectId}/investors`,
      { withCredentials: true }
    )
      .then(res => {
        // 앞 API가 직접 배열을 반환하고 있으므로 res.data
        setInvestors(res.data.data || res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingInvestors(false));
  }, [selectedProjectId]);

  return (
    <div className="space-y-4">
      {/* 프로젝트 선택 셀렉트 */}
      <div>
        {loadingProjects
          ? <p>프로젝트 목록을 불러오는 중…</p>
          : (
            <select
              className="border px-3 py-2 rounded w-full max-w-xs"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- 프로젝트 선택 --</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} (ID: {proj.id})
                </option>
              ))}
            </select>
          )}
      </div>

      {/* 선택 전 안내 */}
      {!selectedProjectId && !loadingProjects && (
        <p className="text-gray-500">투자자 목록을 보려면 프로젝트를 선택하세요.</p>
      )}

      {/* 투자자 테이블 */}
      {selectedProjectId && (
        loadingInvestors
          ? <p>투자자 목록을 불러오는 중…</p>
          : (
            <table className="min-w-full bg-white rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">투자자 이메일</th>
                  <th className="p-2 text-right">금액 (USDT)</th>
                  <th className="p-2 text-left">일시</th>
                </tr>
              </thead>
              <tbody>
                {investors.length === 0
                  ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">
                        투자자가 없습니다.
                      </td>
                    </tr>
                  )
                  : investors.map(inv => (
                    <tr key={inv.id} className="border-t">
                      <td className="p-2">{inv.email || inv.user_email || inv.userId}</td>
                      <td className="p-2 text-right">{parseFloat(inv.amount).toFixed(6)}</td>
                      <td className="p-2">{new Date(inv.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
      )}
    </div>
  );
}
