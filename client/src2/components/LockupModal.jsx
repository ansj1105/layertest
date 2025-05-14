// 📁 src/components/LockupModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TokenPurchasePage.css';
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
    <div className="lockup-modal-overlay">
      <div className="lockup-modal">
        <div className="lockup-modal-header">
          <h3 className="lockup-modal-title">락업 상세 내역</h3>
          <button
            onClick={onClose}
            className="lockup-modal-close-btn"
          >
            ✕
          </button>
        </div>

      {/* 본문 */}
      {loading ? (
        <p className="text-center">로딩 중…</p>
      ) : (
        <>
            <div className="lockup-summary">
              <div>
                총 잔액: <span className="font-semibold">{walletDetails.wallet.balance.toFixed(6)} USC</span>
              </div>
              <div>
                전체 락업: <span className="font-semibold">{walletDetails.wallet.locked_amount.toFixed(6)} USC</span>
              </div>
            </div>

            {walletDetails.lockups.length === 0 ? (
              <p className="text-center">진행 중인 락업이 없습니다.</p>
            ) : (
              <table className="lockup-table">
                <thead>
                  <tr>
                    <th>락업 ID</th>
                    <th>수량</th>
                    <th>해제일</th>
                  </tr>
                </thead>
                <tbody>
                  {walletDetails.lockups.map(l => (
                    <tr key={l.id}>
                      <td className="lockup-id">{l.id}</td>
                      <td>{l.amount.toFixed(6)}</td>
                      <td>{new Date(l.unlock_at).toLocaleString()}</td>
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
