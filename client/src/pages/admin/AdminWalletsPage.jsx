// 📁 src/pages/admin/AdminWalletsPage.jsx
import { useState,useEffect} from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';
import DepositModal from '../../components/admin/DepositModal';

// 주소를 축약하고 클릭 시 전체 주소를 보여주는 컴포넌트
const ShortenedAddress = ({ address }) => {
  const [showFull, setShowFull] = useState(false);
  
  if (!address) return null;
  
  const shortened = `${address.slice(0, 5)}...${address.slice(-5)}`;
  
  return (
    <div 
      className="cursor-pointer hover:text-blue-500 transition-colors"
      onClick={() => setShowFull(!showFull)}
      title="Click to show/hide full address"
    >
      {showFull ? address : shortened}
    </div>
  );
};

export default function AdminWalletsPage({ onLogout }) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalWallet, setModalWallet] = useState(null);
  const [bnbAddresses, setBnbAddresses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get('/api/withdrawals/bnb-address/all')
      .then(res => {
        const addressMap = {};
        (res.data.data || []).forEach(item => {
          addressMap[item.user_id] = item.address;
        });
        setBnbAddresses(addressMap);
      console.log('bnbAddresses:', addressMap);
      })
      .catch(console.error);
  }, []);

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
        const walletsWithBnb = (res.data.data || []).map(wallet => ({
          ...wallet,
          address_bnb: bnbAddresses[wallet.user_id] || null
        }));
        setWallets(walletsWithBnb);
      })
      .catch(console.error);
  }, [bnbAddresses]);

  // 전체 조회
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [res, res2, walletsRes] = await Promise.all([
        axios.get('/api/withdrawals/real-amount/all', { withCredentials: true }),
        axios.get('/api/withdrawals/real-bnb-amount/all', { withCredentials: true }),
        axios.get('/api/withdrawals/wallets', { withCredentials: true })
      ]);

      const walletsList = walletsRes.data.data || [];
      
      // bnb 주소 포함하여 병합
      const merged = walletsList.map(w => ({
        ...w,
        address_bnb: bnbAddresses[w.user_id] || null,
        real_amount: w.real_amount,
        real_bamount: w.real_bamount,
        diff: w.diff || 0
      }));

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

  // 검색어와 페이지에 따른 필터링된 지갑 목록
  const filteredWallets = wallets
    .filter(w => 
      searchTerm === '' || 
      w.user_id.toString().includes(searchTerm) ||
      w.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.address_bnb?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.user_id - a.user_id); // ID 내림차순 정렬

  // 현재 페이지의 지갑 목록
  const currentWallets = filteredWallets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 전체 페이지 수
  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">💼 지갑 관리</h1>

        {/* 검색 및 업데이트 영역 */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="ID, 이메일, 이름, 주소로 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 검색 시 첫 페이지로
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              최종 업데이트: <span className="font-semibold">{lastUpdated || '-'}</span>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            전체 조회
          </button>
        </div>

        {/* 테이블 */}
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">사용자 ID</th>
              <th className="p-2">사용자 이메일</th>
              <th className="p-2">사용자 이름</th>
              <th className="p-2">지갑 ID</th>
              <th className="p-2">TRON 주소</th>
              <th className="p-2">BNB 주소</th>
              <th className="p-2">퀀트 잔액</th>
              <th className="p-2">펀딩 잔액</th>
              <th className="p-2">실제 잔액</th>
              <th className="p-2">BNB 잔액</th>
              <th className="p-2">업데이트 시각</th>
              <th className="p-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {currentWallets.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-4">조회된 지갑이 없습니다</td></tr>
            ) : currentWallets.map(w => (
              <tr key={w.wallet_id} className="border-t text-center">
                <td className="p-2">{w.user_id}</td>
                <td className="p-2">{w.user_email}</td>
                <td className="p-2">{w.user_name}</td>
                <td className="p-2">{w.wallet_id}</td>
                <td className="p-2 font-mono break-all">
                  <ShortenedAddress address={w.address} />
                </td>
                <td className="p-2 font-mono break-all">
                  <ShortenedAddress address={w.address_bnb} />
                </td>
                <td className="p-2">{parseFloat(w.quant_balance).toFixed(6)}</td>
                <td className="p-2">{parseFloat(w.fund_balance).toFixed(6)}</td>
                <td className="p-2">{parseFloat(w.real_amount).toFixed(6)}</td>
                <td className="p-2">{parseFloat(w.real_bamount).toFixed(6)}</td>
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              이전
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}

        {/* 페이지 정보 */}
        <div className="mt-2 text-center text-gray-600">
          {filteredWallets.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredWallets.length)}개 표시
        </div>

        {/* 입금 모달 */}
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
