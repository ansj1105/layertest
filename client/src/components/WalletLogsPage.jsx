// 📁 src/pages/WalletLogsPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from 'lucide-react';

export default function WalletLogsPage() {
  const { t } = useTranslation();
  const [tab, setTab]         = useState('transfer');
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  // 더미 데이터: 개발중인 탭용
  const [walletEarnings, setWalletEarnings] = useState([]);
  const dummyFinanceIncome = [
    { id:1, date:'2025-05-04', amount:0.75 },
    { id:2, date:'2025-05-02', amount:0.30 },
  ];

  useEffect(() => {
    if (tab === 'transfer') {
      setLoading(true);
      axios.get('/api/logs/transfer-logs', { withCredentials:true })
        .then(res => setLogs(res.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
           } else if (tab === 'walletEarnings') {
               setLoading(true);
               axios.get('/api/logs/funding-profits', { withCredentials:true })
                 .then(res => setWalletEarnings(res.data.data || []))
                 .catch(console.error)
                 .finally(() => setLoading(false));
              
    }
  }, [tab]);

  const renderRows = (data, isTransfer = true) => {
    if (!data.length) {
      return (
        <tr>
          <td colSpan={isTransfer ? 5 : 2} className="text-center py-4 text-gray-400">
            {t('walletLogs.noRecords')}
          </td>
        </tr>
      );
    }

    return data.map(r => (
      <tr key={r.id} className="border-b last:border-0">
        {isTransfer ? (
          <>
            <td className="p-2">
              {t(`walletLogs.types.${r.type}`)}
            </td>
            <td className="p-2">
              {parseFloat(r.amount).toFixed(6)}
            </td>
            <td className="p-2">
              {parseFloat(r.fee).toFixed(6)}
            </td>
            <td className="p-2">
              {parseFloat(r.netAmount).toFixed(6)}
            </td>
            <td className="p-2">
              {new Date(r.createdAt).toLocaleDateString()}
            </td>
          </>
        ) : (
          <>
            <td className="p-2">{r.date}</td>
            <td className="p-2">{r.amount.toFixed(6)} USDT</td>
          </>
        )}
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 뒤로가기 */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span className="ml-1">{t('walletLogs.back')}</span>
      </button>

      {/* 제목 */}
      <h1 className="text-xl font-semibold mb-4">
        {t('walletLogs.title')}
      </h1>

      {/* 탭 */}
      <div className="flex space-x-2 mb-4">
        {['transfer','walletEarnings','financeIncome'].map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded ${
              tab === key
                ? 'bg-yellow-600 text-black'
                : 'bg-[#2c1f0f]'
            }`}
          >
            {t(`walletLogs.tabs.${key}`)}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      {tab === 'transfer' && (
        <table className="w-full bg-[#2c1f0f] rounded overflow-hidden">
          <thead className="bg-[#3a270e]">
            <tr>
              <th className="p-2">{t('walletLogs.columns.type')}</th>
              <th className="p-2">{t('walletLogs.columns.amount')}</th>
              <th className="p-2">{t('walletLogs.columns.fee')}</th>
              <th className="p-2">{t('walletLogs.columns.net')}</th>
              <th className="p-2">{t('walletLogs.columns.date')}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {t('walletLogs.loading')}
                  </td>
                </tr>
              )
              : renderRows(logs, true)
            }
          </tbody>
        </table>
      )}

      {tab === 'walletEarnings' && (
        <table className="w-full bg-[#2c1f0f] rounded overflow-hidden">
          <thead className="bg-[#3a270e]">
            <tr>
              <th className="p-2">{t('walletLogs.columns.date')}</th>
              <th className="p-2">{t('walletLogs.columns.amount')}</th>
            </tr>
          </thead>
          <tbody>
                {loading
         ? (
           <tr>
             <td colSpan={2} className="text-center py-4">
               {t('walletLogs.loading')}
             </td>
           </tr>
         )
         : renderRows(
             walletEarnings.map(log => ({
              id: log.id,
               date: new Date(log.createdAt).toLocaleDateString(),
               amount: parseFloat(log.amount)
             })),
             false
           )
       }
          </tbody>
        </table>
      )}

      {tab === 'financeIncome' && (
        <table className="w-full bg-[#2c1f0f] rounded overflow-hidden">
          <thead className="bg-[#3a270e]">
            <tr>
              <th className="p-2">{t('walletLogs.columns.date')}</th>
              <th className="p-2">{t('walletLogs.columns.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {renderRows(dummyFinanceIncome, false)}
          </tbody>
        </table>
      )}
    </div>
  );
}
