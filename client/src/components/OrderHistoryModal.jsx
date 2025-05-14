// 📁 src/components/OrderHistoryModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TokenPurchasePage.css';

export default function OrderHistoryModal({ onClose }) {
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
        {/* 닫기 버튼 */}

        <div className="order-modal-header">
          <h3 className="order-modal-title">나의 주문 및 환매 내역</h3>
          <button onClick={onClose} className="order-modal-close-btn">✕</button>
        </div>
 

        {/* 모달 제목 */}
        

        {/* 주문 내역 섹션 */}
        <section className="mb-6">
          <h3 className="order-section-title">주문 내역</h3>

          {loadingOrders ? (
            <p className="order-table-info">로딩 중...</p>
          ) : orders.length === 0 ? (
            <p className="order-table-info">주문 내역이 없습니다.</p>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>주문 ID</th>
                  <th>토큰</th>
                  <th>수량</th>
                  <th>단가(USDT)</th>
                  <th>총액(USDT)</th>
                  <th>상태</th>
                  <th>락업 해제일</th>
                  <th>주문일</th>
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
                    <td>{o.status}</td>
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
          <h3 className="order-section-title">환매(교환) 내역</h3>

          {loadingRedeems ? (
            <p className="order-table-info">로딩 중...</p>
          ) : redeemLogs.length === 0 ? (
            <p className="order-table-info">환매 내역이 없습니다.</p>
          ) : (
            <div className="order-table">
              <table className="redeem-table">
                <thead>
                  <tr>
                    <th>로그 ID</th>
                    <th>날짜</th>
                    <th>방향</th>
                    <th>수량</th>
                    <th>잔액</th>
                    <th>참조 타입</th>
                    <th>참조 ID</th>
                    <th>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemLogs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono">{log.id}</td>
                      <td>{new Date(log.log_date).toLocaleString()}</td>
                      <td>{log.direction}</td>
                      <td>{parseFloat(log.amount).toFixed(6)}</td>
                      <td>{parseFloat(log.balance_after).toFixed(6)}</td>
                      <td>{log.reference_type}</td>
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
