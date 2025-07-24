// 📁 src/components/WithdrawHistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, FileText, AlertCircle } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import '../styles/WithdrawHistoryPage.css';
import '../styles/topbar.css';
import AdvancedLoadingSpinner from './AdvancedLoadingSpinner';
const tabs = [
  { key: "all", labelKey: "history.tabs.all", filter: null },
  { key: "pending", labelKey: "history.tabs.pending", filter: "PENDING" },
  { key: "success", labelKey: "history.tabs.success", filter: "SUCCESS" },
  { key: "failed", labelKey: "history.tabs.failed", filter: "FAILED" },
];

// 날짜를 YYYY-MM-DD HH:mm:ss 포맷으로 변환하는 함수
function formatDateTime(date) {
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function WithdrawHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/withdrawals/history");
        setRecords(res.data.data || []);
      } catch (e) {
        console.error(e);
        setError(t("history.errorLoad"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  // 현재 탭에 맞춰 레코드 필터링
  const filtered = activeTab === "all"
    ? records
    : records.filter(r => r.status === tabs.find(tab => tab.key === activeTab).filter);

  return (
    <div className="history-page">
      <div className="history-header">
        <button
          onClick={() => navigate(-1)}
          className="history-back-button"
        >
          <ArrowLeftIcon size={24} />
        </button>

        <h2 className="history-title">{t("history.title")}</h2>

        <span className="history-spacer" />
      </div>


      {/* 탭 바 */}
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* 로딩 / 에러 */}
      {loading && <div className="flex justify-center items-center py-8">
        <AdvancedLoadingSpinner text="Loading..." />
      </div>}

      {error && <p className="text-center text-red-400">{error}</p>}

      {/* ✅ 테이블 영역 */}
      {!loading && !error && filtered.length > 0 && (
        <div className="table-scroll-wrapper">
          <table className="table-auto">
            <thead>
              <tr>
                <th>{t("history.table.id")}</th>
                <th>{t("history.table.amount")}</th>
                <th>{t("history.table.flow")}</th>
                <th>{t("history.table.method")}</th>
                <th>{t("history.table.status")}</th>
                <th>{t("history.table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.amount}</td>
                  <td>{t(`history.flow.${r.flow_type.toLowerCase()}`)}</td>
                  <td>{r.method}</td>
                  <td>{t(`history.status.${r.status.toLowerCase()}`)}</td>
                  <td>{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ 데이터 없음일 때 */}
      {!loading && !error && filtered.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">
            <FileText size={64} className="text-gray-400" />
          </div>
          <p className="no-data-text">{t("history.noData")}</p>
        </div>
      )}

    </div>
  );
}
