// 📁 src/components/admin/FundingMonitoring.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function FundingMonitoring({ projectId }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    axios.get(`/api/wallet/projects/${projectId}/stats`, { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [projectId]);

  if (!projectId) return <p>프로젝트를 선택해주세요.</p>;
  if (!stats) return <p>로딩 중...</p>;

  const { target, current, progressPercent, daysLeft } = stats;
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">진행 통계</h3>
      <p>목표금액: {target} USDT</p>
      <p>현재금액: {current} USDT</p>
      <p>진행률: {progressPercent.toFixed(2)}%</p>
      <p>남은 기간: {daysLeft}일</p>
      <div className="w-full h-4 bg-gray-200 rounded mt-2">
        <div
          className="h-4 bg-yellow-500 rounded"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
