// 📁 src/components/LockupModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/TokenPurchasePage.css';

export default function LockupModal({ onClose }) {
  const { t } = useTranslation();
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
          <h3 className="lockup-modal-title">{t('lockup.title')}</h3>
          <button
            onClick={onClose}
            className="lockup-modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        {loading ? (
          <p className="text-center">{t('common.loading')}</p>
        ) : (
          <>
            <div className="lockup-summary">
              <div>
                {t('lockup.total_balance')}: <span className="font-semibold">{walletDetails.wallet.balance.toFixed(6)} USC</span>
              </div>
              <div>
                {t('lockup.total_locked')}: <span className="font-semibold">{walletDetails.wallet.locked_amount.toFixed(6)} USC</span>
              </div>
            </div>

            {walletDetails.lockups.length === 0 ? (
              <p className="text-center">{t('lockup.no_active_lockups')}</p>
            ) : (
              <table className="lockup-table">
                <thead>
                  <tr>
                    <th>{t('lockup.table.id')}</th>
                    <th>{t('lockup.table.amount')}</th>
                    <th>{t('lockup.table.unlock_date')}</th>
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
