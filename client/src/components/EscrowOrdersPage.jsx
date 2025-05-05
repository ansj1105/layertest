// 📁 src/pages/EscrowOrdersPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* ← back button + title */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span className="ml-2 font-semibold">에스크로 주문</span>
      </button>

      {loading ? (
        <p className="text-center text-gray-400">로딩 중...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-400">더 이상은 없어</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="bg-[#2e1c10] p-4 rounded-lg shadow-sm"
            >
              <div className="font-semibold mb-1 text-white">
                {o.project_name}
              </div>
              <div className="text-sm">
                <span className="text-gray-300">투자 금액:</span>{" "}
                {parseFloat(o.amount).toFixed(6)} USDT
              </div>
              <div className="text-sm">
                <span className="text-gray-300">수익:</span>{" "}
                {parseFloat(o.profit).toFixed(6)} USDT
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
