import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function AdminBNBWalletPage({ onLogout }) {
  const [wallets, setWallets] = useState([]);
  const [bnbAddresses, setBnbAddresses] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [bnbBalance, setBnbBalance] = useState(null);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'transactions' | 'reclaim'
  const [transactions, setTransactions] = useState([]);
  // Admin settings (BNB 회수 관련)
  const [adminAddress, setAdminAddress] = useState('');
  const [threshold, setThreshold] = useState('');
  const [selectedAdminWallet, setSelectedAdminWallet] = useState(null);

  // BNB 지갑 목록 및 주소 로드
  useEffect(() => {
    loadWallets();
    loadBnbAddresses();
    loadAdminSettings();
  }, []);

  const loadWallets = async () => {
    try {
      const res = await axios.get('/api/withdrawals/wallets');
      setWallets(res.data.data || []);
    } catch (err) {
      console.error('BNB 지갑 로드 실패:', err);
    }
  };
  const loadBnbAddresses = async () => {
    try {
      const res = await axios.get('/api/withdrawals/bnb-address/all');
      setBnbAddresses(res.data.data || []);
    } catch (err) {
      console.error('BNB 주소 로드 실패:', err);
    }
  };

  // 관리자 회수 설정 로드 (임시: localStorage 사용)
  const loadAdminSettings = () => {
    setAdminAddress(localStorage.getItem('bnb_admin_address') || '');
    setThreshold(localStorage.getItem('bnb_threshold') || '');
    setSelectedAdminWallet(localStorage.getItem('bnb_admin_wallet_id') || '');
  };
  const handleAdminSettingSave = () => {
    const adminWallet = wallets.find(w => w.id === +selectedAdminWallet);
    if (adminWallet) {
      setAdminAddress(adminWallet.bnb_address);
      localStorage.setItem('bnb_admin_address', adminWallet.bnb_address);
      localStorage.setItem('bnb_admin_wallet_id', adminWallet.id);
    }
    localStorage.setItem('bnb_threshold', threshold);
    window.alert('관리자 설정이 저장되었습니다. (BNB)');
    loadAdminSettings();
  };

  // 선택된 지갑의 BNB 주소 찾기
  const getBnbAddress = (user_id) => {
    const found = bnbAddresses.find(b => b.user_id === user_id);
    return found ? found.address : '';
  };

  // 선택된 지갑의 BNB 잔액 조회
  useEffect(() => {
    if (selectedWallet) {
      fetchBNBBalance(selectedWallet.id);
    } else {
      setBnbBalance(null);
    }
  }, [selectedWallet]);
  const fetchBNBBalance = async (walletId) => {
    try {
      const res = await axios.get(`/api/withdrawals/real-bnb-amount/${walletId}`);
      setBnbBalance(res.data.result?.real_bamount ?? null);
    } catch (err) {
      console.error('BNB 잔액 조회 실패:', err);
      setMessage({ type: 'error', text: 'BNB 잔액 조회 중 오류가 발생했습니다.' });
    }
  };

  // 송금 (BNB)
  const handleTransfer = async () => {
    if (!selectedWallet) return;
    setMessage(null);
    try {
      // 실제 송금 API는 별도 구현 필요
      window.alert('BNB 송금 기능은 별도 구현 필요');
    } catch (err) {
      setMessage({ type: 'error', text: '송금 실패' });
    }
  };

  // Transactions tab (BNB 출금/입금 기록)
  useEffect(() => {
    if (activeTab === 'transactions') loadTransactions();
  }, [activeTab]);
  const loadTransactions = async () => {
    try {
      const res = await axios.get('/api/withdrawals/history', { params: { flow_type: 'WITHDRAWAL' } });
      setTransactions((res.data.data || []).filter(tx => tx.method === 'BEP-20'));
    } catch (err) {
      console.error('트랜잭션 로드 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full space-y-6">
        <h1 className="text-2xl font-bold">BNB 지갑 관리</h1>
        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          {['manage','transactions','reclaim'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${activeTab===tab ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
              {tab==='manage' ? '관리' : tab==='transactions' ? '기록조회' : '자금회수'}
            </button>
          ))}
        </div>

        {/* Manage Tab */}
        {activeTab==='manage' && (
          <>
            <section className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="text-lg font-semibold mb-2">BNB 지갑 목록</h2>
              <select className="w-full border px-3 py-2 rounded" value={selectedWallet?.id||''} onChange={e=>setSelectedWallet(wallets.find(w=>w.id===+e.target.value))}>
                <option value="" disabled>지갑 선택...</option>
                {wallets.map(w=><option key={w.id} value={w.id}>{getBnbAddress(w.user_id)}</option>)}
              </select>
              {selectedWallet && (
                <div className="space-y-2">
                  <p><strong>BNB Address:</strong> {getBnbAddress(selectedWallet.user_id)}</p>
                  <p><strong>BNB 잔액:</strong> {bnbBalance ?? '...'} BNB</p>
                </div>
              )}
            </section>

            {selectedWallet && (
              <section className="bg-white p-4 rounded shadow space-y-4">
                <h2 className="text-lg font-semibold">BNB 송금</h2>
                <input type="text" placeholder="To BNB Address" className="w-full border px-3 py-2 rounded" value={toAddress} onChange={e=>setToAddress(e.target.value)} />
                <input type="number" placeholder="Amount (BNB)" className="w-full border px-3 py-2 rounded" value={amount} onChange={e=>setAmount(e.target.value)} />
                <button onClick={handleTransfer} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">송금</button>
                {message && <p className={`${message.type==='success'?'text-green-600':'text-red-600'}`}>{message.text}</p>}
              </section>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab==='transactions' && (
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">BNB 트랜잭션 기록</h2>
            <div className="overflow-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">To</th>
                    <th className="px-2 py-1">BNB</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx=> (
                    <tr key={tx.id} className="border-t">
                      <td className="px-2 py-1 text-sm">{tx.id}</td>
                      <td className="px-2 py-1 text-sm">{tx.to_address}</td>
                      <td className="px-2 py-1 text-sm">{tx.amount}</td>
                      <td className="px-2 py-1 text-sm">{tx.flow_type}</td>
                      <td className="px-2 py-1 text-sm">{tx.status}</td>
                      <td className="px-2 py-1 text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reclaim Tab (관리자 회수 설정) */}
        {activeTab==='reclaim' && (
          <section className="bg-white p-4 rounded shadow space-y-4">
            <h2 className="text-lg font-semibold">BNB 자금 회수 설정</h2>
            <label className="block mb-1">관리자 BNB 지갑 (회수 대상)</label>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={selectedAdminWallet || ''}
              onChange={e => setSelectedAdminWallet(e.target.value)}
            >
              <option value="" disabled>관리자 BNB 지갑 선택...</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{getBnbAddress(w.user_id)}</option>
              ))}
            </select>
            <p><strong>현재 관리자 주소:</strong> {adminAddress}</p>
            <p><strong>회수 임계치:</strong> {threshold} BNB</p>
            <label className="block mb-1 mt-4">회수 임계치 설정</label>
            <input
              type="number"
              step="0.000001"
              className="w-full border px-3 py-2 rounded mb-4"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
            />
            <button
              onClick={handleAdminSettingSave}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              설정 저장
            </button>
          </section>
        )}
      </div>
    </div>
  );
} 