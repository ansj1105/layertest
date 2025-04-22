// 📁 components/TokenPurchasePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function TokenPurchasePage() {
  const [sales, setSales] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [purchaseLogs, setPurchaseLogs] = useState([]);
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("정량지갑");
  const [inputAmount, setInputAmount] = useState("");

  useEffect(() => {
    fetchSales();
    fetchWallet();
  }, []);

  const fetchSales = async () => {
    const res = await axios.get("/api/token/active-token-sales");
    setSales(res.data);
  };

  const fetchWallet = async () => {
    const res = await axios.get("/api/token/users/1/token-wallet");
    setWallet(res.data);
  };

  const fetchDetails = async () => {
    try {
      const purchaseRes = await axios.get("/api/token/users/1/token-purchases");
      const transactionRes = await axios.get("/api/token/users/1/token-transactions");
      setPurchaseLogs(purchaseRes.data);
      setTransactionLogs(transactionRes.data);
      setShowDetails(true);
    } catch (err) {
      alert("세부 정보 불러오기 실패");
    }
  };

  const handleTransfer = async () => {
    try {
      await axios.post("/api/token-deposit", {
        userId: 1,
        source: selectedWallet,
        amount: parseFloat(inputAmount)
      });
      alert("전입 완료");
      setShowTransferModal(false);
      fetchWallet();
    } catch (err) {
      alert("전입 실패: " + (err.response?.data?.error || "오류"));
    }
  };

  const handlePurchase = async (saleId) => {
    const amount = prompt("구매할 QVC 수량을 입력하세요:");
    if (!amount || isNaN(amount)) return alert("유효한 수량을 입력하세요.");

    try {
      await axios.post("/api/token/purchase-token", {
        userId: 1,
        saleId,
        amount: parseFloat(amount)
      });
      alert("구매 완료!");
      fetchSales();
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.error || "구매 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <h2 className="text-center text-xl font-semibold border-b border-yellow-500 pb-2 mb-4">QVC 토큰</h2>

      <div className="bg-[#3b2b15] rounded-md p-4 text-center mb-4">
        <div className="text-sm text-gray-300">보유 USDT</div>
        <div className="text-2xl font-bold">{wallet?.usdt_balance || "0.00"} USDT</div>
        <div className="text-sm text-gray-300 mt-2">보유 QVC</div>
        <div className="text-2xl font-bold">{wallet?.balance || "0.00"} QVC</div>
        <div className="flex justify-around mt-4 text-sm text-yellow-200">
          <button onClick={() => setShowTransferModal(true)} className="bg-yellow-700 rounded px-3 py-1">전입</button>
          <button onClick={() => setShowChargeModal(true)} className="bg-yellow-700 rounded px-3 py-1">충전한다</button>
          <button className="bg-yellow-700 rounded px-3 py-1">환매</button>
        </div>
        <button onClick={fetchDetails} className="mt-3 bg-yellow-500 text-black py-2 px-4 rounded font-semibold text-sm">주문 세부정보</button>
      </div>

      {showChargeModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] w-72 rounded-lg text-white p-4 relative">
            <h2 className="text-center text-lg font-bold mb-4">충전 방법</h2>
            <p className="text-sm text-green-400 mb-2">충전 방법 선택</p>
            <div
              className="flex items-center justify-between bg-[#333] px-4 py-3 rounded mb-2 cursor-pointer"
              onClick={() => alert("USDT 충전은 Wallet 주소를 사용합니다.")}
            >
              <div className="flex items-center gap-2">
                <span className="text-green-300 font-bold">$</span>
                USDT
              </div>
              <span>{">"}</span>
            </div>
            <div className="flex items-center justify-between bg-[#222] px-4 py-3 rounded text-gray-400">
              <div className="flex items-center gap-2">
                <span className="opacity-40">$</span>
                USDC
              </div>
              <span>{">"}</span>
            </div>
            <button onClick={() => setShowChargeModal(false)} className="absolute top-3 right-3 text-gray-400">✕</button>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] p-6 rounded-lg w-80 text-white relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute right-3 top-3 text-gray-400">✕</button>
            <div className="mb-3">
              <label className="block text-sm mb-1">금액을 입력해주세요</label>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="w-full bg-[#333] p-2 rounded text-white"
              />
            </div>

            <div className="mb-3">
              <select
                className="w-full bg-[#444] text-white p-2 rounded"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value="정량지갑">정량 지갑</option>
                <option value="금융지갑">금융 지갑</option>
              </select>
            </div>

            <div className="bg-[#222] p-2 rounded text-sm">
              <div>실제 계정 : 0.00</div>
              <div>균형 : {wallet?.usdt_balance || "0.00"}</div>
              <div>수수료 처리 : 0.00</div>
            </div>

            <button
              onClick={handleTransfer}
              className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold"
            >
              제출하다
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="bg-[#2d1f12] p-4 rounded mb-6">
          <h3 className="text-lg font-bold mb-2">📘 구매 내역</h3>
          {purchaseLogs.length === 0 ? <p className="text-sm text-gray-400">구매 내역이 없습니다.</p> : (
            <ul className="text-sm space-y-1">
              {purchaseLogs.map((item) => (
                <li key={item.id} className="border-b border-gray-600 py-1">
                  {item.amount} QVC / {item.total_price} USDT (단가: {item.price}) - {new Date(item.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-lg font-bold mt-4 mb-2">💵 USDT 사용 내역</h3>
          {transactionLogs.length === 0 ? <p className="text-sm text-gray-400">트랜잭션 기록이 없습니다.</p> : (
            <ul className="text-sm space-y-1">
              {transactionLogs.map((tx) => (
                <li key={tx.id} className="border-b border-gray-600 py-1">
                  [{tx.type}] {tx.amount} QVC - {tx.status} - {new Date(tx.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {sales.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">현재 판매중인 QVC가 없습니다.</div>
      ) : (
        sales.map((sale, idx) => (
          <div key={sale.id} className="bg-[#3b2b15] rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              <img src="/img/qvc-icon.png" alt="qvc" className="w-6 h-6 mr-2" />
              <span className="font-bold text-lg">{idx + 1}차 사전 판매</span>
            </div>
            <div className="text-sm text-gray-300">총 수량: <span className="text-yellow-100">{sale.total_supply} QVC</span></div>
            <div className="text-sm text-gray-300">남은 수량: <span className="text-yellow-100">{sale.remaining_supply} QVC</span></div>
            <div className="text-sm text-gray-300">시작 시간: <span className="text-yellow-100">{new Date(sale.start_time).toLocaleString()}</span></div>
            <div className="text-sm text-gray-300">종료 시간: <span className="text-yellow-100">{new Date(sale.end_time).toLocaleString()}</span></div>
            <button
              className="mt-3 w-full bg-yellow-500 text-black font-semibold py-2 rounded"
              onClick={() => handlePurchase(sale.id)}
            >
              구매하다
            </button>
          </div>
        ))
      )}
    </div>
  );
}