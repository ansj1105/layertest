// 📁 src/components/TokenPurchasePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
import { useNavigate } from "react-router-dom";
export default function TokenPurchasePage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({
    fundBalance: 0,
    quantBalance: 0,
    depositFee: 0,
    withdrawFee: 0,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [purchaseLogs, setPurchaseLogs] = useState([]);
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [showQuantToFundModal, setShowQuantToFundModal] = useState(false);
  const [showFundToQuantModal, setShowFundToQuantModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [error, setError] = useState("");

  // 1) 토큰 세일 목록
  const fetchSales = async () => {
    const res = await axios.get("/api/token/active-token-sales");
    setSales(res.data);
  };

  // 2) QVC 지갑
  const fetchWallet = async () => {
    const res = await axios.get("/api/token/users/1/token-wallet");
    setWallet(res.data);
  };

  // 3) Quant↔Fund 요약
  const fetchFinanceSummary = async () => {
    const res = await axios.get("/api/wallet/finance-summary", { withCredentials: true });
    const d = res.data.data;
    setFinanceSummary({
      fundBalance:  Number(d.fundBalance),
      quantBalance: Number(d.quantBalance),
      depositFee:   parseFloat(d.depositFee),
      withdrawFee:  parseFloat(d.withdrawFee),
    });
    console.log("✅ [finance-summary] state updated:", {
      fundBalance:   Number(d.fundBalance),
      quantBalance:  Number(d.quantBalance),
      depositFee:    parseFloat(d.depositFee),
      withdrawFee:   parseFloat(d.withdrawFee),
    });
  };

  useEffect(() => {
    fetchSales();
    fetchWallet();
    fetchFinanceSummary();
  }, []);

  // Quant → Fund (“환전”)
  const handleQuantToFund = async () => {
    setError("");
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      return setError("유효한 금액을 입력해주세요.");
    }
    if (amt > financeSummary.quantBalance) {
      return setError("Quant 지갑 잔액이 부족합니다.");
    }

    try {
      await axios.post("/api/wallet/transfer-to-fund", { amount: amt }, { withCredentials: true });
      alert("환전이 완료되었습니다.");
      setShowQuantToFundModal(false);
      setTransferAmount("");
      fetchFinanceSummary();
    } catch (e) {
      setError(e.response?.data?.error || "환전에 실패했습니다.");
    }
  };

  // Fund → Quant (“충전”)
  const handleFundToQuant = async () => {
    setError("");
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      return setError("유효한 금액을 입력해주세요.");
    }
    if (amt > financeSummary.fundBalance) {
      return setError("Fund 지갑 잔액이 부족합니다.");
    }

    try {
      await axios.post("/api/wallet/transfer-to-quant", { amount: amt }, { withCredentials: true });
      alert("충전이 완료되었습니다.");
      setShowFundToQuantModal(false);
      setTransferAmount("");
      fetchFinanceSummary();
    } catch (e) {
      setError(e.response?.data?.error || "충전에 실패했습니다.");
    }
  };

  // 구매·환전 세부내역
  const fetchDetails = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        axios.get("/api/token/users/1/token-purchases"),
        axios.get("/api/token/users/1/token-transactions"),
      ]);
      setPurchaseLogs(pRes.data);
      setTransactionLogs(tRes.data);
      setShowDetails(true);
    } catch {
      alert("세부 정보 불러오기 실패");
    }
  };

  // 토큰 구매
  const handlePurchase = async (saleId) => {
    const amt = prompt("구매할 QVC 수량을 입력하세요:");
    if (!amt || isNaN(amt)) return alert("유효한 수량을 입력하세요.");
    try {
      await axios.post("/api/token/purchase-token", {
        userId: 1,
        saleId,
        amount: parseFloat(amt),
      });
      alert("구매 완료!");
      fetchSales();
      fetchWallet();
    } catch (e) {
      alert(e.response?.data?.error || "구매 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <h2 className="text-center text-xl font-semibold border-b border-yellow-500 pb-2 mb-4">
        QVC 토큰
      </h2>
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>

      {/* 잔액 카드 */}
      <div className="bg-[#3b2b15] rounded-md p-4 text-center mb-4">
        <div className="text-sm text-gray-300">Quant 지갑 USDT</div>
        <div className="text-2xl font-bold">
          {financeSummary.quantBalance.toFixed(6)} USDT
        </div>
        <div className="text-sm text-gray-300 mt-2">QVC 지갑</div>
        <div className="text-2xl font-bold">
          {wallet?.balance?.toFixed(6) || "0.000000"} QVC
        </div>
        <div className="flex justify-around mt-4 text-sm text-yellow-200">
          <button
            onClick={() => setShowQuantToFundModal(true)}
            className="bg-yellow-700 rounded px-3 py-1"
          >
            환전
          </button>
          <button
            className="px-4 py-1 border border-yellow-500 rounded"
            onClick={() => navigate("/recharge")}
          >
            재충전
          </button>
          <button
            onClick={() => setShowFundToQuantModal(true)}
            className="bg-yellow-700 rounded px-3 py-1"
          >
            충전한다
          </button>
          <button className="bg-yellow-700 rounded px-3 py-1">환매</button>
        </div>
        <button
          onClick={fetchDetails}
          className="mt-3 bg-yellow-500 text-black py-2 px-4 rounded font-semibold text-sm"
        >
          주문 세부정보
        </button>
      </div>

      {/* Quant → Fund 모달 */}
      {showQuantToFundModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2c1f0f] w-80 p-6 rounded-lg relative text-yellow-100">
            <button
              onClick={() => setShowQuantToFundModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Quant → Fund 환전</h3>
            <input
              type="number"
              className="w-full bg-[#1a1109] p-2 rounded mb-2"
              placeholder="USDT 입력"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
            <div className="text-sm text-gray-300 mb-2">
              잔액: {financeSummary.quantBalance.toFixed(6)} USDT
            </div>
            <div className="text-sm text-gray-300 mb-2">
              수수료({financeSummary.withdrawFee}%):{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.withdrawFee / 100).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              환전 후:{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.withdrawFee / 100)).toFixed(6)}{" "}
              USDT
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <button
              onClick={handleQuantToFund}
              className="w-full bg-yellow-500 text-black py-2 rounded font-semibold"
            >
              제출하다
            </button>
          </div>
        </div>
      )}

      {/* Fund → Quant 모달 */}
      {showFundToQuantModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2c1f0f] w-80 p-6 rounded-lg relative text-yellow-100">
            <button
              onClick={() => setShowFundToQuantModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Fund → Quant 충전</h3>
            <input
              type="number"
              className="w-full bg-[#1a1109] p-2 rounded mb-2"
              placeholder="USDT 입력"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
            <div className="text-sm text-gray-300 mb-2">
              잔액: {financeSummary.fundBalance.toFixed(6)} USDT
            </div>
            <div className="text-sm text-gray-300 mb-2">
              수수료({financeSummary.depositFee}%):{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.depositFee / 100).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              충전 후:{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.depositFee / 100)).toFixed(6)}{" "}
              USDT
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <button
              onClick={handleFundToQuant}
              className="w-full bg-yellow-500 text-black py-2 rounded font-semibold"
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