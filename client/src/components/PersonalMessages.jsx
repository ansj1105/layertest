import { useEffect, useState } from "react";
import axios from "axios";

export default function PersonalMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("http://54.85.128.211:4000/api/messages/inbox", { withCredentials: true })
      .then(res => setMessages(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📨 내 메시지</h2>
      <ul className="space-y-2">
        {messages.map((m, idx) => (
          <li key={idx} className="bg-white rounded p-4 shadow">
            <div className="text-sm text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
            <div>{m.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
