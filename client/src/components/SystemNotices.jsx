import { useEffect, useState } from "react";
import axios from "axios";

export default function SystemNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/messages/notices")
      .then(res => setNotices(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📢 시스템 공지</h2>
      <ul className="space-y-2">
        {notices.map((n, idx) => (
          <li key={idx} className="bg-white rounded p-4 shadow">
            <div className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
            <div className="font-semibold">{n.title}</div>
            <div>{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
