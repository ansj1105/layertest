import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon,HistoryIcon} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QuantHistoryModal from './QuantHistoryModal';
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
   // inside your component's state
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
  useEffect(() => {
    const timer = setInterval(() => {
      setLbStart(prev => (prev + 5) % ALL_LEADERBOARD.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ALL_LEADERBOARD.length]);

  //
  // 3) Compute the 5 entries to show, wrapping if necessary
  //
  const visibleLeaderboard = useMemo(() => {
    const end = lbStart + 5;
    if (end <= ALL_LEADERBOARD.length) {
      return ALL_LEADERBOARD.slice(lbStart, end);
    }
    return [
      ...ALL_LEADERBOARD.slice(lbStart),
      ...ALL_LEADERBOARD.slice(0, end - ALL_LEADERBOARD.length)
    ];
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
  
   const executeTrade = async () => {
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
     } catch (err) {
       alert(t('quantTrading.tradeError') + (err.response?.data?.error || ""));
     }
   };
  const handleTrade = async () => {
    if (!window.confirm(t('quantTrading.confirmStart'))) return;
    try {
      const res = await axios.post("/api/quant-trade", { amount: 100 }, { withCredentials: true });
      alert(res.data.message);
    } catch (err) {
      alert(t('quantTrading.tradeError') + (err.response?.data?.error || ""));
    }
  };

  return (
    <div className="p-6 text-yellow-100 bg-[#1a1109] min-h-screen">
      {/* 뒤로가기 */}
      <div className="flex items-center justify-between mb-4">
    {/* 뒤로가기 */}
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-yellow-200 hover:text-yellow-100"
    >
      <ArrowLeftIcon size={20} />
      <span className="ml-1">{t('quantTrading.back')}</span>
    </button>

    {/* 제목 */}
    <h2 className="text-xl font-bold text-center flex-grow">
      {t('quantTrading.title')}
    </h2>

    {/* 히스토리 버튼 */}
    <button onClick={() => setShowHistory(true)}>
      <HistoryIcon size={20} className="text-yellow-200 hover:text-yellow-100" />
    </button>
  </div>


{showHistory && <QuantHistoryModal onClose={() => setShowHistory(false)} />}
      {/* 자산 정보 */}
      <div className="bg-[#2e1c10] rounded p-4 mb-4 text-sm">
      <div>{t('quantTrading.available')}: <strong>{finance.quantBalance} USDT</strong></div>
      <div>{t('quantTrading.todayEarning')}: <strong>{summary.todayProfit.toFixed(6)} USDT</strong></div>
      <div>{t('quantTrading.totalEarning')}: <strong>{summary.totalProfit.toFixed(6)} USDT</strong></div>
      </div>
      <div className="bg-[#2e1c10] rounded p-4 mb-4 text-sm flex items-center">
      <span className="font-semibold mr-2">{t('quantTrading.currentLevel')}:</span>
      <strong>VIP {currentVIP.level}</strong>
    </div>
         {/* 레벨 카루셀 (VIP 관계없이 좌우 이동 가능) */}
         <div className="bg-[#342410] p-4 rounded text-sm mb-2">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="text-yellow-500 font-bold text-lg"
          >
            ←
          </button>
          <div className="text-center flex-grow font-bold text-yellow-300">
            VIP {vipLevels[currentIndex]?.level} {t('quantTrading.level')}
          </div>
          <button
            onClick={() => setCurrentIndex(prev => Math.min(vipLevels.length - 1, prev + 1))}
            className="text-yellow-500 font-bold text-lg"
          >
            →
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mb-2">
          {t('quantTrading.progress', { current: currentIndex + 1, total: vipLevels.length })}
        </div>
        <button
          onClick={() => setShowIntro(true)}
          className="w-full bg-yellow-600 text-black py-2 rounded font-semibold mb-2"
        >
          {t('quantTrading.intro')}
        </button>
        <button
          onClick={() => navigate('/invite')}
          className="w-full border border-yellow-400 text-yellow-400 py-1 rounded font-semibold"
        >
          {t('quantTrading.invite')}
        </button>
      </div>


      {/* 상세 정보 */}
      <div className="bg-[#342410] p-4 rounded text-sm">
        <div>{t('quantTrading.dailyLimit')}: {vipLevels[currentIndex]?.daily_trade_limit} {t('quantTrading.times')}</div>
        <div>{t('quantTrading.feeRate')}: {vipLevels[currentIndex]?.commission_min}% ~ {vipLevels[currentIndex]?.commission_max}%</div>
        <div>{t('quantTrading.maxInvestment')}: {vipLevels[currentIndex]?.max_investment} USDT</div>
        <div>{t('quantTrading.minHoldings')}: {vipLevels[currentIndex]?.min_holdings} USDT</div>
        <div>{t('quantTrading.conditions')}: A-{vipLevels[currentIndex]?.min_A}, B-{vipLevels[currentIndex]?.min_B}, C-{vipLevels[currentIndex]?.min_C}</div>
      </div>

          {/* ─── 1) LEADERBOARD ─────────────────────────── */}
          {/* ─── 1) LEADERBOARD ─────────────────────────── */}
      <div className="bg-[#342410] rounded p-4 mb-6 text-sm">
        <h3 className="text-yellow-300 font-semibold mb-2">
          {t("quantTrading.leaderboardTitle")}
        </h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400">
              <th className="pb-2">{t("quantTrading.leaderboard.name")}</th>
              <th className="pb-2">{t("quantTrading.leaderboard.earnings")}</th>
              <th className="pb-2">{t("quantTrading.leaderboard.status")}</th>
            </tr>
          </thead>
          <tbody>
            {visibleLeaderboard.map((row, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="py-1">{row.name}</td>
                <td className="py-1">{row.earnings}</td>
                <td className="py-1">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* ─── 2) PARTNERS ICON BAR ─────────────────────────── */}
      <div className="mt-8 text-center">
        <h3 className="text-gray-400 mb-2">{t('quantTrading.partnersTitle')}</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            '/icons/binance.png',
           // '/icons/okx.png',
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
              alt=""
              className="h-8 w-8 object-contain opacity-80 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
      {/* 거래 버튼 및 모달 트리거 */}
       <button
   onClick={() => setShowTradeModal(true)}
   className="pb-10 w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold text-lg mt-4"
 >
   {remaining}/{dailyLimit} {t("quantTrading.times")} · {t("quantTrading.start")}
 </button>

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
             <button onClick={executeTrade} className="px-4 py-2 bg-yellow-500 text-black rounded">
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
    </div>
  );
}