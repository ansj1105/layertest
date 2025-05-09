// 📁 src/pages/MyProfilePage.jsx
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCopy,
  RefreshCw,
  ArrowDownCircle,
  FileText,
  LogOut
} from 'lucide-react';

axios.defaults.withCredentials = true;

function encodeId(id) {
  const ob = id ^ 0xA5A5A5A5;
  return ob.toString(16).toUpperCase().padStart(8, '0');
}

export default function MyProfilePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   // 펀딩(투자) 수익 집계용
 const [investmentEarnings, setInvestmentEarnings] = useState({
   total: 0,
   today: 0,
   yesterday: 0
 });
  // 레퍼럴 수익 집계용
  const [referralEarnings, setReferralEarnings] = useState({
    total: 0,
    today: 0,
    yesterday: 0
  });

  const navigate = useNavigate();
   // wallets_log 불러와서 funding in 항목 집계
   useEffect(() => {
     if (!user?.id) return;
     axios.get('/api/logs/wallets-log', { withCredentials: true })
       .then(res => {
        console.log('📥 wallets-log raw response:', res.data);
        const logs = res.data.data || [];
        console.log('🏷 parsed wallets-log entries:', logs);
         const now = new Date();
         const todayStr     = now.toISOString().slice(0,10);
         const yesterday    = new Date(now);
         yesterday.setDate(yesterday.getDate()-1);
         const yesterdayStr = yesterday.toISOString().slice(0,10);
  
         let total = 0, today = 0, yesterdaySum = 0;
         logs.forEach(log => {
           if (log.category==='funding' && log.direction==='in') {
             const amt = parseFloat(log.amount);
             total += amt;
             const logDate = new Date(log.logDate).toISOString().slice(0,10);
             if (logDate === todayStr) {
               today += amt;
             } else if (logDate === yesterdayStr) {
               yesterdaySum += amt;
             }
           }
         });
         setInvestmentEarnings({
          total,
           today,
           yesterday: yesterdaySum
         });
       })
       .catch(console.error);
   }, [user]);

  // 2) 레퍼럴 수익(referral type) 집계
  useEffect(() => {
    if (!user?.id) return;
    axios.get('/api/logs/quant-profits')
      .then(res => {
        console.log('📥 wallets-log raw response:', res.data);
        const rows = res.data.data || [];
        console.log('🏷 parsed wallets-log entries:', rows);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        let total = 0, today = 0, yesterdaySum = 0;
        rows.forEach(row => {

          // type이 'referral'인 것만 집계
          if (row.type === 'referral' || row.type === 'trade') {
            const amt = parseFloat(row.amount);
            total += amt;
            const rowDate = new Date(row.created_at).toISOString().slice(0, 10);
            if (rowDate === todayStr) {
              today += amt;
            } else if (rowDate === yesterdayStr) {
              yesterdaySum += amt;
            }
          }
        });
        setReferralEarnings({ total, today, yesterday: yesterdaySum });
      })
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    axios.get('/api/mydata/me')
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));

    axios.get('/api/mydata/summary')
      .then(res => {
        if (res.data.success) setSummary(res.data.data);
      })
      .catch(() => setSummary(null));
  }, []);


// quant-profits 불러와서 referral type 집계



