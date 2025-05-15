// 📁 src/components/TokenPurchasePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrderHistoryModal from "./OrderHistoryModal"
import PurchaseModal from "./PurchaseModal";
import LockupModal from "./LockupModal";
import '../styles/TokenPurchasePage.css';
import '../styles/topbar.css';
import '../styles/bottomnav.css';

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
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [modalSale, setModalSale] = useState(null);
  const [showLockup, setShowLockup] = useState(false);
    // Redeem 모달 상태
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState("");
    const [redeemError, setRedeemError] = useState("");
 
  // 페이지 진입 시 데이터 로드
  const loadAll = async () => {
    const [salesRes, walletRes, summaryRes] = await Promise.all([
      axios.get("/api/token/active-token-sales"),
      axios.get("/api/token/my/wallet-details", { withCredentials: true }),
      
      axios.get("/api/wallet/finance-summary", { withCredentials: true }),
    ]);
    setSales(salesRes.data);
    if (walletRes.data.success) setWallet(walletRes.data.data.wallet);
    const d = summaryRes.data.data;
    setFinanceSummary({
      fundBalance:   Number(d.fundBalance),
      quantBalance:  Number(d.quantBalance),
      depositFee:    parseFloat(d.depositFee),
      withdrawFee:   parseFloat(d.withdrawFee),
    });
  };

  useEffect(() => {
    loadAll().catch(console.error);
  }, []);

  // Redeem 처리
  const handleRedeem = async () => {
    setRedeemError("");
    const amt = parseFloat(redeemAmount);
    if (isNaN(amt) || amt <= 0) {
      return setRedeemError(t("tokenPurchase.errors.invalidAmount"));
    }
    const available = wallet.balance - wallet.locked_amount;
    if (amt > available) {
      return setRedeemError(t("tokenPurchase.errors.insufficientWallet"));
    }

    try {
      // 1) 만료된 락업 언락
      await axios.post("/api/token/my/unlock-expired-lockups", {}, { withCredentials: true });
      // 2) 입력량만큼 Quant로 교환
      await axios.post("/api/token/my/exchange-token-to-quant", { tokenAmount: amt }, { withCredentials: true });
      alert(t("tokenPurchase.redeemSuccess"));
      setShowRedeemModal(false);
      setRedeemAmount("");
      // 3) 데이터 리로드
      await loadAll();
    } catch {
      setRedeemError(t("tokenPurchase.errors.redeemFail"));
    }
  };

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
    <div className="page-wrapper-token">
      <div className="top-bar">
        <button
          onClick={() => navigate(-1)}
          className="top-tran"
        >
          <ArrowLeftIcon size={30} />
        </button>
        <h2 className="top-h-text">{t("tokenPurchase.title")}</h2>
        </div>


      {/* ─── 잔액 카드 ───────────────────────────── */}
      <div className="funding-card">


        <div className="funding-balance-amount-token-1">
          <div className="funding-balance-amount-t">
            {financeSummary.quantBalance.toFixed(6)}&nbsp;&nbsp;USDT</div>


          <button
            onClick={() => navigate("/funding/logs")}
            className="funding-detail-btn"
          >
            {t("tokenPurchase.details")} &gt;
          </button>
          </div>


          <div className="funding-balance-amount-token">
          <span className="funding-balance-amount-t">
            {wallet?.balance?.toFixed(6) || "0.000000"}&nbsp;&nbsp;USC</span>
            
              <button
                onClick={() => setShowLockup(true)}
                className="funding-detail-btn"
              >
                락업 상세
              </button>
            </div>

        <div className="funding-action-buttons">
          <button
            onClick={() => setShowQuantToFundModal(true)}
            className="funding-action-btn"
          >
            {t("tokenPurchase.swap")}
          </button>


          <button
            onClick={() => navigate("/recharge")}
            className="funding-action-btn"
          >
            {t("tokenPurchase.recharge")}
          </button>

          <button
            onClick={() => setShowFundToQuantModal(true)}
            className="funding-action-btn"
          >
            {t("tokenPurchase.deposit")}
          </button>

          <button
          onClick={() => setShowRedeemModal(true)}
          className="funding-action-btn"
          >
          {t("tokenPurchase.redeem")}
          </button>
        </div>

        <button
          onClick={() => setShowOrderHistory(true)}  
          className="funding-income-button"
        >
          {t("tokenPurchase.orderDetails")}
        </button>
      </div>
      



      {/* ── Redeem 모달 ── */}
      {showRedeemModal && (
        <div className="redeem-modal-overlay">
          <div className="redeem-modal">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="redeem-modal-close"
            >
              ✕
            </button>
            <h3 className="redeem-modal-title">
              {t("tokenPurchase.redeemTitle")}
            </h3>
            <div className="redeem-modal-balance">
              {t("tokenPurchase.available")}{" "}
              {(wallet.balance - wallet.locked_amount).toFixed(6)} USC
            </div>
            <input
              type="number"
              className="redeem-modal-input"
              placeholder={t("tokenPurchase.inputUsdc")}
              value={redeemAmount}
              onChange={e => setRedeemAmount(e.target.value)}
            />
            {redeemError && (
              <div className="redeem-modal-error">{redeemError}</div>
            )}
            <button
              onClick={handleRedeem}
              className="redeem-modal-submit"
            >
              {t("tokenPurchase.redeemSubmit")}
            </button>
          </div>
        </div>
      )}








           {/* ─── 주문 내역 모달 ─── */}
     {showOrderHistory && (
       <OrderHistoryModal onClose={() => setShowOrderHistory(false)} />
     )}
      {/* Quant → Fund 모달 */}
      {showQuantToFundModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowQuantToFundModal(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {t("tokenPurchase.swapQuantToFundTitle")}
            </h3>


            <input
              type="number"
              className="modal-input"
              placeholder={t("tokenPurchase.inputUsdt")}
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
            />
            <div className="modal-text-row">
              {t("tokenPurchase.balance")} {financeSummary.quantBalance.toFixed(6)}&nbsp;&nbsp;USDT
            </div>
            <div className="modal-text-row">
              {t("tokenPurchase.fee", { rate: financeSummary.withdrawFee })}{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.withdrawFee / 100).toFixed(6)}
            </div>
            <div className="modal-text-row mb-4">
              {t("tokenPurchase.afterSwap")}{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.withdrawFee / 100)).toFixed(6)}{" "}&nbsp;&nbsp;USDT
            </div>
            {error && <div className="modal-error">{error}</div>}
            <button
              onClick={handleQuantToFund}
              className="modal-submit-btn"
            >
              {t("tokenPurchase.submit")}
            </button>
          </div>
        </div>
      )}
     {/* ─── 락업 내역 모달 ─── */}
     {showLockup && <LockupModal onClose={() => setShowLockup(false)} />} 
      {/* Fund → Quant 모달 */}
      {showFundToQuantModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowFundToQuantModal(false)}
              className="modal-close-btn"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {t("tokenPurchase.swapFundToQuantTitle")}
            </h3>
            <input
              type="number"
              className="modal-input"
              placeholder={t("tokenPurchase.inputUsdt")}
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
            />
            <div className="modal-text-row">
              {t("tokenPurchase.balance")} {financeSummary.fundBalance.toFixed(6)}&nbsp;&nbsp;USDT
            </div>
            <div className="modal-text-row">
              {t("tokenPurchase.fee", { rate: financeSummary.depositFee })}{" "}
              {(parseFloat(transferAmount || 0) * financeSummary.depositFee / 100).toFixed(6)}
            </div>
            <div className="modal-text-row mb-4">
              {t("tokenPurchase.afterSwap")}{" "}
              {(parseFloat(transferAmount || 0) * (1 - financeSummary.depositFee / 100)).toFixed(6)} USDT
            </div>
            {error && <div className="modal-error">{error}</div>}
            <button
              onClick={handleFundToQuant}
              className="modal-submit-btn"
            >
              {t("tokenPurchase.submit")}
            </button>
          </div>
        </div>
      )}

     {/* Purchase Modal */}
     {modalSale && (
       <PurchaseModal
         sale={modalSale}
         walletBalance={financeSummary.quantBalance}
         onClose={() => setModalSale(null)}
         onPurchased={() => {
          // 구매 후 재조회
           axios.get("/api/token/active-token-sales").then(r=>setSales(r.data));
           axios.get("/api/wallet/finance-summary", { withCredentials:true })
             .then(r=>setFinanceSummary(d=>({
               ...d,
               quantBalance: Number(r.data.data.quantBalance)
             })));
         }}
       />
     )}
          {/* ─── 판매 카드 ───────────────────────────── */}
          {sales.length === 0 ? (
            <div className="data-card-to">
              {t("tokenPurchase.noSales")}
            </div>
          ) : (
            // 여기에 스크롤 가능한 컨테이너 추가
            <div className="data-box-container-t1">
              {sales.map((sale, idx) => {
                const now   = Date.now();
                const canBuy = sale.is_active &&
                  now >= new Date(sale.start_time) &&
                  now <= new Date(sale.end_time);

                return (
                  <div key={sale.id} className="data-card-to">
                    {/* 단계 / 이름 */}
                    <div className="data-box-container-tt">
                      <img src="/img/item/usc.png" alt="USC" className="data-card-to-title-img" />
                      <span className="font-bold text-lg">
                        {idx + 1}{t("tokenPurchase.phase")} – {sale.name}
                      </span>
                    </div>

                    {/* 공급량, 남은량 */}
                    <div className="data-row">
                      {t("tokenPurchase.totalSupply")}{" "}
                      <span>{sale.total_supply.toLocaleString()} USC</span>
                    </div>
                    <div className="data-row">
                      {t("tokenPurchase.remainingSupply")}{" "}
                      <span>{sale.remaining_supply.toLocaleString()} USC</span>
                    </div>

                    {/* 가격, 수수료 */}
                    <div className="data-row">
                      {t("tokenPurchase.price")}{" "}
                      <span>{sale.price.toFixed(6)} USDT</span>
                    </div>
                    {/*
                    <div className="text-sm text-gray-300">
                      {t("tokenPurchase.feeRate")}{" "}
                      <span className="text-yellow-100">
                        {sale.fee_rate}%
                      </span>
                    </div>*/}

                    {/* 최소/최대 구매, 락업 */}
                    <div className="data-row">
                      {t("tokenPurchase.minPurchase")}{" "}
                      <span>{sale.minimum_purchase} USC</span>
                    </div>

                    <div className="data-row">
                      {t("tokenPurchase.maxPurchase")}{" "}
                      <span>{sale.maximum_purchase} USC</span>
                    </div>
                    <div className="data-row">
                      {t("tokenPurchase.lockupPeriod")}{" "}
                      <span>{sale.lockup_period} {t("tokenPurchase.days")}</span>
                    </div>

                    {/* 시작 / 종료 */}
                    <div className="data-row">
                      {t("tokenPurchase.startTime")}{" "}
                      <span>{new Date(sale.start_time).toLocaleString()}</span>
                    </div>
                    <div className="data-row">
                      {t("tokenPurchase.endTime")}{" "}
                      <span>{new Date(sale.end_time).toLocaleString()}</span>
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
                  onClick={() => canBuy && setModalSale(sale)}
                  className={`mt-3 w-full font-semibold py-2 rounded 
                    ${canBuy 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                      : 'bg-gray-600 cursor-not-allowed'}`}
                >
                  {t("tokenPurchase.buy")}
                </button>
                  </div>
                );
              })}
            </div>
          )}


    </div>
  );
}
