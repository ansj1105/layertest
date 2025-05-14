// 📁 src/pages/admin/AdminInviteRewardsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminInviteRewardsPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    referral_level: '',
    required_referrals: '',
    reward_amount: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await axios.get('/api/admin/invite-rewards', { withCredentials: true });
      setList(res.data.data);
    } catch (err) {
      console.error('리스트 로딩 실패', err);
    }
  };

  const openNew = () => {
    setForm({ id: null, referral_level: '', required_referrals: '', reward_amount: '' });
    setEditing(true);
  };

  const openEdit = item => {
    setForm(item);
    setEditing(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await axios.delete(`/api/admin/invite-rewards/${id}`, { withCredentials: true });
    fetchList();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      referral_level: Number(form.referral_level),
      required_referrals: Number(form.required_referrals),
      reward_amount: parseFloat(form.reward_amount)
    };
    if (form.id) {
      await axios.put(`/api/admin/invite-rewards/${form.id}`, payload, { withCredentials: true });
    } else {
      await axios.post('/api/admin/invite-rewards', payload, { withCredentials: true });
    }
    setEditing(false);
    fetchList();
  };

  return (
    <div className="flex min-h-screen">
      {/* 좌측 네비 */}
      <AdminNav />

      {/* 본문 */}
      <div className="ml-64 flex-1 bg-white text-gray-800 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">초대 보상 관리</h2>
          <button
            onClick={openNew}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <Plus size={18} className="mr-2"/> 추가
          </button>
        </div>

        {/* 보상 목록 테이블 */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">단계</th>
                <th className="px-4 py-2 text-left">필요 추천인 수</th>
                <th className="px-4 py-2 text-left">보상 (USDT)</th>
                <th className="px-4 py-2 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? 'bg-gray-50' : ''}
                >
                  <td className="px-4 py-2">{item.referral_level}</td>
                  <td className="px-4 py-2">{item.required_referrals}</td>
                  <td className="px-4 py-2">
                    {parseFloat(item.reward_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 space-x-3">
                    <button onClick={() => openEdit(item)}>
                      <Edit2 size={16} className="text-blue-500 hover:text-blue-700"/>
                    </button>
                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} className="text-red-500 hover:text-red-700"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 추가/수정 폼 */}
        {editing && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">추천 단계</label>
                <input
                  type="number"
                  min="1"
                  value={form.referral_level}
                  onChange={e => setForm(f => ({ ...f, referral_level: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">필요 추천인 수</label>
                <input
                  type="number"
                  min="1"
                  value={form.required_referrals}
                  onChange={e => setForm(f => ({ ...f, required_referrals: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">보상 금액 (USDT)</label>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={form.reward_amount}
                  onChange={e => setForm(f => ({ ...f, reward_amount: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
