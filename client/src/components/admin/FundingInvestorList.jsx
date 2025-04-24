// 📁 src/components/admin/FundingInvestorList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function FundingInvestorList({ projectId }) {
  const [investors, setInvestors] = useState([]);
  useEffect(() => {
    axios.get(`/api/wallet/projects/${projectId}/investors`, { withCredentials: true })
      .then(res => setInvestors(res.data))
      .catch(console.error);
  }, [projectId]);

  if (!projectId) return <p>프로젝트를 선택해주세요.</p>;
  return (
    <table className="min-w-full bg-white rounded shadow">
      <thead className="bg-gray-100"><tr>
        <th className="p-2">투자자</th><th className="p-2">금액</th><th className="p-2">일시</th>
      </tr></thead>
      <tbody>
        {investors.map(inv => (
          <tr key={inv.id} className="border-t">
            <td className="p-2">{inv.user_email}</td>
            <td className="p-2">{inv.amount} USDT</td>
            <td className="p-2">{new Date(inv.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
