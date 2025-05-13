// 📁 src/pages/AdminWithdrawalsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav";

const TABS = [
  { key: "PENDING", label: "대기 중" },
  { key: "SUCCESS", label: "완료"     },
  { key: "FAILED",  label: "거절"     },
];

export default function AdminWithdrawalsPage({ onLogout }) {
  const [activeTab, setActiveTab]   = useState("PENDING");
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetchList();
  }, [activeTab]);

  async function fetchList() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/withdrawals", {
        params: { status: activeTab }
      });
      setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("출금 내역을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    try {
      await axios.put(`/api/withdrawals/${id}/${action}`);
      fetchList();
    } catch (err) {
      console.error(err);
      alert(`${action === "approve" ? "승인" : "거절"} 처리에 실패했습니다.`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full space-y-6">
        <h1 className="text-2xl font-bold">출금 요청 관리</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <section className="bg-white p-4 rounded shadow">
          {loading && <p className="text-center">로딩 중…</p>}
          {error   && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-center text-gray-500">내역이 없습니다.</p>
          )}

          {!loading && items.length > 0 && (
            <div className="overflow-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">유저</th>
                    <th className="px-2 py-1">금액</th>
                    <th className="px-2 py-1">주소</th>
                    <th className="px-2 py-1">수단</th>
                    <th className="px-2 py-1">상태</th>
                    <th className="px-2 py-1">요청일</th>
                    {activeTab === "PENDING" && <th className="px-2 py-1">액션</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(wd => (
                    <tr key={wd.id} className="border-t">
                      <td className="px-2 py-1">{wd.id}</td>
                      <td className="px-2 py-1">{wd.username}</td>
                      <td className="px-2 py-1">{wd.amount}</td>
                      <td className="px-2 py-1">{wd.to_address}</td>
                      <td className="px-2 py-1">{wd.method}</td>
                      <td className="px-2 py-1">{wd.status}</td>
                      <td className="px-2 py-1">{new Date(wd.created_at).toLocaleString()}</td>
                      {activeTab === "PENDING" && (
                        <td className="px-2 py-1 space-x-2">
                          <button
                            onClick={() => handleAction(wd.id, "approve")}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleAction(wd.id, "reject")}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            거절
                          </button>
                        </td>
                      )}
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
