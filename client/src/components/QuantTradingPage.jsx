import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon,HistoryIcon} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuantHistoryModal from './QuantHistoryModal';
import AlertPopup from './AlertPopup';
import '../styles/QuantTradingPage.css';
import '../styles/topbar.css';


export default function QuantTradingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [vipLevels, setVipLevels] = useState([]);
  const [user, setUser] = useState(null);
  const [user2, setUser2] = useState(null); 
  const [finance, setFinance] = useState({ quantBalance: 0, fundBalance: 0 });
  const [summary, setSummary] = useState({ todayProfit: 0, totalProfit: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
   const [showTradeModal, setShowTradeModal] = useState(false);
   const [tradeAmount, setTradeAmount] = useState(0);
   const [tradesToday, setTradesToday] = useState(0);
   const [isTrading, setIsTrading] = useState(false);
   const [remainingTime, setRemainingTime] = useState(0);
   const countdownRef = useRef(null);
   // inside your component's state
    // 즉시 거래 모달 상태
    //const [showInstantModal, setShowInstantModal] = useState(false);
    // 쿨다운 만료 시각(timestamp in ms)
    const [cooldownEnd, setCooldownEnd] = useState(0);
 
    const [isGlowing, setIsGlowing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertInfo, setAlertInfo] = useState({
      title: '',
      message: '',
      type: 'success'
    });

    const handleButtonClick = () => {
      setIsGlowing(true);
      handleStart(); // 기존 기능 호출
      // 반짝임 효과 1.5초 후 제거
      setTimeout(() => setIsGlowing(false), 1500);
    };


  // 30초~1분 사이 랜덤 ms 생성
  function getRandomDelayMs() {
    const min = 30 * 1000;
    const max = 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const handleStart = () => {
    // 기본 체크 (최소 보유량 등)
    if (finance.quantBalance < currentVIP.min_holdings) {
      setAlertInfo({
        title: t('quantTrading.error'),
        message: t("quantTrading.errorMinHolding", { min: currentVIP.min_holdings }),
        type: 'error'
      });
      setShowAlert(true);
      return;
    }

    // 거래 중복 방지
    if (isTrading) return;

    const delayMs = getRandomDelayMs();
    const delaySec = Math.ceil(delayMs / 1000);

    setIsTrading(true);
    setRemainingTime(delaySec);

    // 1초마다 remainingTime-- 하면서, 0이 되면 API 호출
    countdownRef.current = setInterval(async () => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          // 실제 거래 API 호출
          (async () => {
            try {
              const amt = Math.min(
                finance.quantBalance,
                currentVIP.max_investment
              );
              const res = await axios.post(
                "/api/quant-trade",
                { amount: amt },
                { withCredentials: true }
              );
              
              // 수익 알림 표시
              setAlertInfo({
                title: t('quantTrading.success'),
                message: res.data.message,
                type: 'success'
              });
              setShowAlert(true);

              // 잔액·수익 재조회
              const [finRes, sumRes] = await Promise.all([
                axios.get("/api/wallet/finance-summary", { withCredentials: true }),
                axios.get("/api/quant-profits/summary", { withCredentials: true })
              ]);
              setFinance({
                quantBalance: Number(finRes.data.data.quantBalance),
                fundBalance: Number(finRes.data.data.fundBalance),
              });
              setSummary({
                todayProfit: Number(sumRes.data.data.todayProfit),
                totalProfit: Number(sumRes.data.data.totalProfit),
              });
            } catch (err) {
              setAlertInfo({
                title: t('quantTrading.error'),
                message: t("quantTrading.tradeError") + (err.response?.data?.error || ""),
                type: 'error'
              });
              setShowAlert(true);
            } finally {
              setIsTrading(false);
            }
          })();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 컴포넌트 언마운트 시 클리어
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

   //const COOLDOWN_MS = 5 * 60 * 1000; // 5분
   
   
const [showHistory, setShowHistory] = useState(false);
   useEffect(() => {
    axios.get('/api/mydata/me')
      .then(res => setUser2(res.data.user))
      .catch(() => setUser2(null));

    // 수익 요약 조회
      axios.get('/api/quant-profits/summary', { withCredentials: true })
        .then(res => {
          const { todayProfit, totalProfit } = res.data.data;
          setSummary({
            todayProfit: parseFloat(todayProfit),
            totalProfit:  parseFloat(totalProfit)
          });
        })
    .catch(() => setSummary({ todayProfit: 0, totalProfit: 0 }));
       // fetch how many trades you've done today
   axios
    .get("/api/quant-trade/count-today", { withCredentials: true })
     .then(res => setTradesToday(res.data.data.tradesToday || 0))
     .catch(() => setTradesToday(0));
  }, []);

  // 안전하게 찍기
  console.log('수익합계 ',summary);
  console.log('user2 vip_level:', user2?.vip_level);
  //
  // 1) Build & shuffle 30 fake leaderboard entries once
  //
// find the VIP object that matches the user's real vip_level
const myVip = vipLevels.find(v => v.level === user2?.vip_level) || {};

// now pull the daily limit directly from that
const dailyLimit = myVip.daily_trade_limit || 0;
 const remaining   = Math.max(0, dailyLimit - tradesToday);
  
 
 const ALL_LEADERBOARD = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      // random two‑letter uppercase prefix
      const prefix = Math.random().toString(36).substring(2, 4).toUpperCase();
      const suffix = Math.floor(Math.random() * 10);
      arr.push({
        name: `${prefix}***${suffix}`,
        earnings: `${(Math.random() * 200).toFixed(2)} USDT`,
        status: t("quantTrading.success")
      });
    }
    // simple shuffle
    return arr.sort(() => Math.random() - 0.5);
  }, [t]);

  //
  // 2) Maintain a start index that jumps by 5 every 5s
  //
  const [lbStart, setLbStart] = useState(0);
   
  
  // 1) slide by 1, not by windowSize!
  useEffect(() => {
    const timer = setInterval(() => {
      setLbStart(prev => (prev + 1) % ALL_LEADERBOARD.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ALL_LEADERBOARD.length]);

  // 2) windowSize = 6, slice(lbStart, lbStart + 6)
  const visibleLeaderboard = useMemo(() => {
    const windowSize = 6;
    const end = lbStart + windowSize;
    if (end <= ALL_LEADERBOARD.length) {
      return ALL_LEADERBOARD.slice(lbStart, end);
    } else {
      return [
        ...ALL_LEADERBOARD.slice(lbStart),
        ...ALL_LEADERBOARD.slice(0, end - ALL_LEADERBOARD.length)
      ];
    }
  }, [ALL_LEADERBOARD, lbStart]);




  useEffect(() => {
    const fetchData = async () => {
      try {
              const [vipRes, userRes, finRes] = await Promise.all([
                  axios.get("/api/admin/vip-levels", { headers:{ 'Accept-Language': i18n.language } }),
                  axios.get("/api/auth/me", { withCredentials:true }),
                  axios.get("/api/wallet/finance-summary", { withCredentials:true })
                ]);
        const sortedLevels = vipRes.data.data || vipRes.data;
        sortedLevels.sort((a, b) => a.level - b.level);
        setVipLevels(sortedLevels);
              setFinance({
                  quantBalance: finRes.data.data.quantBalance,
                  fundBalance: finRes.data.data.fundBalance
                });
        setUser(userRes.data);
        const idx = sortedLevels.findIndex(v => v.level === userRes.data.vip_level);
        setCurrentIndex(idx < 0 ? 0 : idx);
      } catch (err) {
        console.error("데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  if (loading) return <div className="text-center text-white">{t('quantTrading.loading')}</div>;
  const qamount = finance.quantBalance;
  const currentVIP = vipLevels.find(v => v.level === user2?.vip_level) || {};
  console.log("test", currentVIP);
  console.log("test2",currentVIP.min_holdings);
   // Validate amount against VIP limits
  const validateTrade = (amount) => {
    if (qamount < currentVIP.min_holdings) {
      alert(t('quantTrading.errorMinHolding', { min: currentVIP.min_holdings }));
      return false;
    }
    if (amount > currentVIP.max_investment) {
      alert(t('quantTrading.errorMaxInvestment', { max: currentVIP.max_investment }));
      return false;
    }
    return true;
  };


  const executeTrade_old = async () => {
    if (!validateTrade(tradeAmount)) return;
    try {
      const res = await axios.post("/api/quant-trade", { amount: tradeAmount }, { withCredentials:true });
      alert(res.data.message);
      setShowTradeModal(false);
      const finRes = await axios.get("/api/wallet/finance-summary", { withCredentials:true });
      setFinance({ quantBalance: finRes.data.data.quantBalance, fundBalance: finRes.data.data.fundBalance });
      // 수익 요약 새로고침
      const sumRes = await axios.get('/api/quant-profits/summary', { withCredentials:true });
      setSummary(sumRes.data.data);
      window.location.reload();
    } catch (err) {
      alert(t('quantTrading.tradeError') + (err.response?.data?.error || ""));
    }
  };

  // 즉시 거래 모달

 // --- 아래 유틸: 1~5분 사이 랜덤 ms 생성
function getRandomCooldownMs() {
  const min = 1 * 60 * 1000;   // 1분
  const max = 5 * 60 * 1000;   // 5분
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 현재 거래 가능 여부
const now = Date.now();
const canTrade = now >= cooldownEnd;
const remainingMs = Math.max(0, cooldownEnd - now);
const remainingMin = Math.floor(remainingMs / 60000);
const remainingSec = Math.floor((remainingMs % 60000) / 1000);

// 즉시 거래 버튼 클릭
const handleStart2 = async () => {
  if (finance.quantBalance < currentVIP.min_holdings) {
    return alert(
      t("quantTrading.errorMinHolding", { min: currentVIP.min_holdings })
    );
  }
  if (!canTrade) {
    return alert(
      t("quantTrading.cooldownAlert", { min: remainingMin, sec: remainingSec })
    );
  }

  // 직접 거래 실행
  const defaultAmount = Math.min(
    finance.quantBalance,
    currentVIP.max_investment
  );

  try {
    const res = await axios.post(
      "/api/quant-trade",
      { amount: defaultAmount },
      { withCredentials: true }
    );
    alert(res.data.message);

    // 성공 시 랜덤 쿨다운 설정
    const cooldownMs = getRandomCooldownMs();
    setCooldownEnd(Date.now() + cooldownMs);

    // 잔액 재조회
    const finRes = await axios.get("/api/wallet/finance-summary", {
      withCredentials: true,
    });
    setFinance({
      quantBalance: Number(finRes.data.data.quantBalance),
      fundBalance: Number(finRes.data.data.fundBalance),
    });
  } catch (err) {
    alert(t("quantTrading.tradeError") + (err.response?.data?.error || ""));
  }

  /* 기존 모달 코드 (주석처리)
  // 모달 띄우기 전, tradeAmount 셋팅 (잔고 vs max_investment)
  const defaultAmount = Math.min(
    finance.quantBalance,
    currentVIP.max_investment
  );
  setTradeAmount(defaultAmount);
  setShowInstantModal(true);
  */
};

  return (
    <div className="page-wrapper-qq">
      {/* 뒤로가기 */}
      <div className="top-bar">
      {/* 뒤로가기 */}
      <button onClick={() => history.back()} className="top-tran">←</button>

    {/* 제목 */}
    <h2 className="top-h-text">
      {t('quantTrading.title')}
    </h2>

    {/* 히스토리 버튼 */}
    <button onClick={() => setShowHistory(true)}>
      <HistoryIcon size={20} className="top-tran" />
    </button>
  </div>


{showHistory && <QuantHistoryModal onClose={() => setShowHistory(false)} />}
      {/* 자산 정보 */}
      <div className="referra-jj">
      <div>{t('quantTrading.available')} <strong>{finance.quantBalance} USDT</strong></div>
      <div>{t('quantTrading.todayEarning')} <strong>{summary.todayProfit.toFixed(6)} USDT</strong></div>
      <div>{t('quantTrading.totalEarning')} <strong>{summary.totalProfit.toFixed(6)} USDT</strong></div>
      </div>
      <div className="referra-m-l">
      <span className="font-semibold mr-2">VIP 등급 : </span>
      <strong>{currentVIP.level}</strong>
    </div>


      {/* 거래 버튼 및 모달 트리거() => setShowTradeModal(true) 
      <button
        onClick={handleStart}
        disabled={!canTrade}
        className={`
          referra-butt
          ${!canTrade
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'}
        `}
      >
    { !canTrade
      // 쿨다운 메시지도 i18n key로
      ? t('quantTrading.cooldownMessage', {
          min: remainingMin,
          sec: remainingSec
        })
      : t('quantTrading.tradeButton', {
          remaining,
          dailyLimit,
          times: t('quantTrading.times'),
          start: t('quantTrading.start')
        })
    }
  </button>
  */}     
{/* 남은 거래 횟수 표시 */}

      {/* 거래 버튼 */}
      <button
        onClick={handleStart}
        disabled={isTrading}
        className={`referra-butt ${
          isTrading
            ? "bg-gray-400 cursor-not-allowed opacity-50"
            : "bg-yellow-500 hover:bg-yellow-600 text-black"
        }`}
      >
        {isTrading
          ? t("quantTrading.tradingCountdown", { seconds: remainingTime })
          : `${remaining} / ${dailyLimit} ${t('quantTrading.times')} · ${t("quantTrading.start")}`}
      </button>

      {/* 빨간 경고 문구 */}
      {isTrading && (
        <p className="text-red-500 mt-2">
          {t("quantTrading.warningMessage")}
        </p>
      )}

  <div className="referra-quant-container">
    <span className="referra-quant-label">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="referra-quant-icon"
        viewBox="0 0 24 24"
        fill="#26ffe6"  // 골드 컬러, 원하시는 색으로 변경 가능
      >
        <path d="M12 2 L19 7 L19 17 L12 22 L5 17 L5 7 Z" />
      </svg>
      Progress Overview
    </span>
    <button
      onClick={() => navigate('/quant-tutorial')}
      className="referra-quant-tutorial-btn"
    >
      ➤
    </button>
  </div>

         {/* 레벨 카루셀 (VIP 관계없이 좌우 이동 가능) */}
        <div className="referra-h">

          <div className="referra-progress-text">
            {t('quantTrading.progress', { current: currentIndex + 1, total: vipLevels.length })}
          </div>
          
        <div className="referra-level-nav">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="referra-bold"
          >
            ◀
          </button>
          <span className="referra-left-align">Previous Level</span>
          <div className="referra-level-title">
            VIP {vipLevels[currentIndex]?.level} {t('quantTrading.level')}
          </div>
          <span className="referra-right-align">Higher level</span>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(vipLevels.length - 1, prev + 1))}
            className="referra-bold"
          >
            ▶
          </button>
        </div>
        
              {/* 상세 정보 */}
              <div className="vip-details-container">
                <div>
                  <span className="vip-details-label">{t('quantTrading.dailyLimit')}:</span>
                  <span className="vip-details-value">
                    {vipLevels[currentIndex]?.daily_trade_limit} {t('quantTrading.times')}
                  </span>
                </div>
                <div>
                  <span className="vip-details-label">{t('quantTrading.feeRate')}:</span>
                  <span className="vip-details-value">
                    {vipLevels[currentIndex]?.commission_min}% ~ {vipLevels[currentIndex]?.commission_max}%
                  </span>
                </div>
                <div>
                  <span className="vip-details-label">{t('quantTrading.maxInvestment')}:</span>
                  <span className="vip-details-value">
                    {vipLevels[currentIndex]?.max_investment} USDT
                  </span>
                </div>
                <div>
                  <span className="vip-details-label">{t('quantTrading.minHoldings')}:</span>
                  <span className="vip-details-value">
                    {vipLevels[currentIndex]?.min_holdings} USDT
                  </span>
                </div>
                <div>
                  <span className="vip-details-label">{t('quantTrading.conditions')}:</span>
                  <span className="vip-details-value">
                    A-{vipLevels[currentIndex]?.min_A}, B-{vipLevels[currentIndex]?.min_B}, C-{vipLevels[currentIndex]?.min_C}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/invite')}
                className="referra-invite-btn"
              >
                {t('quantTrading.invite')}
              </button>
      </div>




          {/* ─── 1) LEADERBOARD ─────────────────────────── */}
          {/* ─── 1) LEADERBOARD ─────────────────────────── */}
          <div className="leaderboard-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeaderboard.map((row, i) => (
                  <tr key={i}>
                    <td className="leaderboard-rank">{i + 1}</td>
                    <td className="leaderboard-name">{row.name}</td>
                    <td className="leaderboard-earnings">{row.earnings}</td>
                    <td className="leaderboard-status">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
      {/* ─── 2) PARTNERS ICON BAR ─────────────────────────── */}
      <div className="partners-section">
        <h3 className="partners-title">{t('quantTrading.partnersTitle')}</h3>
        <div className="partners-icons">
          {[
            '/icons/binance.png',
            '/icons/coinbase.png',
            '/icons/kraken.png',
            '/icons/kucoin.png',
            '/icons/gate.png',
            '/icons/bitfinex.png',
            '/icons/huobi.png',
            '/icons/gemini.png',
            '/icons/mexc.png'
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Partner ${i}`}
              className="partner-icon"
            />
          ))}
        </div>
      </div>



      {/* 즉시 거래 확인 모달 
      {showInstantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-black p-6 rounded w-80 text-center">
            <h3 className="mb-4 font-bold text-white text-lg">{t('quantTrading.confirmTitle')}</h3>
            <p className="mb-6 text-white">
              {t('quantTrading.confirmText', { amount: tradeAmount.toFixed(6) })}
            </p>
            <div className="flex justify-around">
              <button onClick={() => setShowInstantModal(false)} className="px-4 py-2 bg-red-900 rounded">
                {t('quantTrading.cancel')}
              </button>
              <button onClick={handleStart} className="px-4 py-2 bg-yellow-500 rounded">
                {t('quantTrading.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

*/}
     {/* 거래 금액 입력 모달 */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded w-3/4 max-w-sm">
            <h3 className="text-lg font-bold mb-4">{t('quantTrading.enterAmount')}</h3>
            <input
              type="number"
              value={tradeAmount}
              onChange={e => setTradeAmount(parseFloat(e.target.value))}
              className="w-full mb-4 p-2 border rounded"
              min={0}
              step="0.000001"
            />
            <div className="flex justify-between">
              <button onClick={() => setShowTradeModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                {t('quantTrading.cancel')}
              </button>
              <button onClick={handleStart} className="px-4 py-2 bg-yellow-500 text-black rounded">
                {t('quantTrading.confirm')}
              </button>
            </div>
          </div>
        </div>
  )}

      {/* 소개 모달 */}
      {showIntro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded w-3/4 max-w-md">
            <h3 className="text-lg font-bold mb-2">{t('quantTrading.introTitle')}</h3>
            <p className="mb-4">{t('quantTrading.introText')}</p>
            <button onClick={() => setShowIntro(false)} className="bg-yellow-500 text-black px-4 py-2 rounded">
              {t('quantTrading.close')}
            </button>
          </div>
        </div>
      )}

      <AlertPopup
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        duration={3000}
      />
    </div>
  );
}