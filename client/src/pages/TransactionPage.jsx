
// ✅ 프론트: TransactionPage.jsx (axios 사용)
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/transactions');
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">From</th>
              <th className="px-2 py-1 text-left">To</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Status</th>
              <th className="px-2 py-1 text-left">TX Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((tx, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1 break-all">{tx.from_address}</td>
                <td className="px-2 py-1 break-all">{tx.to_address}</td>
                <td className="px-2 py-1">{tx.amount_usdt}</td>
                <td className="px-2 py-1">{tx.status}</td>
                <td className="px-2 py-1 break-all text-blue-500">{tx.tx_hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}