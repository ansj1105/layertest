import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // 내 프로필, VIP 레벨, 수익 요약 조회
  useEffect(() => {
    axios.get('/api/mydata/me')
      .then(res => setUser2(res.data.user))
      .catch(() => setUser2(null));

    axios.get('/api/quant-profits/summary', { withCredentials: true })
      .then(res => setSummary(res.data.data))
      .catch(() => setSummary({ todayProfit: 0, totalProfit: 0 }));
  }, []);

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

  const currentVIP = vipLevels.find(v => v.level === user2?.vip_level) || {};
// ↙ 기존 executeTrade 대신, 바로 실행하는 함수
const handleStartTrade = async () => {
  const minHold   = vipLevels[currentIndex]?.min_holdings;
  const maxInvest = vipLevels[currentIndex]?.max_investment;
  const bal       = finance.quantBalance;

  // 1) 최소 보유량 체크
  if (bal < minHold) {
    return alert(t('quantTrading.errorMinHold', { minHold }));
  }

  // 2) 실제 주문 금액 = Math.min(보유량, VIP 최대투자)
  const amount = Math.min(bal, maxInvest);

  try {
    // ── 여기에 실제 주문 API 호출 ──
    const res = await axios.post(
      '/api/quant-trade',
      { amount },
      { withCredentials: true }
    );
    alert(t('quantTrading.success', { amount }));
    // 주문 후 잔액 / 이익 요약 등 재조회
    const finRes = await axios.get('/api/wallet/finance-summary', { withCredentials: true });
    setFinance({
      quantBalance: finRes.data.data.quantBalance,
      fundBalance:  finRes.data.data.fundBalance
    });
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || t('quantTrading.errorExec'));
  }
};
  return (
    <div className="p-6 text-yellow-100 bg-[#1a1109] min-h-screen">
      {/* 뒤로가기 */}
      <button onClick={() => navigate(-1)} className="flex items-center mb-4 text-yellow-200 hover:text-yellow-100">
        <ArrowLeftIcon size={20} />
        <span className="ml-1">{t('quantTrading.back')}</span>
      </button>

      {/* 제목 */}
      <h2 className="text-xl font-bold text-center mb-4">{t('quantTrading.title')}</h2>

      {/* 자산 및 수익 정보 */}
      <div className="bg-[#2e1c10] rounded p-4 mb-4 text-sm">
        <div>{t('quantTrading.available')}: <strong>{finance.quantBalance} USDT</strong></div>
        <div>{t('quantTrading.todayEarning')}: <strong>{summary.todayProfit.toFixed(6)} USDT</strong></div>
        <div>{t('quantTrading.totalEarning')}: <strong>{summary.totalProfit.toFixed(6)} USDT</strong></div>
      </div>

      {/* 현재 VIP 레벨 */}
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
      {/* 거래 버튼 및 모달 트리거 */}
      <button onClick={() => handleStartTrade(true)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold text-lg mt-4">
        {t('quantTrading.start')}
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
