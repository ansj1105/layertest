// 📁 src/pages/admin/AdminWalletsPage.jsx
import { useState,useEffect} from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';
import DepositModal from '../../components/admin/DepositModal';
export default function AdminWalletsPage({ onLogout }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalWallet, setModalWallet] = useState(null);

  // ▶ handleDeposited 함수 추가
  const handleDeposited = (data) => {
    // data = { wallet_id, fund_balance, real_amount }
    setWallets(ws =>
      ws.map(w =>
        w.wallet_id === data.wallet_id
          ? { ...w, fund_balance: data.fund_balance, real_amount: data.real_amount }
          : w
      )
    );
  };
  // 1) 마운트 시: 지갑 기본 정보만 조회

  useEffect(() => {
      axios.get('/api/withdrawals/wallets')
        .then(res => {
          console.log('응답 전체:', res.data);
          console.log('지갑 목록 배열:', res.data.data);
          // data가 바로 배열이므로 res.data.data를 사용
          setWallets(res.data.data || []);
        })
         .catch(console.error);
     }, []);

     
  // 전체 조회
  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1) real-amount/all 응답
      const res = await axios.get('/api/withdrawals/real-amount/all', { withCredentials: true });
      console.log('📥 real-amount/all 응답:', res.data);
        const walletsRes = await axios.get('/api/withdrawals/wallets', { withCredentials: true });
        console.log('📥 /withdrawals/wallets 응답 전체:', walletsRes.data);
        const walletsList = walletsRes.data.data || [];
      
        // 병합
        const merged = walletsList.map(w => {
        return {
          ...w,
          real_amount: upd?.real_amount ?? w.real_amount,
          diff: upd?.diff ?? 0
        };
      });
      console.log('🔀 병합된 지갑 데이터:', merged);

      setWallets(merged);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('❌ fetchAll 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 개별 조회
  const refreshOne = async (id) => {
    setRefreshing(id);
    try {
      await axios.get(`/api/withdrawals/real-amount/${id}`, { withCredentials: true });
      await fetchAll();
    } catch (err) {
      console.error('❌ refreshOne 오류:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">💼 지갑 관리</h1>

        <div className="mb-2 flex justify-between items-center">
          <div>
            최종 업데이트: <span className="font-semibold">{lastUpdated || '-'}</span>
          </div>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전체 조회
          </button>
        </div>

        <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
            <tr>
              <th className="p-2">사용자 ID</th>
              <th className="p-2">사용자 이메일</th>
              <th className="p-2">사용자 이름</th>
              <th className="p-2">지갑 ID</th>
              <th className="p-2">주소</th>
              <th className="p-2">퀀트 잔액</th>
              <th className="p-2">펀딩 잔액</th>
              <th className="p-2">실제 잔액</th>
              <th className="p-2">업데이트 시각</th>
              <th className="p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {wallets.length === 0 ? (
              <tr><td colSpan={10}>조회된 지갑이 없습니다</td></tr>
            ) : wallets.map(w => (
              <tr key={w.wallet_id} className="border-t text-center">
                <td className="p-2">{w.user_id}</td>
                <td className="p-2">{w.user_email}</td>
                <td className="p-2">{w.user_name}</td>
                <td className="p-2">{w.wallet_id}</td>
                <td className="p-2 font-mono break-all">{w.address}</td>
                <td className="p-2">{parseFloat(w.quant_balance).toFixed(6)}</td>
                <td className="p-2">{parseFloat(w.fund_balance).toFixed(6)}</td>
                <td className="p-2">{parseFloat(w.real_amount).toFixed(6)}</td>
                <td className="p-2">{new Date(w.updated_at).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => refreshOne(w.wallet_id)}
                    disabled={refreshing === w.id}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {refreshing === w.id ? '재조회 중...' : '재조회'}
                  </button>
                                   <button
                   onClick={() => setModalWallet(w)}
                   className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                 >
                   유저입금
                 </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        +       {/* 입금 모달 */}
       {modalWallet && (
         <DepositModal
           wallet={modalWallet}
           onClose={() => setModalWallet(null)}
           onDeposited={handleDeposited}
         />
       )}
      </div>
    </div>
  );
}
