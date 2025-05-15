// 📁 src/pages/EscrowOrdersPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import '../styles/EscrowOrdersPage.css';
import '../styles/topbar.css';
export default function EscrowOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/projects/funding-investments", { withCredentials: true })
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => {
        console.error("❌ failed to load escrow orders:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);
 
  return (
    <div className="escrow-page-wrapper">
      <div className="escrow-page-top-bar">
        <button onClick={() => navigate(-1)} className="escrow-back-button">
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="escrow-page-top-h-text">에스크로 주문</h1>
      </div>
      {loading ? (
        <p className="escrow-order-message">로딩 중...</p>
      ) : orders.length === 0 ? (
        <p className="escrow-order-message">더 이상은 없어</p>
      ) : (
        <ul className="escrow-order-list">
          {orders.map((o) => (
            <li key={o.id} className="escrow-order-item">
              <div className="escrow-order-title">{o.project_name}</div>
              <div className="escrow-order-info">
                <span>투자 금액:</span> {parseFloat(o.amount).toFixed(6)} USDT
              </div>
              <div className="escrow-order-info">
                <span>수익:</span> {parseFloat(o.profit).toFixed(6)} USDT
              </div>
              <div className="escrow-order-date">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
