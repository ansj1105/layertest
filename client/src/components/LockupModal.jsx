// 📁 src/components/LockupModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LockupModal({ onClose }) {
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/token/my/wallet-details', { withCredentials: true })
      .then(res => {
        if (res.data.success) setWalletDetails(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#002b2b] text-emerald-200 rounded-lg w-11/12 max-w-lg p-6 border-2 border-emerald-400 overflow-y-auto max-h-[70vh]">
      <div className="relative mb-4">
        <h3 className="text-xl font-bold neon-text">
          락업 상세 내역
        </h3>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-1 mr-1 text-emerald-200 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* 본문 */}
      {loading ? (
        <p className="text-center">로딩 중…</p>
      ) : (
        <>
            <div className="mb-4">
              <div>총 잔액: <span className="font-semibold">{walletDetails.wallet.balance.toFixed(6)} USC</span></div>
              <div>전체 락업: <span className="font-semibold">{walletDetails.wallet.locked_amount.toFixed(6)} USC</span></div>
            </div>

            {walletDetails.lockups.length === 0 ? (
              <p className="text-center">진행 중인 락업이 없습니다.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-400">
                    <th className="p-2">락업 ID</th>
                    <th className="p-2">수량</th>
                    <th className="p-2">해제일</th>
                  </tr>
                </thead>
                <tbody>
                  {walletDetails.lockups.map(l => (
                    <tr key={l.id} className="border-b border-gray-700">
                      <td className="p-2 font-mono">{l.id}</td>
                      <td className="p-2">{l.amount.toFixed(6)}</td>
                      <td className="p-2">{new Date(l.unlock_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
