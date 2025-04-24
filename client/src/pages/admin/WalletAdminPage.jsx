// 📁 src/pages/admin/WalletAdminPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';
import FundingProjectList from '../../components/admin/FundingProjectList';
import FundingProjectForm from '../../components/admin/FundingProjectForm';
import FundingInvestorList from '../../components/admin/FundingInvestorList';
import FundingMonitoring from '../../components/admin/FundingMonitoring';

export default function WalletAdminPage({ onLogout }) {
  const [settings, setSettings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');
  const [fundingTab, setFundingTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deposit_fee_rate: '',
    withdraw_fee_rate: '',
    auto_approve: 'manual',
  });

  // Fetch settings, requests, projects
  useEffect(() => {
    fetchSettings();
    fetchRequests();
    fetchProjects();
  }, []);

  const fetchSettings = async () => {
    const res = await axios.get('/api/wallet/settings', { withCredentials: true });
    setSettings(res.data.data);
    setForm(res.data.data);
  };
  const fetchRequests = async () => {
    const res = await axios.get('/api/wallet/requests?type=all', { withCredentials: true });
    setRequests(res.data);
  };
  const fetchProjects = async () => {
    const res = await axios.get('/api/wallet/projects', { withCredentials: true });
    setProjects(res.data);
  };

  const handleSettingsSave = async () => {
    setLoading(true);
    await axios.put('/api/wallet/settings', form, { withCredentials: true });
    await fetchSettings();
    setLoading(false);
  };

  const handleProcessRequest = async (id, status) => {
    await axios.patch(`/api/wallet/requests/${id}`, { status }, { withCredentials: true });
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">💼 재무 관리</h1>
        {/* 상단 탭 */}
        <div className="flex space-x-4 mb-6">
          {['settings', 'requests', 'projects'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${activeTab===tab ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
            >
              {tab==='settings' ? '설정' : tab==='requests' ? '입출금 요청' : '펀딩 프로젝트'}
            </button>
          ))}
        </div>

        {/* 설정 탭 */}
        {activeTab==='settings' && settings && (
          <div className="bg-white p-4 rounded shadow w-full max-w-md">
            <h2 className="font-semibold mb-2">수수료 및 자동처리 설정</h2>
            <div className="space-y-4">
              <div>
                <label>입금 수수료 (%)</label>
                <input
                  type="number"
                  value={form.deposit_fee_rate}
                  onChange={e => setForm({...form, deposit_fee_rate: e.target.value})}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>
              <div>
                <label>출금 수수료 (%)</label>
                <input
                  type="number"
                  value={form.withdraw_fee_rate}
                  onChange={e => setForm({...form, withdraw_fee_rate: e.target.value})}
                  className="w-full border px-2 py-1 rounded mt-1"
                />
              </div>
              <div>
                <label>자동 처리</label>
                <select
                  value={form.auto_approve}
                  onChange={e => setForm({...form, auto_approve: e.target.value})}
                  className="w-full border px-2 py-1 rounded mt-1"
                >
                  <option value="auto">자동</option>
                  <option value="manual">수동</option>
                </select>
              </div>
              <button
                onClick={handleSettingsSave}
                disabled={loading}
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
              >저장</button>
            </div>
          </div>
        )}

        {/* 요청 탭 */}
        {activeTab==='requests' && (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">유저 ID</th>
                  <th className="p-2">이메일</th>
                  <th className="p-2">타입</th>
                  <th className="p-2">금액</th>
                  <th className="p-2">수수료</th>
                  <th className="p-2">상태</th>
                  <th className="p-2">요청일</th>
                  <th className="p-2">처리</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{r.user_id}</td>
                    <td className="p-2">{r.email}</td>
                    <td className="p-2">{r.type}</td>
                    <td className="p-2">{r.amount}</td>
                    <td className="p-2">{r.fee}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2 space-x-2">
                      {r.status==='pending' && (
                        <> 
                          <button onClick={()=>handleProcessRequest(r.id,'approved')} className="px-2 py-1 bg-green-500 text-white rounded">승인</button>
                          <button onClick={()=>handleProcessRequest(r.id,'rejected')} className="px-2 py-1 bg-red-500 text-white rounded">거절</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 펀딩 프로젝트 탭 */}
        {activeTab==='projects' && (
          <>
            <div className="flex space-x-2 mb-4">
              {['list','form','investors','monitor'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setFundingTab(sub)}
                  className={`px-3 py-1 rounded ${fundingTab===sub ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                >
                  {sub==='list' ? '프로젝트 목록'
                    : sub==='form' ? '프로젝트 생성'
                    : sub==='investors' ? '투자자 목록'
                    : '진행 모니터링'}
                </button>
              ))}
            </div>
            <div>
              {fundingTab==='list'      && <FundingProjectList projects={projects} />}
              {fundingTab==='form'      && <FundingProjectForm onSaved={fetchProjects} />}
              {fundingTab==='investors' && <FundingInvestorList />}
              {fundingTab==='monitor'   && <FundingMonitoring />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
