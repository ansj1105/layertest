import { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuantTradeLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/quant-trade/logs', { withCredentials: true })
      .then(res => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">📄 정량 거래 내역</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">일자</th>
            <th className="p-2">금액</th>
            <th className="p-2">수익률</th>
            <th className="p-2">내 수익</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="text-center border-b">
              <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
              <td className="p-2">{log.amount} USDT</td>
              <td className="p-2">{log.commission_rate}%</td>
              <td className="p-2 text-green-500 font-semibold">{log.user_earning} USDT</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
