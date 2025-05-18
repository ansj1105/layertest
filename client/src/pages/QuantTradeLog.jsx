import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function QuantTradeLog() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/quant-trade/logs', { withCredentials: true })
      .then(res => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{t('quantTradeLog.title')}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">{t('quantTradeLog.table.date')}</th>
            <th className="p-2">{t('quantTradeLog.table.amount')}</th>
            <th className="p-2">{t('quantTradeLog.table.rate')}</th>
            <th className="p-2">{t('quantTradeLog.table.earnings')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="text-center border-b">
              <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
              <td className="p-2">{t('quantTradeLog.amountValue', { amount: log.amount })}</td>
              <td className="p-2">{t('quantTradeLog.rateValue', { rate: log.commission_rate })}</td>
              <td className="p-2 text-green-500 font-semibold">
                {t('quantTradeLog.earningsValue', { earnings: log.user_earning })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
