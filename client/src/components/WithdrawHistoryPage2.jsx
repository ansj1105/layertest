// 📁 src/components/WithdrawHistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const tabs = [
  { key: "all",     labelKey: "history.tabs.all",      filter: null },
  { key: "pending", labelKey: "history.tabs.pending",  filter: "PENDING" },
  { key: "success", labelKey: "history.tabs.success",  filter: "SUCCESS" },
  { key: "failed",  labelKey: "history.tabs.failed",   filter: "FAILED" },
];

export default function WithdrawHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-yellow-200 hover:text-yellow-100"
        >
          <ArrowLeftIcon size={20} />
          <span>{t("history.back")}</span>
        </button>
        <h2 className="text-xl font-bold">{t("history.title")}</h2>
        <span className="w-6" />
      </div>

      {/* 탭 바 */}
      <div className="flex border-b border-yellow-700 text-sm mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-center border-b-2 ${
              activeTab === tab.key
                ? "border-yellow-400 font-bold text-yellow-100"
                : "border-transparent text-gray-400"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* 로딩 / 에러 */}
      {loading && <p className="text-center">{t("history.loading")}</p>}
      {error   && <p className="text-center text-red-400">{error}</p>}

      {/* 테이블 */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-800 text-yellow-200">
              <tr>
                <th className="px-2 py-1">{t("history.table.id")}</th>
                <th className="px-2 py-1">{t("history.table.amount")}</th>
                <th className="px-2 py-1">{t("history.table.flow")}</th>
                <th className="px-2 py-1">{t("history.table.method")}</th>
                <th className="px-2 py-1">{t("history.table.status")}</th>
                <th className="px-2 py-1">{t("history.table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-700">
                  <td className="px-2 py-1">{r.id}</td>
                  <td className="px-2 py-1">{r.amount}</td>
                  <td className="px-2 py-1">
                    {t(`history.flow.${r.flow_type.toLowerCase()}`)}
                  </td>
                  <td className="px-2 py-1">{r.method}</td>
                  <td className="px-2 py-1">{t(`history.status.${r.status.toLowerCase()}`)}</td>
                  <td className="px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center mt-20">
          <img
            src="/img/no-data.png"
            className="w-12 h-12 mx-auto mb-2"
            alt={t("history.noDataAlt")}
          />
          <p className="text-sm text-gray-400">{t("history.noData")}</p>
        </div>
      )}
    </div>
  );
}
