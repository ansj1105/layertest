// 📁 src/components/TokenPurchasePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TokenPurchasePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({
    fundBalance: 0,
    quantBalance: 0,
    depositFee: 0,
    withdrawFee: 0,
  });
  const [showQuantToFundModal, setShowQuantToFundModal] = useState(false);
  const [showFundToQuantModal, setShowFundToQuantModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [error, setError] = useState("");

  // 1) 토큰 세일 목록
  useEffect(() => {
    axios.get("/api/token/active-token-sales").then(res => setSales(res.data));
    axios.get("/api/token/users/1/token-wallet").then(res => setWallet(res.data));
    axios.get("/api/wallet/finance-summary", { withCredentials: true })
      .then(res => {
        const d = res.data.data;
        setFinanceSummary({
          fundBalance:   Number(d.fundBalance),
          quantBalance:  Number(d.quantBalance),
          depositFee:    parseFloat(d.depositFee),
          withdrawFee:   parseFloat(d.withdrawFee),
        });
      });
  }, []);

  // Quant → Fund (“환전”)
  const handleQuantToFund = async () => {
    setError("");
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      return setError(t("tokenPurchase.errors.invalidAmount"));
    }
    if (amt > financeSummary.quantBalance) {
      return setError(t("tokenPurchase.errors.insufficientQuant"));
    }
    try {
      await axios.post("/api/wallet/transfer-to-fund", { amount: amt }, { withCredentials: true });
      alert(t("tokenPurchase.swapSuccess"));
      setShowQuantToFundModal(false);
      setTransferAmount("");
      // 재조회
      const res = await axios.get("/api/wallet/finance-summary", { withCredentials: true });
      const d = res.data.data;
      setFinanceSummary({
        ...financeSummary,
        quantBalance: Number(d.quantBalance)
      });
    } catch {
      setError(t("tokenPurchase.errors.swapFail"));
    }
  };

  // Fund → Quant (“충전”)
  const handleFundToQuant = async () => {
    setError("");
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      return setError(t("tokenPurchase.errors.invalidAmount"));
    }
    if (amt > financeSummary.fundBalance) {
      return setError(t("tokenPurchase.errors.insufficientFund"));
    }
    try {
      await axios.post("/api/wallet/transfer-to-quant", { amount: amt }, { withCredentials: true });
      alert(t("tokenPurchase.depositSuccess"));
      setShowFundToQuantModal(false);
      setTransferAmount("");
      const res = await axios.get("/api/wallet/finance-summary", { withCredentials: true });
      const d = res.data.data;
      setFinanceSummary({
        ...financeSummary,
        fundBalance: Number(d.fundBalance)
      });
    } catch {
      setError(t("tokenPurchase.errors.depositFail"));
    }
  };

  // USC 구매
  const handlePurchase = async saleId => {
    const amt = prompt(t("tokenPurchase.promptAmount"));
    if (!amt || isNaN(amt)) {
      return alert(t("tokenPurchase.errors.invalidAmount"));
    }
    try {
       await axios.post("/api/token/purchase-token", {
           saleId,
           amount: parseFloat(amt),
        }, { withCredentials: true });
      alert(t("tokenPurchase.purchaseSuccess"));
      // 재조회
      axios.get("/api/token/active-token-sales").then(res => setSales(res.data));
      axios.get("/api/token/users/1/token-wallet").then(res => setWallet(res.data));
    } catch {
      alert(t("tokenPurchase.errors.purchaseFail"));
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <h2 className="text-center text-xl font-semibold border-b border-yellow-500 pb-2 mb-4">
        {t("tokenPurchase.title")}
      </h2>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>{t("tokenPurchase.back")}</span>
      </button>

      {/* ─── 잔액 카드 ───────────────────────────── */}
      <div className="relative bg-[#3b2b15] rounded-md p-4 text-center mb-4">
        <button
          onClick={() => navigate("/funding/logs")}
          className="absolute top-3 right-3 text-sm text-yellow-200 hover:text-yellow-100"
        >
          {t("tokenPurchase.details")} &gt;
        </button>

        <div className="text-sm text-gray-300">{t("tokenPurchase.quantWallet")}</div>
        <div className="text-2xl font-bold">
          {financeSummary.quantBalance.toFixed(6)} USDT
        </div>
        <div className="text-sm text-gray-300 mt-2">{t("tokenPurchase.uscWallet")}</div>
        <div className="text-2xl font-bold">
          {wallet?.balance?.toFixed(6) || "0.000000"} USC
        </div>

        <div className="flex justify-around mt-4 text-sm text-yellow-200">
          <button
            onClick={() => setShowQuantToFundModal(true)}
            className="bg-yellow-700 rounded px-3 py-1"
          >
            {t("tokenPurchase.swap")}
          </button>
          <button
            onClick={() => navigate("/recharge")}
            className="px-4 py-1 border border-yellow-500 rounded"
          >
            {t("tokenPurchase.recharge")}
          </button>
          <button
            onClick={() => setShowFundToQuantModal(true)}
            className="bg-yellow-700 rounded px-3 py-1"
          >
            {t("tokenPurchase.deposit")}
          </button>
          <button className="bg-yellow-700 rounded px-3 py-1">
            {t("tokenPurchase.redeem")}
          </button>
        </div>

        <button
          onClick={() => alert(t("tokenPurchase.orderDetails"))}
          className="mt-3 bg-yellow-500 text-black py-2 px-4 rounded font-semibold text-sm"
        >
          {t("tokenPurchase.orderDetails")}
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
            <h3 className="text-lg font-semibold mb-4">
              {t("tokenPurchase.swapQuantToFundTitle")}
            </h3>
            <input
              type="number"
              className="w-full bg-[#1a1109] p-2 rounded mb-2"
              placeholder={t("tokenPurchase.inputUsdt")}
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
            />
            <div className="text-sm text-gray-300 mb-2">
              {t("tokenPurchase.balance")} {financeSummary.quantBalance.toFixed(6)} USDT
            </div>
            <div className="text-sm text-gray-300 mb-2">
              {t("tokenPurchase.fee", { rate: financeSummary.withdrawFee })}:{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.withdrawFee / 100).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {t("tokenPurchase.afterSwap")}:{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.withdrawFee / 100)).toFixed(6)}{" "}
              USDT
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <button
              onClick={handleQuantToFund}
              className="w-full bg-yellow-500 text-black py-2 rounded font-semibold"
            >
              {t("tokenPurchase.submit")}
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
            <h3 className="text-lg font-semibold mb-4">
              {t("tokenPurchase.swapFundToQuantTitle")}
            </h3>
            <input
              type="number"
              className="w-full bg-[#1a1109] p-2 rounded mb-2"
              placeholder={t("tokenPurchase.inputUsdt")}
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
            />
            <div className="text-sm text-gray-300 mb-2">
              {t("tokenPurchase.balance")} {financeSummary.fundBalance.toFixed(6)} USDT
            </div>
            <div className="text-sm text-gray-300 mb-2">
              {t("tokenPurchase.fee", { rate: financeSummary.depositFee })}:{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.depositFee / 100).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {t("tokenPurchase.afterSwap")}:{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.depositFee / 100)).toFixed(6)}{" "}
              USDT
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <button
              onClick={handleFundToQuant}
              className="w-full bg-yellow-500 text-black py-2 rounded font-semibold"
            >
              {t("tokenPurchase.submit")}
            </button>
          </div>
        </div>
      )}

      {/* 판매 카드 */}
      {sales.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            {t("tokenPurchase.noSales")}
          </div>
        ) : (
          sales.map((sale, idx) => {
            const now = Date.now();
            const canBuy = sale.is_active &&
              now >= new Date(sale.start_time) &&
              now <= new Date(sale.end_time);

            return (
              <div key={sale.id} className="bg-[#3b2b15] rounded-md p-4 mb-4">
                {/* 단계 / 이름 */}
                <div className="flex items-center mb-2">
                  <img src="/img/item/usc.png" alt="USC" className="w-6 h-6 mr-2" />
                  <span className="font-bold text-lg">
                    {idx + 1}{t("tokenPurchase.phase")} – {sale.name}
                  </span>
                </div>

                {/* 공급량, 남은량 */}
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.totalSupply")}{" "}
                  <span className="text-yellow-100">
                    {sale.total_supply.toLocaleString()} USC
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.remainingSupply")}{" "}
                  <span className="text-yellow-100">
                    {sale.remaining_supply.toLocaleString()} USC
                  </span>
                </div>

                {/* 가격, 수수료 */}
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.price")}:{" "}
                  <span className="text-yellow-100">
                    {sale.price.toFixed(6)} USDT
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.feeRate")}:{" "}
                  <span className="text-yellow-100">
                    {sale.fee_rate}%
                  </span>
                </div>

                {/* 최소/최대 구매, 락업 */}
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.minPurchase")}:{" "}
                  <span className="text-yellow-100">
                    {sale.minimum_purchase} USC
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.maxPurchase")}:{" "}
                  <span className="text-yellow-100">
                    {sale.maximum_purchase} USC
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.lockupPeriod")}:{" "}
                  <span className="text-yellow-100">
                    {sale.lockup_period} {t("tokenPurchase.days")}
                  </span>
                </div>

                {/* 시작 / 종료 */}
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.startTime")}{" "}
                  <span className="text-yellow-100">
                    {new Date(sale.start_time).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  {t("tokenPurchase.endTime")}{" "}
                  <span className="text-yellow-100">
                    {new Date(sale.end_time).toLocaleString()}
                  </span>
                </div>

                {/* 구매 가능 여부 */}
                <div className="mt-2 text-sm">
                  {canBuy
                    ? <span className="text-green-400">{t("tokenPurchase.canBuy")}</span>
                    : <span className="text-red-400">{t("tokenPurchase.cannotBuy")}</span>
                  }
                </div>

                {/* 구매 버튼 */}
                <button
                  disabled={!canBuy}
                  onClick={() => handlePurchase(sale.id)}
                  className={`mt-3 w-full font-semibold py-2 rounded 
                    ${canBuy 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                      : 'bg-gray-600 cursor-not-allowed'}`}
                >
                  {t("tokenPurchase.buy")}
                </button>
              </div>
            );
          })
        )}

    </div>
  );
}
