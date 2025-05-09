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
  // → 여기서 walletEarnings 는 quantProfits 로 이름 변경
  const [quantProfits, setQuantProfits] = useState([]);
  // 더미 데이터: 개발중인 탭용
  const [walletLogs, setWalletLogs]     = useState([]);
  const [walletEarnings, setWalletEarnings] = useState([]);
  const dummyFinanceIncome = [
    { id:1, date:'2025-05-04', amount:0.75 },
    { id:2, date:'2025-05-02', amount:0.30 },
    { id:3, date:'2025-05-04', amount:0.75 },
    { id:4, date:'2025-05-02', amount:0.30 },
    { id:5, date:'2025-05-04', amount:0.75 },
    { id:6, date:'2025-05-02', amount:0.30 },
    { id:7, date:'2025-05-04', amount:0.75 },
    { id:8, date:'2025-05-02', amount:0.30 },
    { id:9, date:'2025-05-04', amount:0.75 },
    { id:10, date:'2025-05-02', amount:0.30 },
    { id:11, date:'2025-05-04', amount:0.75 },
    { id:12, date:'2025-05-02', amount:0.30 },
  ];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
  

  useEffect(() => {
      if (tab === 'transfer') {
          // transfer-logs 호출
          setLoading(true);
          axios.get('/api/logs/transfer-logs', { withCredentials:true })
            .then(res => setLogs(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
      
        } else if (tab === 'walletEarnings') {
          // quant-profits 호출
          setLoading(true);
          console.log('📡 fetching quant-profits…');
         axios.get('/api/logs/quant-profits', { withCredentials:true })
            .then(res => {
              console.log('✅ quant-profits response', res.data.data);
              setQuantProfits(res.data.data || []);
            })
            .catch(err => {
              console.error('❌ quant-profits error', err);
            })
            .finally(() => setLoading(false));
               } else if (tab === 'financeIncome') {
                   // wallets_log 호출
                   axios.get('/api/logs/wallets-log', { withCredentials:true })
                     .then(res => {
                       // in 방향만 필터
                       setWalletLogs((res.data.data || []).filter(r => r.direction === 'in'));
                     })
                     .catch(console.error)
                     .finally(() => setLoading(false));
      
        } else {
          // financeIncome or 기타
          setLoading(false);
        }
  }, [tab]);



  // 현재 보여줄 데이터, totalPages 계산
  const data = tab === 'transfer'
    ? logs
    : tab === 'walletEarnings'
      ? quantProfits
      : tab === 'financeIncome'
        ? walletLogs
        : [];

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pagedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderRows = (dataSlice, isTransfer = true) => {
    if (!dataSlice.length) {
      return (
        <tr>
          <td colSpan={isTransfer ? 5 : (tab === 'walletEarnings' ? 3 : 3)}
              className="text-center py-4 text-gray-400">
            {t('walletLogs.noRecords')}
          </td>
        </tr>
      );
    }

    
    return dataSlice.map(r => (
      <tr key={r.id} className="border-b last:border-0">
        {isTransfer ? (
          <>
            <td className="p-2">{t(`walletLogs.types.${r.type}`)}</td>
            <td className="p-2">{parseFloat(r.amount).toFixed(6)}</td>
            <td className="p-2">{parseFloat(r.fee).toFixed(6)}</td>
            <td className="p-2">{parseFloat(r.netAmount).toFixed(6)}</td>
            <td className="p-2">{new Date(r.createdAt).toLocaleDateString()}</td>
          </>
        ) : tab === 'walletEarnings' ? (
          <>
            <td className="p-2">{new Date(r.created_at).toLocaleDateString()}</td>
            <td className="p-2">{parseFloat(r.amount).toFixed(6)} USDT</td>
            <td className="p-2">{t(`walletLogs.quantTypes.${r.type}`)}</td>
          </>
        ) : /* financeIncome */ (
          <>
            <td className="p-2">{new Date(r.logDate).toLocaleDateString()}</td>
            <td className="p-2">{parseFloat(r.amount).toFixed(6)} USDT</td>
            <td className="p-2">{r.description}</td>
          </>
        )}
      </tr>
    ));
  };

  // 페이지 네비게이션 UI
  const Pagination = () => (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-[#2c1f0f] rounded disabled:opacity-50"
      >
        {t('walletLogs.prev')}
      </button>
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-yellow-600 text-black'
                : 'bg-[#2c1f0f]'
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-[#2c1f0f] rounded disabled:opacity-50"
      >
        {t('walletLogs.next')}
      </button>
    </div>
  );
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
      {/* 테이블 공통 */}
      <table className="w-full bg-[#2c1f0f] rounded overflow-hidden">
        <thead className="bg-[#3a270e]">
          {tab === 'transfer' && (
            <tr>
              <th className="p-2">{t('walletLogs.columns.type')}</th>
              <th className="p-2">{t('walletLogs.columns.amount')}</th>
              <th className="p-2">{t('walletLogs.columns.fee')}</th>
              <th className="p-2">{t('walletLogs.columns.net')}</th>
              <th className="p-2">{t('walletLogs.columns.date')}</th>
            </tr>
          )}
          {tab === 'walletEarnings' && (
            <tr>
              <th className="p-2">{t('walletLogs.columns.date')}</th>
              <th className="p-2">{t('walletLogs.columns.amount')}</th>
              <th className="p-2">{t('walletLogs.columns.category')}</th>
            </tr>
          )}
          {tab === 'financeIncome' && (
            <tr>
            <th className="p-2">{t('walletLogs.columns.date')}</th>
            <th className="p-2">{t('walletLogs.columns.amount')}</th>
            <th className="p-2">{t('walletLogs.columns.description')}</th>
          </tr>
        )}
        </thead>
        <tbody>
          {loading
            ? (
              <tr>
                <td colSpan={tab === 'financeIncome' ? 3 : 5} className="text-center py-4">
                  {t('walletLogs.loading')}
                </td>
              </tr>
            )
            : renderRows(pagedData, tab === 'transfer')
          }
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {!loading && data.length > pageSize && <Pagination />}
    </div>
  );
}
