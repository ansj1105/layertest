// 📁 src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav'; // ✅ 네비게이션 컴포넌트 임포트
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 예시: 유저 리스트 API (검색/페이지네이션)
  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/dashboard/users/list', {
      params: { search, page, pageSize: 10 }
    })
      .then(res => {
        ////console.log('User list data:', res.data);
        setUsers(res.data.users);
        setTotal(res.data.total);
      })
      .catch(err => {
        console.error('유저 로드 실패:', err);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  // 예시: 도표용 데이터 (가입자/입금/출금/수익 일별 추이)
  const [chartTab, setChartTab] = useState('signup'); // 'signup' | 'deposit' | 'withdrawal' | 'profit'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  // 도표 데이터
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const params = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
    axios.get('/api/admin/dashboard/stats/daily', { params })
      .then(res => {
        setChartData(res.data);
      })
      .catch(err => {
        console.error('Stats data fetch failed:', err);
      });
  }, [startDate, endDate]);

  // 누적합 구하기
  const getCumulative = arr => {
    let sum = 0;
    return arr.map(v => (sum += v));
  };

  // 탭별 label/data/color
  const chartTabInfo = {
    signup: { label: chartTab === 'daily' ? '일별 가입' : '총 가입', color: '#60a5fa', data: chartData ? (chartTab === 'daily' ? chartData.signup : getCumulative(chartData.signup)) : [] },
    deposit: { label: chartTab === 'daily' ? '일별 입금' : '총 입금', color: '#34d399', data: chartData ? (chartTab === 'daily' ? chartData.deposit : getCumulative(chartData.deposit)) : [] },
    withdrawal: { label: chartTab === 'daily' ? '일별 출금' : '총 출금', color: '#f87171', data: chartData ? (chartTab === 'daily' ? chartData.withdrawal : getCumulative(chartData.withdrawal)) : [] },
    profit: { label: chartTab === 'daily' ? '일별 수익' : '총 수익', color: '#fbbf24', data: chartData ? (chartTab === 'daily' ? chartData.profit : getCumulative(chartData.profit)) : [] }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ 공통 네비게이션 */}
      <AdminNav onLogout={onLogout} />

      {/* ✅ 콘텐츠 */}
      <div className="ml-64 p-6 space-y-6">

        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        {/* 도표 */}
        <div className="bg-white rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">가입/입금/출금/수익 도표</h2>
          <div className="flex gap-2 mb-4 items-center">
            {['signup', 'deposit', 'withdrawal', 'profit'].map(type => (
              <button
                key={type}
                className={`px-3 py-1 rounded ${chartTab === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartTab(type)}
              >
                {type === 'signup' ? '가입' : type === 'deposit' ? '입금' : type === 'withdrawal' ? '출금' : '수익'}
              </button>
            ))}
            <div className="flex items-center ml-4 gap-2">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="border px-2 py-1 rounded"
                maxDate={endDate}
              />
              <span>~</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="border px-2 py-1 rounded"
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
          {chartData && (
            <Bar
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: chartTabInfo[chartTab].label,
                    data: chartTabInfo[chartTab].data,
                    backgroundColor: chartTabInfo[chartTab].color
                  }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
            />
          )}
        </div>

        {/* 유저 리스트 */}
        <div className="bg-white rounded p-4 shadow">
          <div className="flex items-center mb-4">
            <input
              className="border px-2 py-1 rounded mr-2"
              placeholder="이름/이메일/전화번호 검색"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <span className="text-sm text-gray-500">총 {total}명</span>
          </div>
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">ID</th>
                  <th className="p-2">이름</th>
                  <th className="p-2">이메일</th>
                  <th className="p-2">전화번호</th>
                  <th className="p-2">가입일</th>
                  <th className="p-2">실제잔액</th>
                  <th className="p-2">펀드잔액</th>
                  <th className="p-2">퀀트잔액</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.phone || '-'}</td>
                    <td className="p-2">{u.created_at?.slice(0, 10)}</td>
                    <td className="p-2">{Number(u.real_amount).toFixed(2)}</td>
                    <td className="p-2">{Number(u.fund_balance).toFixed(2)}</td>
                    <td className="p-2">{Number(u.quant_balance).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* 페이지네이션 */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 mx-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setPage(i + 1)}
              >{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
