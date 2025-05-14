// 📁 src/pages/admin/TokenLogsPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function TokenLogsPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'redeems'
  const [purchases, setPurchases] = useState([]);
  const [redeemLogs, setRedeemLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 구매내역 조회
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/token/token-purchases');
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error("구매내역 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 환매로그 조회
  const fetchRedeems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/tokens/wallet-logs/exchange');
      if (res.data.success) setRedeemLogs(res.data.data);
    } catch (err) {
      console.error("환매로그 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 탭 전환 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    } else {
      fetchRedeems();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav onLogout={onLogout} />

      <div className="ml-64 p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">토큰 로그 조회</h1>

        {/* 탭 버튼 */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'purchases' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('purchases')}
          >
            구매내역
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === 'redeems' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('redeems')}
          >
            환매내역
          </button>
        </div>

        {/* 구매내역 탭 */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3">전체 주문 목록</h2>
            {loading ? (
              <p className="text-center py-8">로딩 중...</p>
            ) : purchases.length === 0 ? (
              <p className="text-center py-8">주문 내역이 없습니다.</p>
            ) : (
              <div className="overflow-auto max-h-[50vh]">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-2 py-1">ID</th>
                      <th className="px-2 py-1">User</th>
                      <th className="px-2 py-1">Token</th>
                      <th className="px-2 py-1">Sale</th>
                      <th className="px-2 py-1">Amount</th>
                      <th className="px-2 py-1">Total Price</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Lockup Until</th>
                      <th className="px-2 py-1">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="px-2 py-1">{p.id}</td>
                        <td className="px-2 py-1">{p.user_id}</td>
                        <td className="px-2 py-1">{p.token_id}</td>
                        <td className="px-2 py-1">{p.sale_id}</td>
                        <td className="px-2 py-1">{p.amount}</td>
                        <td className="px-2 py-1">{p.total_price}</td>
                        <td className="px-2 py-1">{p.status}</td>
                        <td className="px-2 py-1">
                          {p.lockup_until
                            ? new Date(p.lockup_until).toLocaleString()
                            : ''}
                        </td>
                        <td className="px-2 py-1">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 환매내역 탭 */}
        {activeTab === 'redeems' && (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-3">환매(교환) 내역</h2>
            {loading ? (
              <p className="text-center py-8">로딩 중...</p>
            ) : redeemLogs.length === 0 ? (
              <p className="text-center py-8">환매 내역이 없습니다.</p>
            ) : (
              <div className="overflow-auto max-h-[50vh]">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-2 py-1">로그 ID</th>
                      <th className="px-2 py-1">User ID</th>
                      <th className="px-2 py-1">날짜</th>
                      <th className="px-2 py-1">방향</th>
                      <th className="px-2 py-1">수량</th>
                      <th className="px-2 py-1">잔액</th>
                      <th className="px-2 py-1">참조 ID</th>
                      <th className="px-2 py-1">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redeemLogs.map(log => (
                      <tr key={log.id} className="border-t">
                        <td className="px-2 py-1">{log.id}</td>
                        <td className="px-2 py-1">{log.user_id}</td>
                        <td className="px-2 py-1">
                          {new Date(log.log_date).toLocaleString()}
                        </td>
                        <td className="px-2 py-1">{log.direction}</td>
                        <td className="px-2 py-1">
                          {parseFloat(log.amount).toFixed(6)}
                        </td>
                        <td className="px-2 py-1">
                          {parseFloat(log.balance_after).toFixed(6)}
                        </td>
                        <td className="px-2 py-1">{log.reference_id}</td>
                        <td className="px-2 py-1">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