console.log('오늘수익:',referralEarnings.today);  
console.log('전체수익:',referralEarnings.total);
  const handleCopyId = () => {
    const encId = encodeId(user.id);
    navigator.clipboard.writeText(encId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const doLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch {
      // 실패 처리 생략
    }
  };

  if (!user || !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1109] text-yellow-100">
        {t('profile.loading')}
      </div>
    );
  }

  const encId = encodeId(user.id);
   // summary.earnings.investment.* 대신 우리가 계산한 investmentEarnings 사용
    const totalEarnings = referralEarnings.total
      + investmentEarnings.total
      + summary.earnings.trade.total;
    const todayIncome     = referralEarnings.today
      + investmentEarnings.today
      + summary.earnings.trade.today;
    const yesterdayIncome = referralEarnings.yesterday
      + investmentEarnings.yesterday
      + summary.earnings.trade.yesterday;
    const commit = referralEarnings.today;
  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4 pb-[6rem] space-y-6">
      {/* ── 상단 프로필 ────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-xl">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {t('profile.greeting', { name: user.name })}
            </p>
            <p className="text-sm">{t('profile.vipLevel', { level: user.vip_level })}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-yellow-300">
            {t('profile.idLabel')}: {encId}
          </span>
          <ClipboardCopy
            size={16}
            className="cursor-pointer text-yellow-300 hover:text-white"
            onClick={handleCopyId}
          />
        </div>
      </div>

      {/* ── 잔액 및 수익 카드 ───────────────────────────────────── */}
      <div className="bg-[#2c1f0f] p-4 rounded-lg border border-yellow-700 space-y-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm">{t('profile.summary.totalBalance')}</p>
            <p className="text-2xl font-bold">
              {summary.balance.total.toFixed(2)} USDT
            </p>
          </div>
          <div>
            <p className="text-sm">{t('profile.summary.totalEarnings')}</p>
            <p className="text-2xl font-bold">
              {totalEarnings.toFixed(2)} USDT
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
          <p className="text-xs">{t('profile.summary.todayCommission')}</p>
            <p className="font-semibold">
              {commit.toFixed(2)} USDT
             </p>
           </div>
           <div>
             <p className="text-xs">{t('profile.summary.todayIncome')}</p>
             <p className="font-semibold">
              {todayIncome.toFixed(2)} USDT
            </p>
          </div>
          <div>
            <p className="text-xs">{t('profile.summary.yesterdayIncome')}</p>
            <p className="font-semibold">
              {yesterdayIncome.toFixed(2)} USDT
            </p>
          </div>
        </div>
      </div>

      {/* ── 작업 버튼 ─────────────────────────────────────────── */}
      <div className="flex justify-around">
        <button
          className="flex flex-col items-center text-yellow-100"
          onClick={() => navigate("/recharge")}
        >
          <RefreshCw size={28} className="mb-1" />
          <span className="text-xs">{t('profile.actions.recharge')}</span>
        </button>
        <button
          className="flex flex-col items-center text-yellow-100"
          onClick={() => navigate("/withdraw")}
        >
          <ArrowDownCircle size={28} className="mb-1" />
          <span className="text-xs">{t('profile.actions.withdraw')}</span>
        </button>
        <button
          className="flex flex-col items-center text-yellow-100"
          onClick={() => navigate("/withdraw/history")}
        >
          <FileText size={28} className="mb-1" />
          <span className="text-xs">{t('profile.actions.details')}</span>
        </button>
      </div>

      {/* ── 레퍼럴 계층 현황 ──────────────────────────────────── */}
      <div className="bg-[#2c1f0f] p-4 rounded-lg border border-yellow-700 grid grid-cols-3 text-center">
        <div>
          <p className="text-sm">{t('profile.referral.level1')}</p>
          <p className="font-semibold">{summary.referrals.level2}</p>
        </div>
        <div>
          <p className="text-sm">{t('profile.referral.level2')}</p>
          <p className="font-semibold">{summary.referrals.level3}</p>
        </div>
        <div>
          <p className="text-sm">{t('profile.referral.level3')}</p>
          <p className="font-semibold">{summary.referrals.level4}</p>
        </div>
      </div>

      {/* ── 메뉴 리스트 ───────────────────────────────────────── */}
      <div className="bg-[#2c1f0f] rounded-lg divide-y divide-yellow-700">
        {[
          { icon: '🏆', key: 'taskCenter',    to: '/taskcenter' },
          { icon: '❓', key: 'faq',           to: '/commonproblem' },
          { icon: '🔒', key: 'securityCenter',to: '/security' },
          { icon: '📈', key: 'quantTutorial', to: '/quant-tutorial' },
          { icon: '🌐', key: 'language',      to: '/settings/language' },
          { icon: '🏢', key: 'aboutCompany',  to: '/company' },
          { icon: '⬇️', key: 'downloadApp',   to: '/download' }
        ].map((item, i) => {
          const label = t(`profile.menu.${item.key}`);
          const base = "flex items-center p-3 text-yellow-100 hover:bg-yellow-900 cursor-pointer";
          return (
            <Link key={i} to={item.to} className={base}>
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── 로그아웃 버튼 ─────────────────────────────────────────── */}
      <div className="text-center mt-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="inline-flex items-center text-red-400 hover:underline"
        >
          <LogOut size={16} className="mr-1" />
          {t('profile.logout')}
        </button>
      </div>

      {/* ── ID 복사 알림 ───────────────────────────────────────── */}
      {copySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white py-2 px-4 rounded">
          {t('profile.copySuccess')}
        </div>
      )}

      {/* ── 로그아웃 확인 모달 ─────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#2c1f0f] rounded-lg w-80 p-6 text-center space-y-4">
            <p className="text-white text-lg">{t('profile.logoutConfirmMessage')}</p>
            <div className="flex mt-4 divide-x divide-gray-600">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-gray-300 hover:text-white"
              >
                {t('profile.logoutCancel')}
              </button>
              <button
                onClick={doLogout}
                className="flex-1 py-2 text-yellow-400 hover:text-yellow-300"
              >
                {t('profile.logoutConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
