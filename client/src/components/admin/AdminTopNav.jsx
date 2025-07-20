import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminTopNav() {
  const [stats, setStats] = useState({
    withdrawals: { today: { today_withdrawal: 0, today_deposit: 0 }, total: { total_withdrawal: 0, total_deposit: 0 } },
    quantProfitsToday: { total_amount: 0 },
    quantProfitsTotal: { total_amount: 0 },
    quantProfitsUsers: [],
    fundingInvestmentsToday: { total_profit: 0 },
    fundingInvestmentsTotal: { total_profit: 0 },
    fundingInvestmentsUsers: [],
    users: { today: 0, total: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [withdrawalsRes, quantTodayRes, quantTotalRes, quantUsersRes, fundingTodayRes, fundingTotalRes, fundingUsersRes, usersRes] = await Promise.all([
          axios.get('/api/admin/dashboard/withdrawals'),
          axios.get('/api/admin/dashboard/quant-profits/today'),
          axios.get('/api/admin/dashboard/quant-profits/total'),
          axios.get('/api/admin/dashboard/quant-profits/users'),
          axios.get('/api/admin/dashboard/funding-investments/today'),
          axios.get('/api/admin/dashboard/funding-investments/total'),
          axios.get('/api/admin/dashboard/funding-investments/users'),
          axios.get('/api/admin/dashboard/users')
        ]);
        setStats({
          withdrawals: withdrawalsRes.data,
          quantProfitsToday: quantTodayRes.data.today,
          quantProfitsTotal: quantTotalRes.data.total,
          quantProfitsUsers: quantUsersRes.data.users,
          fundingInvestmentsToday: fundingTodayRes.data.today,
          fundingInvestmentsTotal: fundingTotalRes.data.total,
          fundingInvestmentsUsers: fundingUsersRes.data.users,
          users: usersRes.data
        });
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
      }
    };
    fetchStats();
  }, []);

  // 값이 없거나 0이면 N/A로 표시
  const displayValue = v => (v === undefined || v === null || isNaN(v) || Number(v) === 0) ? 'N/A' : v;

  // 오늘 수익, 총 수익: quant amount + funding profit 합산
  const todayProfit =
    Number(stats.quantProfitsToday?.total_amount || 0) +
    Number(stats.fundingInvestmentsToday?.total_profit || 0);

  const totalProfit =
    (stats.quantProfitsUsers?.reduce((sum, user) => sum + Number(user.total_amount || 0), 0) || 0) +
    (stats.fundingInvestmentsUsers?.reduce((sum, user) => sum + Number(user.total_profit || 0), 0) || 0);

  return (
    <div
      className="admin-topnav-container bg-gray-50 rounded-lg mb-4 transition-all duration-200"
      style={{
        marginLeft: 256,
        maxWidth: 'calc(100vw - 256px)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div className="bg-white rounded-lg shadow p-4 h-20 flex flex-col justify-center">
          <h3 className="text-sm font-semibold mb-1">오늘 입금/출금</h3>
          <div className="text-xs">입금: {displayValue(stats.withdrawals.today.today_deposit)}</div>
          <div className="text-xs">출금: {displayValue(stats.withdrawals.today.today_withdrawal)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-20 flex flex-col justify-center">
          <h3 className="text-sm font-semibold mb-1">총 입금/출금</h3>
          <div className="text-xs">입금: {displayValue(stats.withdrawals.total.total_deposit)}</div>
          <div className="text-xs">출금: {displayValue(stats.withdrawals.total.total_withdrawal)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-20 flex flex-col justify-center">
          <h3 className="text-sm font-semibold mb-1">오늘 유저 수익/총 수익</h3>
          <div className="text-xs">오늘 수익: {displayValue(todayProfit)}</div>
          <div className="text-xs">총 수익: {displayValue(totalProfit)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-20 flex flex-col justify-center">
          <h3 className="text-sm font-semibold mb-1">오늘 가입/총 가입</h3>
          <div className="text-xs">오늘 가입: {displayValue(stats.users.today)}</div>
          <div className="text-xs">총 가입: {displayValue(stats.users.total)}</div>
        </div>
      </div>
    </div>
  );
} 