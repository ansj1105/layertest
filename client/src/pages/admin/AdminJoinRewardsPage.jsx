// 📁 src/pages/admin/AdminJoinRewardsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminJoinRewardsPage() {
  const [tab, setTab]     = useState('rules'); // 'rules' or 'claims'
  const [rules, setRules] = useState([]);
  const [claims, setClaims] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ id: null, amount: '', required_balance: '' });

  useEffect(() => {
    fetchRules();
    if (tab === 'claims') fetchClaims();
  }, [tab]);

  const fetchRules = async () => {
    const res = await axios.get('/api/admin/join-rewards', { withCredentials: true });
    setRules(res.data.data);
  };
  const fetchClaims = async () => {
    const res = await axios.get('/api/admin/join-rewards/claims', { withCredentials: true });
    setClaims(res.data.data);
  };

  const openNew = () => {
    setForm({ id: null, amount: '', required_balance: '' });
    setEditing(true);
  };
  const openEdit = r => {
    setForm({ id: r.id, amount: r.amount, required_balance: r.required_balance });
    setEditing(true);
  };
  const deleteRule = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await axios.delete(`/api/admin/join-rewards/${id}`, { withCredentials: true });
    fetchRules();
  };
  const submitRule = async e => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(form.amount),
      required_balance: parseFloat(form.required_balance),
    };
    if (form.id) {
      await axios.put(`/api/admin/join-rewards/${form.id}`, payload, { withCredentials: true });
    } else {
      await axios.post(`/api/admin/join-rewards`, payload, { withCredentials: true });
    }
    setEditing(false);
    fetchRules();
  };

  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <div className="ml-64 flex-1 p-6 bg-[#1a1109] text-yellow-100">
        {/* 탭 */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${tab==='rules' ? 'bg-yellow-600' : 'bg-yellow-800'}`}
            onClick={()=>setTab('rules')}
          >보너스 규칙 관리</button>
          <button
            className={`px-4 py-2 rounded ${tab==='claims'? 'bg-yellow-600' : 'bg-yellow-800'}`}
            onClick={()=>setTab('claims')}
          >수령 내역 조회</button>
        </div>

        {tab === 'rules' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">가입 보너스 규칙</h2>
              <button
                onClick={openNew}
                className="inline-flex items-center bg-green-600 text-black px-3 py-1 rounded"
              >
                <Plus size={16} className="mr-1"/> 규칙 추가
              </button>
            </div>
            <table className="w-full table-auto border-collapse mb-6">
              <thead>
                <tr className="bg-[#2c1f0f] text-center">
                  <th className="px-2 py-1">ID</th>
                  <th className="px-2 py-1">보상(USDT)</th>
                  <th className="px-2 py-1">최소잔액</th>
                  <th className="px-2 py-1">액션</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr
                    key={r.id}
                    className={r.id%2===0? 'bg-[#3a270e]' : 'bg-[#2b1e0f]'}
                  >
                    <td className="px-2 py-1 text-center">{r.id}</td>
                    <td className="px-2 py-1 text-center">{parseFloat(r.amount).toFixed(6)}</td>
                    <td className="px-2 py-1 text-center">{parseFloat(r.required_balance).toFixed(6)}</td>
                    <td className="px-2 py-1 text-center space-x-2">
                      <button onClick={()=>openEdit(r)}><Edit2 size={16}/></button>
                      <button onClick={()=>deleteRule(r.id)}><Trash2 size={16} className="text-red-500"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editing && (
              <form onSubmit={submitRule} className="bg-[#2c1f0f] p-4 rounded space-y-3">
                <div className="flex items-center">
                  <label className="w-32">보상(USDT)</label>
                  <input
                    type="number" step="0.000001" min="0"
                    className="flex-1 bg-black p-2 rounded text-yellow-100"
                    value={form.amount}
                    onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-32">최소잔액</label>
                  <input
                    type="number" step="0.000001" min="0"
                    className="flex-1 bg-black p-2 rounded text-yellow-100"
                    value={form.required_balance}
                    onChange={e=>setForm(f=>({...f,required_balance:e.target.value}))}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="submit" className="bg-yellow-600 px-4 rounded">저장</button>
                  <button type="button" onClick={()=>setEditing(false)} className="bg-gray-600 px-4 rounded">취소</button>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl mb-4">가입 보너스 수령 내역</h2>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-[#2c1f0f] text-center">
                  <th className="px-2 py-1">클레임 ID</th>
                  <th className="px-2 py-1">유저 ID</th>
                  <th className="px-2 py-1">이메일</th>
                  <th className="px-2 py-1">보상(USDT)</th>
                  <th className="px-2 py-1">최소잔액</th>
                  <th className="px-2 py-1">수령일시</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr
                    key={c.id}
                    className={c.id%2===0? 'bg-[#3a270e]' : 'bg-[#2b1e0f]'}
                  >
                    <td className="px-2 py-1 text-center">{c.id}</td>
                    <td className="px-2 py-1 text-center">{c.user_id}</td>
                    <td className="px-2 py-1 text-center">{c.email}</td>
                    <td className="px-2 py-1 text-center">{parseFloat(c.amount).toFixed(6)}</td>
                    <td className="px-2 py-1 text-center">{parseFloat(c.required_balance).toFixed(6)}</td>
                    <td className="px-2 py-1 text-center">
                      {new Date(c.claimed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
