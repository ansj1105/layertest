// 📁 src/components/OrderHistoryModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrderHistoryModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/token/my/token-purchases', { withCredentials: true })
      .then(res => {
        if (res.data.success) setOrders(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div
        className="
          bg-black text-teal-300
          border-2 border-teal-400
          shadow-[0_0_20px_rgba(0,255,200,0.7)]
          w-[90%] max-w-2xl
          max-h-[80vh] overflow-y-auto
          p-6 rounded-lg relative
        "
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-teal-300 hover:text-white"
        >✕</button>
        <h2 className="text-2xl font-bold mb-4">나의 주문 내역</h2>

        {loading ? (
          <p className="text-center mt-8">로딩 중...</p>
        ) : orders.length === 0 ? (
          <p className="text-center mt-8">주문 내역이 없습니다.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-teal-900/50 sticky top-0">
              <tr>
                <th className="p-2">주문 ID</th>
                <th className="p-2">토큰</th>
                <th className="p-2">수량</th>
                <th className="p-2">단가(USDT)</th>
                <th className="p-2">총액(USDT)</th>
                <th className="p-2">상태</th>
                <th className="p-2">락업 해제일</th>
                <th className="p-2">주문일</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-teal-600">
                  <td className="p-2 font-mono">{o.id}</td>
                  <td className="p-2">{o.token_id}</td>
                  <td className="p-2">{o.amount}</td>
                  <td className="p-2">{o.price.toFixed(6)}</td>
                  <td className="p-2">{o.total_price.toFixed(6)}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">
                    {o.lockup_until 
                      ? new Date(o.lockup_until).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td className="p-2">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
