// 📁 src/pages/admin/TokensAdminPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function TokensAdminPage({ onLogout }) {
  const [tokens, setTokens]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    id: '',
    name: '',
    symbol: '',
    description: '',
    total_supply: '',
    circulating_supply: '',
    decimals: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/tokens');
      setTokens(res.data.data || []);
    } catch (err) {
      console.error('토큰 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        symbol: form.symbol,
        description: form.description,
        total_supply: parseFloat(form.total_supply),
        circulating_supply: parseFloat(form.circulating_supply),
        decimals: parseInt(form.decimals, 10)
      };
      if (editing) {
        await axios.put(`/api/admin/tokens/${form.id}`, payload);
      } else {
        await axios.post('/api/admin/tokens', payload);
      }
      resetForm();
      fetchTokens();
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handleEdit = (tkn) => {
    setForm({
      id: tkn.id,
      name: tkn.name,
      symbol: tkn.symbol,
      description: tkn.description,
      total_supply: tkn.total_supply,
      circulating_supply: tkn.circulating_supply,
      decimals: tkn.decimals
    });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/tokens/${id}`);
      fetchTokens();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      symbol: '',
      description: '',
      total_supply: '',
      circulating_supply: '',
      decimals: ''
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full space-y-6">
        <h1 className="text-2xl font-bold">Tokens 관리</h1>

        {/* 등록/수정 폼 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">
            {editing ? '토큰 수정' : '신규 토큰 등록'} 폼
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 rounded"
              required
            />
            <input
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              placeholder="Symbol"
              className="border p-2 rounded"
              required
            />
            <input
              name="total_supply"
              value={form.total_supply}
              onChange={handleChange}
              placeholder="Total Supply"
              type="number"
              step="any"
              className="border p-2 rounded"
              required
            />
            <input
              name="circulating_supply"
              value={form.circulating_supply}
              onChange={handleChange}
              placeholder="Circulating Supply"
              type="number"
              step="any"
              className="border p-2 rounded"
              required
            />
            <input
              name="decimals"
              value={form.decimals}
              onChange={handleChange}
              placeholder="Decimals"
              type="number"
              className="border p-2 rounded"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="col-span-2 border p-2 rounded"
              rows={3}
            />
            <div className="col-span-2 flex space-x-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editing ? '수정 저장' : '등록'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                초기화
              </button>
            </div>
          </form>
        </div>

        {/* 목록 테이블 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Tokens 목록</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">Symbol</th>
                    <th className="px-2 py-1">Total</th>
                    <th className="px-2 py-1">Circulating</th>
                    <th className="px-2 py-1">Decimals</th>
                    <th className="px-2 py-1">Created</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(t => (
                    <tr key={t.id} className="border-t">
                      <td className="px-2 py-1 text-sm">{t.id}</td>
                      <td className="px-2 py-1 text-sm">{t.name}</td>
                      <td className="px-2 py-1 text-sm">{t.symbol}</td>
                      <td className="px-2 py-1 text-sm">{t.total_supply}</td>
                      <td className="px-2 py-1 text-sm">{t.circulating_supply}</td>
                      <td className="px-2 py-1 text-sm">{t.decimals}</td>
                      <td className="px-2 py-1 text-sm">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
