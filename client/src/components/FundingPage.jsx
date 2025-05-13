// 📁 src/pages/FundingPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import '../styles/FundingPage.css';
import '../styles/topbar.css';

export default function FundingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
 
  const [summary, setSummary] = useState({
    financeBalance: 0,
    quantBalance: 0,
    todayProjectIncome: 0,
    totalProjectIncome: 0,
    depositFee: 0,    // % 단위
    withdrawFee: 0    // % 단위
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  // 모달 상태
  const [showDepositModal, setShowDepositModal]   = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const activeProjects  = projects.filter(p => p.status === 'open');
  const expiredProjects = projects.filter(p => p.status === 'closed');
  // 요약 API
  const fetchFinanceSummary = async () => {
    const res = await axios.get("/api/wallet/finance-summary", { withCredentials: true });
    console.log(res);
    const data = res.data.data;
    return {
      financeBalance: data.fundBalance,
      quantBalance: data.quantBalance,  // 화면에서는 financeBalance로 쓰므로 이름 맞춤
      todayProjectIncome: parseFloat(data.todayProjectIncome),
      totalProjectIncome: parseFloat(data.totalProjectIncome),
      depositFee: data.depositFee,
      withdrawFee: data.withdrawFee
    };
  };
 
  // 프로젝트 목록 API
  const fetchProjects = async () => {
    const res = await axios.get("/api/wallet/projects", { withCredentials: true });
    return res.data;
  };

  useEffect(() => {
    (async () => {
      try {
        const [fin, projs] = await Promise.all([
          fetchFinanceSummary(),
          fetchProjects(),
        ]);
        setSummary(fin);
        setProjects(projs);
      } catch (err) {
        console.error("데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">{t("funding.loading")}</div>;
  }
  // 수수료 계산 헬퍼
  const calcFee = (amt, rate) => +(amt * (rate/100)).toFixed(6);
  const calcNet = (amt, rate) => +(amt - calcFee(amt, rate)).toFixed(6);
  const financeBalance     = parseFloat(summary.financeBalance)     || 0;
  const quantBalance     = parseFloat(summary.quantBalance)     || 0;
  const depositFee     = parseFloat(summary.depositFee)     || 0;
  const withdrawFee     = parseFloat(summary.withdrawFee)     || 0;
  const todayProjectIncome = parseFloat(summary.todayProjectIncome) || 0;
  const totalProjectIncome = parseFloat(summary.totalProjectIncome) || 0;
  // 입금(환송) 제출
  const handleDeposit = async () => {
    setErrorMsg("");
    const amt = parseFloat(depositAmt);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg(t("funding.deposit_modal.invalid_amount"));
      return;
    }
    if (amt > summary.fundBalance) {
      setErrorMsg(t("funding.deposit_modal.exceed_balance"));
      return;
    }

    try {
      const res = await axios.post(
        "/api/wallet/transfer-to-quant",
        { amount: amt },
        { withCredentials: true }
      );
      // 성공, 다시 요약 갱신
      const fin = await fetchFinanceSummary();
      setSummary(fin);
      setShowDepositModal(false);
      setDepositAmt("");
      alert(t("funding.deposit_modal.success", {
        transferred: res.data.transferred,
        fee: res.data.fee
      }));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || t("funding.transfer_fail"));
    }
  };

  // 출금(전출) 제출
  const handleWithdraw = async () => {
    setErrorMsg("");
    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg(t("funding.withdraw_modal.invalid_amount"));
      return;
    }
    if (amt > summary.quantBalance) {
      setErrorMsg(t("funding.withdraw_modal.exceed_balance"));
      return;
    }

    try {
      const res = await axios.post(
        "/api/wallet/transfer-to-fund",
        { amount: amt },
        { withCredentials: true }
      );
      // 성공, 다시 요약 갱신
      const fin = await fetchFinanceSummary();
      setSummary(fin);
      setShowWithdrawModal(false);
      setWithdrawAmt("");
      alert(t("funding.withdraw_modal.success", {
        transferred: res.data.transferred,
        fee: res.data.fee
      }));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || t("funding.transfer_fail"));
    }
  };
  return (
    <div className="page-wrapper-f">
      {/* ─── 상단 헤더 ───────────────────────────────── */}
      <div className="top-bar">
        <button onClick={() => navigate(-1)} className="top-tran">
          ←
        </button>
        <h2 className="top-h-text">{t("funding.header")}</h2>
        <button
          onClick={() => setShowInfoModal(true)}
          className="top-tran"
        >
          ?
        </button>
      </div>

      {/* ─── 정보 모달 ─────────────────────────── */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex justify-center bg-black/70 pt-[100px]"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-[#2c1f0f] text-yellow-100 p-6 rounded-lg w-[90%] max-w-xl mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-yellow-300 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {t("funding.info.title")}
            </h3>
            <div className="text-sm space-y-3 max-h-[60vh] overflow-y-auto leading-relaxed">
              <p>{t("funding.info.definition")}</p>
              <p>{t("funding.info.settlement")}</p>
              <h4 className="font-semibold mt-4">{t("funding.info.tradingTitle")}</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>{t("funding.info.trade1")}</li>
                <li>{t("funding.info.trade2")}</li>
                <li>{t("funding.info.trade3")}</li>
                <li>{t("funding.info.trade4")}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── 금융 지갑 카드 ─────────────────────────────── */}
      <div className="funding-card">
        <div className="funding-balance-header">
          <div className="funding-balance-label">{t("funding.wallet_balance")}</div>
            <div className="funding-balance-amount-ll">

              <div className="funding-balance-amount">
                {financeBalance.toFixed(6)}&nbsp;&nbsp;USDT
              </div>
                <button
                  onClick={() => navigate("/funding/logs")}
                  className="funding-detail-btn"
                >
                  {t("funding.detail")} &gt;
              </button>
            </div>

          </div>

        <div className="funding-action-buttons">
          <button
            className="funding-action-btn"
            onClick={() => setShowDepositModal(true)}
          >
            {t("funding.deposit_request")}
          </button>
          <button
            className="funding-action-btn"
            onClick={() => setShowWithdrawModal(true)}
          >
            {t("funding.withdraw_request")}
          </button>
          <button
            className="funding-action-btn"
            onClick={() => navigate("/recharge")}
          >
            {t("funding.recharge")}
          </button>
        </div>

        {showChargeModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1c1c1c] w-80 rounded-lg text-white p-4 relative">
              <h2 className="text-center text-lg font-bold mb-4">
                {t("funding.charge_modal.title")}
              </h2>
              <div
                className="flex items-center justify-between bg-[#333] px-4 py-3 rounded mb-2 cursor-pointer"
                onClick={() =>
                  alert(t("funding.charge_modal.usdt_alert"))
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-300 font-bold">$</span> USDT
                </div>
                <span>&gt;</span>
              </div>
              <button
                onClick={() => setShowChargeModal(false)}
                className="absolute top-3 right-3 text-gray-400"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="funding-income-container">
          <div className="funding-income-block">
            <div className="funding-income-label">{t("funding.today_income")}</div>
            <div className="funding-income-amount">
              {todayProjectIncome.toFixed(6)} USDT
            </div>
          </div>
          <div className="funding-income-block">
            <div className="funding-income-label">{t("funding.total_income")}</div>
            <div className="funding-income-amount">
              {totalProjectIncome.toFixed(6)} USDT
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/wallet/orders")}
          className="funding-income-button"
        >
          {t("funding.all_transactions")}
        </button>
      </div>

      {/*
        ─── Deposit 모달
        ─────────────────────────
      */}
      {showDepositModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[100px]"
          onClick={() => setShowDepositModal(false)}
        >
          <div
            className="bg-[#2c1f0f] text-yellow-100 p-6 rounded-lg w-[90%] max-w-sm relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-yellow-300 hover:text-white"
              onClick={() => setShowDepositModal(false)}
            >✕</button>
            <h3 className="text-xl font-semibold mb-4">{t("funding.deposit_modal.title")}</h3>

            <input
              type="number"
              placeholder={t("funding.deposit_modal.amount_placeholder")}
              className="w-full bg-[#1a1109] px-3 py-2 mb-2 rounded placeholder-yellow-500"
              value={depositAmt}
              onChange={e => setDepositAmt(e.target.value)}
            />
            <button
              className="text-xs text-yellow-300 underline mb-4"
              onClick={() => setDepositAmt(financeBalance.toString())}
            >
              {t("funding.deposit_modal.max_label")}
            </button>

            <div className="text-sm space-y-1 mb-4">
              <p>{t("funding.deposit_modal.fund_wallet", {
                balance: financeBalance.toFixed(6)
              })}</p>
              <p>{t("funding.deposit_modal.fee", {
                fee: calcFee(depositAmt, depositFee).toFixed(6),
                rate: depositFee
              })}</p>
              <p>{t("funding.deposit_modal.net_amount", {
                net: calcNet(parseFloat(depositAmt) || 0, depositFee).toFixed(2),
                remain: financeBalance- calcNet(parseFloat(depositAmt) || 0, depositFee).toFixed(2)
              })}</p>
            </div>

            {errorMsg && <p className="text-red-400 text-sm mb-2">{errorMsg}</p>}
            <button
              onClick={handleDeposit}
              className="w-full bg-yellow-600 text-black py-2 rounded"
            >
              {t("funding.deposit_modal.submit")}
            </button>
          </div>
        </div>
      )}

      {/*
        ─── Withdraw 모달
        ─────────────────────────
      */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[100px]"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            className="bg-[#2c1f0f] text-yellow-100 p-6 rounded-lg w-[90%] max-w-sm relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-yellow-300 hover:text-white"
              onClick={() => setShowWithdrawModal(false)}
            >✕</button>
            <h3 className="text-xl font-semibold mb-4">{t("funding.withdraw_modal.title")}</h3>

            <input
              type="number"
              placeholder={t("funding.withdraw_modal.amount_placeholder")}
              className="w-full bg-[#1a1109] px-3 py-2 mb-2 rounded placeholder-yellow-500"
              value={withdrawAmt}
              onChange={e => setWithdrawAmt(e.target.value)}
            />
            <button
              className="text-xs text-yellow-300 underline mb-4"
              onClick={() => setWithdrawAmt(quantBalance.toString())}
            >
              {t("funding.withdraw_modal.max_label")}
            </button>

            <div className="text-sm space-y-1 mb-4">
              <p>{t("funding.withdraw_modal.quant_wallet", {
                balance: quantBalance.toFixed(6)
              })}</p>
              <p>{t("funding.withdraw_modal.fee", {
                fee: calcFee(withdrawAmt, withdrawFee).toFixed(6),
                rate: withdrawFee
              })}</p>
              <p>{t("funding.withdraw_modal.net_amount", {
                net: calcNet(parseFloat(withdrawAmt) || 0, withdrawFee).toFixed(2),
                remain: quantBalance- calcNet(parseFloat(withdrawAmt) || 0, withdrawFee).toFixed(2)
              })}</p>
            </div>

            {errorMsg && <p className="text-red-400 text-sm mb-2">{errorMsg}</p>}
            <button
              onClick={handleWithdraw}
              className="w-full bg-yellow-600 text-black py-2 rounded"
            >
              {t("funding.withdraw_modal.submit")}
            </button>
          </div>
        </div>
      )}



            {/* ─── 펀딩 프로젝트 목록 ──────────────────────────── */}
            <div className="project-list-container">
              {/* 활성 프로젝트 */}
              <h3 className="project-title">{t("funding.active_projects")}</h3>
              {activeProjects.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {t("funding.no_active_projects")}
                </p>
              ) : (
                activeProjects.map(proj => (
                  <div key={proj.id} className="project-card">
                    {/* 프로젝트 정보 */}
                    <h3>{proj.name}</h3>
                    <p className="project-description">
                      {t("funding.project.description", { description: proj.description })}
                    </p>
                    <p className="project-description">
                      {t("funding.project.available", { min: proj.minAmount, max: proj.maxAmount })}
                    </p>
                    <p className="project-description">
                      {t("funding.project.daily_rate", { rate: proj.dailyRate })}
                    </p>
                    <p className="project-description">
                      {t("funding.project.duration", { cycle: proj.cycle, end: new Date(proj.endDate).toLocaleDateString() })}
                    </p>
                    <button
                      onClick={() => navigate(`/funding/detail/${proj.id}`)}
                      className="project-apply-btn"
                    >
                      {t("funding.project.apply")}
                    </button>
                  </div>
                ))
              )}


              {/* 만료된 프로젝트 */}
              <h3 className="funding-expired-title">{t("funding.expired_projects")}</h3>
                {expiredProjects.length === 0 ? (
                  <p className="funding-empty-message">
                    {t("funding.no_expired_projects")}
                  </p>
                ) : (
                  expiredProjects.map(proj => (
                    <div key={proj.id} className="funding-expired-card">
                      <h3>
                        {proj.name} <span className="funding-expired-label">({t("funding.expired_label")})</span>
                      </h3>
                      <p className="funding-expired-description">
                        {t("funding.project.description", { description: proj.description })}
                      </p>
                      <p className="funding-expired-description">
                        {t("funding.project.available", { min: proj.minAmount, max: proj.maxAmount })}
                      </p>
                      <p className="funding-expired-description">
                        {t("funding.project.daily_rate", { rate: proj.dailyRate })}
                      </p>
                      <p className="funding-expired-description">
                        {t("funding.project.duration", {
                          cycle: proj.cycle,
                          end: new Date(proj.endDate).toLocaleDateString(),
                        })}
                      </p>
                      <button disabled className="funding-expired-btn">
                      Project Expiration
                      </button>
                    </div>
                  ))
                )}

        
      {/* ─── 일반적인 문제 (FAQ) ──────────────────────────── */}
      <div className="faq-section">
        <h2 className="faq-title">{t("common.faqTitle")}</h2>
        {["problem1", "problem2", "problem3", "problem4", "problem5"].map(key => {
          const isOpen = openFaq === key;
          return (
            <div key={key} className="faq-card">
              <button
                onClick={() => setOpenFaq(isOpen ? null : key)}
                className="faq-question-btn"
              >
                <span>{t(`common.${key}.question`)}</span>
                <svg
                  className={`faq-icon ${isOpen ? "rotate-180" : "rotate-0"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="faq-answer">
                  {t(`common.${key}.answer`)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

