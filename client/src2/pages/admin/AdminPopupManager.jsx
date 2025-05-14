import { useEffect, useState } from "react";
import axios from "axios";
import AdminNav from "../../components/admin/AdminNav"; // ✅ 네비게이션 임포트

export default function AdminPopupManager({ onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newPopup, setNewPopup] = useState({ title: "", content: "" });

  const fetchMessages = async () => {
    const res = await axios.get("/api/popups");
    setMessages(res.data);
  };

  const handleCreate = async () => {
    if (!newPopup.title || !newPopup.content) return alert("제목과 내용을 입력하세요.");
    await axios.post("/api/popups", newPopup);
    setNewPopup({ title: "", content: "" });
    fetchMessages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await axios.delete(`/api/popups/${id}`);
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ 상단 네비게이션 */}
      <AdminNav onLogout={onLogout} />

      {/* ✅ 본문 */}
      <div className="p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4">📢 팝업 메시지 관리</h2>

        {/* 등록 폼 */}
        <div className="space-y-2 mb-4">
          <input
            className="border p-2 w-full rounded"
            placeholder="제목"
            value={newPopup.title}
            onChange={(e) => setNewPopup({ ...newPopup, title: e.target.value })}
          />
          <textarea
            className="border p-2 w-full rounded"
            placeholder="내용"
            value={newPopup.content}
            onChange={(e) => setNewPopup({ ...newPopup, content: e.target.value })}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCreate}
          >
            등록
          </button>
        </div>

        {/* 리스트 */}
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="border p-3 rounded shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold">{msg.title}</p>
                <p className="text-sm text-gray-700">{msg.content}</p>
              </div>
              <button
                className="text-red-500 text-sm hover:underline"
                onClick={() => handleDelete(msg.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
