// 📁 src/components/OrderHistoryModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/TokenPurchasePage.css';

export default function OrderHistoryModal({ onClose }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [redeemLogs, setRedeemLogs] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRedeems, setLoadingRedeems] = useState(true);

  useEffect(() => {
    // 1) 내 주문 내역
    axios.get('/api/token/my/token-purchases', { withCredentials: true })
      .then(res => {
        if (res.data.success) setOrders(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));

    // 2) 내 환매(교환) 로그
    axios.get('/api/token/my/wallet-logs/exchange', { withCredentials: true })
      .then(res => {
        if (res.data.success) setRedeemLogs(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingRedeems(false));
  }, []);

  return (
    <div className="order-modal-overlay">
      <div className="order-modal">
        <div className="order-modal-header">
          <h3 className="order-modal-title">{t('order_history.title')}</h3>
          <button onClick={onClose} className="order-modal-close-btn">✕</button>
        </div>

        {/* 주문 내역 섹션 */}
        <section className="mb-6">
          <h3 className="order-section-title">{t('order_history.orders.title')}</h3>

          {loadingOrders ? (
            <p className="order-table-info">{t('common.loading')}</p>
          ) : orders.length === 0 ? (
            <p className="order-table-info">{t('order_history.orders.no_orders')}</p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>{t('order_history.orders.table.order_id')}</th>
                  <th>{t('order_history.orders.table.token')}</th>
                  <th>{t('order_history.orders.table.amount')}</th>
                  <th>{t('order_history.orders.table.price')}</th>
                  <th>{t('order_history.orders.table.total')}</th>
                  <th>{t('order_history.orders.table.status')}</th>
                  <th>{t('order_history.orders.table.unlock_date')}</th>
                  <th>{t('order_history.orders.table.order_date')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono">{o.id}</td>
                    <td>{o.token_id}</td>
                    <td>{o.amount}</td>
                    <td>{o.price.toFixed(6)}</td>
                    <td>{o.total_price.toFixed(6)}</td>
                    <td>{t(`order_history.orders.status.${o.status.toLowerCase()}`)}</td>
                    <td>
                      {o.lockup_until
                        ? new Date(o.lockup_until).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 환매(교환) 로그 */}
        <section>
          <h3 className="order-section-title">{t('order_history.redemptions.title')}</h3>

          {loadingRedeems ? (
            <p className="order-table-info">{t('common.loading')}</p>
          ) : redeemLogs.length === 0 ? (
            <p className="order-table-info">{t('order_history.redemptions.no_redemptions')}</p>
          ) : (
            <div className="order-table">
              <table className="redeem-table">
                <thead>
                  <tr>
                    <th>{t('order_history.redemptions.table.log_id')}</th>
                    <th>{t('order_history.redemptions.table.date')}</th>
                    <th>{t('order_history.redemptions.table.direction')}</th>
                    <th>{t('order_history.redemptions.table.amount')}</th>
                    <th>{t('order_history.redemptions.table.balance')}</th>
                    <th>{t('order_history.redemptions.table.ref_type')}</th>
                    <th>{t('order_history.redemptions.table.ref_id')}</th>
                    <th>{t('order_history.redemptions.table.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemLogs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono">{log.id}</td>
                      <td>{new Date(log.log_date).toLocaleString()}</td>
                      <td>{t(`order_history.redemptions.direction.${log.direction}`)}</td>
                      <td>{parseFloat(log.amount).toFixed(6)}</td>
                      <td>{parseFloat(log.balance_after).toFixed(6)}</td>
                      <td>{t(`order_history.redemptions.ref_type.${log.reference_type.toLowerCase().replace('token_', '')}`)}</td>
                      <td className="font-mono">{log.reference_id}</td>
                      <td>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
