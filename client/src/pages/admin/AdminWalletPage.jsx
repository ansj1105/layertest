import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function AdminWalletPage({ onLogout }) {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [trxBalance, setTrxBalance] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferType, setTransferType] = useState('trx');
  const [message, setMessage] = useState(null);
  const [newWallet, setNewWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'transactions' | 'reclaim'
  const [transactions, setTransactions] = useState([]);

  // Admin settings
  const [adminAddress, setAdminAddress] = useState('');
  const [adminPrivateKey, setAdminPrivateKey] = useState('');
  const [threshold, setThreshold] = useState('');
  const [selectedAdminWallet, setSelectedAdminWallet] = useState(null);
  // 잔액
  const [adminTrx, setAdminTrx] = useState(null);
  const [adminUsdt, setAdminUsdt] = useState(null);
  // 회수 관련
  const [reclaimModal, setReclaimModal] = useState(false);
  const [reclaimTargets, setReclaimTargets] = useState([]);
  const [reclaimResult, setReclaimResult] = useState(null);
  const [adminTrxBefore, setAdminTrxBefore] = useState(null);
  const [adminTrxAfter, setAdminTrxAfter] = useState(null);
  const [adminUsdtBefore, setAdminUsdtBefore] = useState(null);
  const [adminUsdtAfter, setAdminUsdtAfter] = useState(null);
  const [fundTrxAmount, setFundTrxAmount] = useState(2.5); // 기본값 2.5 TRX

  // 관리자 설정 불러오기
  const loadAdminSettings = async () => {
    try {
      const res = await axios.get('/api/tron/reclaim-settings');
      const { admin_address, threshold } = res.data;
      setAdminAddress(admin_address || '');
      setThreshold(threshold || '');
      // 프라이빗키는 저장 시에만 입력받음(보안)
      // 선택된 관리자 지갑 자동 선택
      const admin = wallets.find(w => w.address === admin_address);
      if (admin) setSelectedAdminWallet(admin.id);
    } catch (err) {
      setAdminAddress('');
      setThreshold('');
    }
  };
  // 관리자 설정 저장
  const handleAdminSettingSave = async () => {
    try {
      const adminWallet = wallets.find(w => w.id === +selectedAdminWallet);
      await axios.post('/api/tron/reclaim-settings', {
        admin_address: adminWallet?.address,
        admin_private_key: adminWallet?.private_key,
        threshold: parseFloat(threshold)
      });
      window.alert('관리자 설정이 저장되었습니다.');
      loadAdminSettings();
    } catch (err) {
      window.alert('관리자 설정 저장에 실패했습니다.');
    }
  };

  // 관리자 잔액 조회
  const fetchAdminBalances = async (address) => {
    if (!address) { setAdminTrx(null); setAdminUsdt(null); return; }
    try {
      const trxRes = await axios.get('/api/tron/balance-trx', { params: { address } });
      setAdminTrx(trxRes.data.trx);
      const usdtRes = await axios.get('/api/tron/balance', { params: { address } });
      setAdminUsdt(usdtRes.data.usdt);
    } catch (err) {
      setAdminTrx(null); setAdminUsdt(null);
    }
  };
  useEffect(() => { loadWallets(); }, []);
  useEffect(() => { loadAdminSettings(); }, [wallets]);
  useEffect(() => { fetchAdminBalances(adminAddress); }, [adminAddress]);

  const loadWallets = async () => {
    try {
      const res = await axios.get('/api/tron/create-wallet/logs');
      setWallets(res.data.data);
    } catch (err) {}
  };

  // 회수 대상 미리보기
  const fetchReclaimTargets = async () => {
    if (!threshold) return [];
    const { data } = await axios.get('/api/tron/create-wallet/logs');
    // 실제로는 wallets 테이블에서 real_amount >= threshold 인 지갑을 백엔드에서 조회해야 함
    // 여기서는 예시로 모든 지갑을 불러오고, real_amount 필드가 있다고 가정
    // 실제 적용 시 /api/withdrawals/wallets 등에서 real_amount 필터링 필요
    return (data.data || []).filter(w => Number(w.real_amount) >= Number(threshold));
  };

  // 회수 실행
  const handleReclaim = async () => {
    setReclaimResult(null);
    setReclaimModal(true);
    setAdminTrxBefore(adminTrx);
    setAdminUsdtBefore(adminUsdt);
    const targets = await fetchReclaimTargets();
    setReclaimTargets(targets);
    try {
      const adminWallet = wallets.find(w => w.id === +selectedAdminWallet);
      const res = await axios.post('/api/tron/reclaim-funds', {
        threshold,
        admin_address: adminWallet?.address,
        admin_private_key: adminWallet?.private_key,
        fund_trx_amount: fundTrxAmount
      });
      setReclaimResult(res.data);
      setTimeout(async () => {
        await fetchAdminBalances(adminWallet?.address);
        setAdminTrxAfter(adminTrx);
        setAdminUsdtAfter(adminUsdt);
      }, 5000);
    } catch (err) {
      setReclaimResult({ error: err.message });
    }
  };

  useEffect(() => {
    if (selectedWallet) {
      fetchBalances(selectedWallet.address);
    } else {
      setTrxBalance(null);
      setUsdtBalance(null);
    }
  }, [selectedWallet]);

  const fetchBalances = async (addr) => {
    try {
      const trxRes = await axios.get('/api/tron/balance-trx', { params: { address: addr } });
      setTrxBalance(trxRes.data.trx);
      const usdtRes = await axios.get('/api/tron/balance', { params: { address: addr } });
      setUsdtBalance(usdtRes.data.usdt);
    } catch (err) {
      console.error('잔액 조회 실패:', err);
      setMessage({ type: 'error', text: '잔액 조회 중 오류가 발생했습니다.' });
    }
  };

  const handleTransfer = async () => {
    if (!selectedWallet) return;
    setMessage(null);
    try {
      const api = transferType === 'trx' ? '/api/tron/send-trx' : '/api/tron/send';
      const body = { fromPrivateKey: selectedWallet.private_key, toAddress, amount: parseFloat(amount) };
      const res = await axios.post(api, body);
      setMessage({ type: 'success', text: `전송 성공: ${res.data.txHash || res.data.tx}` });
      fetchBalances(selectedWallet.address);
    } catch (err) {
      console.error('전송 실패:', err);
      setMessage({ type: 'error', text: '전송 실패' });
    }
  };

  // Transactions tab
  useEffect(() => {
    if (activeTab === 'transactions') loadTransactions();
  }, [activeTab]);
  const loadTransactions = async () => {
    try {
      const res = await axios.get('/api/tron/transactions');
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error('트랜잭션 로드 실패:', err);
    }
  };

  const handleCreateWallet = async () => {
    try {
      const res = await axios.get('/api/tron/create-wallet');
      await loadWallets();
      setNewWallet({ address: res.data.address, privateKey: res.data.privateKey });
      window.alert('지갑 생성이 완료되었습니다.');
    } catch (err) {
      console.error('지갑 생성 실패:', err);
      window.alert('지갑 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full space-y-6">
        <h1 className="text-2xl font-bold">지갑 관리</h1>
        {/* 관리자 잔액 표시 */}
        <div className="mb-4">
          <span className="mr-4">관리자 TRX: <b>{adminTrx ?? '-'}</b></span>
          <span>관리자 USDT: <b>{adminUsdt ?? '-'}</b></span>
        </div>
        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          {['manage','transactions','reclaim'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${activeTab===tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {tab==='manage' ? '관리' : tab==='transactions' ? '기록조회' : '자금회수'}
            </button>
          ))}
        </div>

        {/* Manage Tab */}
        {activeTab==='manage' && (
          <>
            <section className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="text-lg font-semibold mb-2">새 Tron 지갑 생성</h2>
              <button onClick={handleCreateWallet} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">지갑 생성</button>
              {newWallet && (
                <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
                  <p><strong>주소:</strong> {newWallet.address}</p>
                  <p><strong>Private Key:</strong> {newWallet.privateKey}</p>
                </div>
              )}
            </section>

            <section className="bg-white p-4 rounded shadow space-y-4">
              <h2 className="text-lg font-semibold">지갑 선택</h2>
              <select className="w-full border px-3 py-2 rounded" value={selectedWallet?.id||''} onChange={e=>setSelectedWallet(wallets.find(w=>w.id===+e.target.value))}>
                <option value="" disabled>지갑 선택...</option>
                {wallets.map(w=><option key={w.id} value={w.id}>{w.address}</option>)}
              </select>
              {selectedWallet && (
                <div className="space-y-2">
                  <p><strong>Address:</strong> {selectedWallet.address}</p>
                  <div className="flex space-x-4">
                    <p><strong>TRX:</strong> {trxBalance??'...'} TRX</p>
                    <p><strong>USDT:</strong> {usdtBalance??'...'} USDT</p>
                  </div>
                </div>
              )}
            </section>

            {selectedWallet && (
              <section className="bg-white p-4 rounded shadow space-y-4">
                <h2 className="text-lg font-semibold">송금</h2>
                <div className="flex space-x-2">
                  <button onClick={()=>setTransferType('trx')} className={`flex-1 py-2 rounded ${transferType==='trx'?'bg-green-400 text-white':'bg-gray-200'}`}>TRX</button>
                  <button onClick={()=>setTransferType('usdt')} className={`flex-1 py-2 rounded ${transferType==='usdt'?'bg-green-400 text-white':'bg-gray-200'}`}>USDT</button>
                </div>
                <input type="text" placeholder="To Address" className="w-full border px-3 py-2 rounded" value={toAddress} onChange={e=>setToAddress(e.target.value)} />
                <input type="number" placeholder="Amount" className="w-full border px-3 py-2 rounded" value={amount} onChange={e=>setAmount(e.target.value)} />
                <button onClick={handleTransfer} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">송금</button>
                {message && <p className={`${message.type==='success'?'text-green-600':'text-red-600'}`}>{message.text}</p>}
              </section>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab==='transactions' && (
          <section className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">트랜잭션 기록</h2>
            <div className="overflow-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">From</th>
                    <th className="px-2 py-1">To</th>
                    <th className="px-2 py-1">USDT</th>
                    <th className="px-2 py-1">TRX</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">txhash</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">참조</th>
                    <th className="px-2 py-1">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx=> (
                    <tr key={tx.id} className="border-t">
                      <td className="px-2 py-1 text-sm">{tx.id}</td>
                      <td className="px-2 py-1 text-sm">{tx.from_address}</td>
                      <td className="px-2 py-1 text-sm">{tx.to_address}</td>
                      <td className="px-2 py-1 text-sm">{tx.amount_usdt}</td>
                      <td className="px-2 py-1 text-sm">{tx.amount_trx}</td>
                      <td className="px-2 py-1 text-sm">{tx.type}</td>
                      <td className="px-2 py-1 text-sm">{tx.tx_hash}</td>
                      <td className="px-2 py-1 text-sm">{tx.status}</td>
                      <td className="px-2 py-1 text-sm">{tx.reference_id}</td>
                      <td className="px-2 py-1 text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab==='reclaim' && (
          <section className="bg-white p-4 rounded shadow space-y-4">
            <h2 className="text-lg font-semibold">자금 회수 설정</h2>
            {/* 관리자 설정 입력 */}
            <label className="block mb-1">관리자 지갑 (회수 대상)</label>
            <select
              className="w-full border px-3 py-2 rounded mb-2"
              value={selectedAdminWallet || ''}
              onChange={e => setSelectedAdminWallet(e.target.value)}
            >
              <option value="" disabled>관리자 지갑 선택...</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.address}</option>
              ))}
            </select>
            <label className="block mb-1 mt-2">회수 임계치 (USDT)</label>
            <input
              type="number"
              step="0.000001"
              className="w-full border px-3 py-2 rounded mb-2"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
            />
            <label className="block mb-1 mt-2">지갑당 송금할 TRX (예: 2.5)</label>
            <input
              type="number"
              step="0.1"
              className="w-full border px-3 py-2 rounded mb-2"
              value={fundTrxAmount}
              onChange={e => setFundTrxAmount(e.target.value)}
            />
            <button
              onClick={handleAdminSettingSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
            >
              설정 저장
            </button>
            <button
              onClick={async () => {
                const targets = await fetchReclaimTargets();
                setReclaimTargets(targets);
                setReclaimModal(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              회수 대상 미리보기
            </button>
            <button
              onClick={handleReclaim}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              회수하기
            </button>
          </section>
        )}

        {/* 회수 대상/결과 모달 */}
        {reclaimModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
              <h3 className="text-lg font-bold mb-2">회수 대상 및 결과</h3>
              <div className="mb-2">
                <b>관리자 잔액 (전):</b> TRX {adminTrxBefore ?? '-'} / USDT {adminUsdtBefore ?? '-'}
              </div>
              <div className="mb-2">
                <b>관리자 잔액 (후):</b> TRX {adminTrxAfter ?? '-'} / USDT {adminUsdtAfter ?? '-'}
              </div>
              <div className="mb-2">
                <b>회수 대상:</b>
                <ul className="list-disc pl-6">
                  {reclaimTargets.map(t => (
                    <li key={t.id}>{t.address} (잔액: {t.real_amount})</li>
                  ))}
                </ul>
              </div>
              {reclaimResult && (
                <div className="mb-2">
                  <b>회수 결과:</b>
                  <pre className="bg-gray-100 p-2 rounded text-xs max-h-48 overflow-auto">{JSON.stringify(reclaimResult, null, 2)}</pre>
                </div>
              )}
              <button onClick={() => setReclaimModal(false)} className="mt-2 px-4 py-2 bg-gray-400 text-white rounded">닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
