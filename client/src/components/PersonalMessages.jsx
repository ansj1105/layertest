import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import AdvancedLoadingSpinner from './AdvancedLoadingSpinner';
export default function PersonalMessages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/messages/inbox", { withCredentials: true })
      .then(res => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {t('messages.title')}
      </h2>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <AdvancedLoadingSpinner text="Loading..." />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-500">{t('messages.no_messages')}</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((m, idx) => (
            <li key={idx} className="bg-white rounded p-4 shadow">
              <div className="text-sm text-gray-500">
                {new Date(m.created_at).toLocaleString()}
              </div>
              <div>{m.body}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
