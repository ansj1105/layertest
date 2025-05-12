// 📁 src/pages/admin/TokenSalesAdminPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function TokenSalesAdminPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'purchases'
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [tokensList, setTokensList] = useState([]);     // 토큰 목록
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: '', token_id: '', name: '',
    total_supply: '', price: '', fee_rate: '',
    start_time: '', end_time: '',
    is_active: false, minimum_purchase: '',
    maximum_purchase: '', lockup_period: ''
  });
  const [editing, setEditing] = useState(false);

  // 선택된 토큰
  const selectedToken = tokensList.find(t => t.id === form.token_id);

  // 유효성 검사
  const validateForm = () => {
    if (!form.token_id) {
      alert('토큰을 선택해주세요.');
      return false;
    }
    const remaining = selectedToken
      ? selectedToken.total_supply - selectedToken.circulating_supply
      : 0;
    if (parseFloat(form.total_supply) > remaining) {
      alert(`총공급량은 최대 ${remaining.toLocaleString()} 이내여야 합니다.`);
      return false;
    }
    if (!form.name.trim()) {
      alert('Sale 이름을 입력해주세요.');
      return false;
    }
    if (!(parseFloat(form.price) > 0)) {
      alert('가격은 0보다 커야 합니다.');
      return false;
    }
    if (form.start_time >= form.end_time) {
      alert('시작 시간이 종료 시간보다 이전이어야 합니다.');
      return false;
    }
    // 추가 검증: 수수료율
    const fee = parseFloat(form.fee_rate);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      alert('수수료율은 0~100 사이여야 합니다.');
      return false;
    }
    return true;
  };

  // 1) fetch 함수 분리
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/token/token-sales');
      setSales(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/token/token-purchases');
      setPurchases(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 토큰 목록 한 번만 로드
  useEffect(() => {
    axios.get('/api/admin/tokens')
      .then(res => setTokensList(res.data.data || []))
      .catch(console.error);
  }, []);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSales();
    } else {
      fetchPurchases();
    }
  }, [activeTab]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setForm({
      id: '', token_id: '', name: '',
      total_supply: '', price: '', fee_rate: '',
      start_time: '', end_time: '',
      is_active: false, minimum_purchase: '', maximum_purchase: '', lockup_period: ''
    });
    setEditing(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      token_id:         form.token_id,
      name:             form.name,
      total_supply:     parseFloat(form.total_supply),
      price:            parseFloat(form.price),
      fee_rate:         parseFloat(form.fee_rate),
      start_time:       form.start_time,
      end_time:         form.end_time,
      is_active:        form.is_active,
      minimum_purchase: parseFloat(form.minimum_purchase),
      maximum_purchase: form.maximum_purchase ? parseFloat(form.maximum_purchase) : null,
      lockup_period:    parseInt(form.lockup_period, 10),
    };

    try {
      if (editing) {
        await axios.put(`/api/token/token-sales/${form.id}`, payload);
      } else {
        await axios.post('/api/token/token-sales', payload);
      }
      resetForm();
      await fetchSales();  // 데이터 갱신
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handleEdit = sale => {
    const fmt = dt => dt?.replace(' ', 'T').slice(0,16) || '';
    setForm({
      ...sale,
      total_supply: sale.total_supply,
      price: sale.price,
      fee_rate: sale.fee_rate,
      start_time: fmt(sale.start_time),
      end_time:   fmt(sale.end_time),
      is_active:  !!sale.is_active,
      minimum_purchase: sale.minimum_purchase,
      maximum_purchase: sale.maximum_purchase,
      lockup_period:    sale.lockup_period
    });
    setEditing(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/token/token-sales/${id}`);
      await fetchSales();  // 데이터 갱신
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav onLogout={onLogout} />
      <div className="ml-64 p-6 w-full space-y-6">
        <h1 className="text-2xl font-bold">Token Sales 관리</h1>

        {/* 탭 */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab==='sales' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={()=>setActiveTab('sales')}
          >Sales 관리</button>
          <button
            className={`px-4 py-2 rounded ${activeTab==='purchases' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={()=>setActiveTab('purchases')}
          >구매내역</button>
        </div>

        {/* Sales 관리 폼 */}
        {activeTab==='sales' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">{editing ? '수정' : '신규 등록'} 폼</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

                {/* 토큰 선택 */}
                <div className="col-span-2">
                  <label className="block mb-1 font-medium">Token</label>
                  <select
                    name="token_id"
                    value={form.token_id}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="" disabled>
                      {tokensList.length ? '토큰 선택...' : '로딩 중...'}
                    </option>
                    {tokensList.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 선택된 토큰 정보 및 최대 가능 공급량 */}
                {selectedToken && (
                  <div className="col-span-2 bg-gray-50 p-3 rounded border">
                    <p><strong>Name:</strong> {selectedToken.name} ({selectedToken.symbol})</p>
                    <p><strong>Total:</strong> {selectedToken.total_supply.toLocaleString()}</p>
                    <p><strong>Circulating:</strong> {selectedToken.circulating_supply.toLocaleString()}</p>
                    <p className="mt-2">
                      <strong>Max Available for Sale:</strong>{' '}
                      {(selectedToken.total_supply - selectedToken.circulating_supply).toLocaleString()}
                    </p>
                    <p className="mt-2"><strong>Description:</strong> {selectedToken.description || '—'}</p>
                  </div>
                )}

                {/* Sales 입력 필드 */}
                <input name="name"            value={form.name}            onChange={handleChange} placeholder="Sale 이름"            className="border p-2 rounded" />
                <input name="total_supply"    value={form.total_supply}    onChange={handleChange} placeholder="총 공급량"     type="number" className="border p-2 rounded" />
                <input name="price"           value={form.price}           onChange={handleChange} placeholder="가격"           type="number" className="border p-2 rounded" />
                <input name="fee_rate"        value={form.fee_rate}        onChange={handleChange} placeholder="수수료율(%)"   type="number" className="border p-2 rounded" />
                <input name="start_time"      value={form.start_time}      onChange={handleChange} placeholder="시작 시간"     type="datetime-local" className="border p-2 rounded" />
                <input name="end_time"        value={form.end_time}        onChange={handleChange} placeholder="종료 시간"     type="datetime-local" className="border p-2 rounded" />

                <div className="flex items-center">
                  <label className="mr-2">Active</label>
                  <input name="is_active" checked={form.is_active} onChange={handleChange} type="checkbox" />
                </div>
                <input name="minimum_purchase"  value={form.minimum_purchase} onChange={handleChange} placeholder="최소 구매량"   type="number" className="border p-2 rounded" />
                <input name="maximum_purchase"  value={form.maximum_purchase} onChange={handleChange} placeholder="최대 구매량"   type="number" className="border p-2 rounded" />
                <input name="lockup_period"     value={form.lockup_period}    onChange={handleChange} placeholder="락업 기간(일)" type="number" className="border p-2 rounded" />

                <div className="col-span-2 flex space-x-2 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editing ? '수정 저장' : '등록'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">
                    초기화
                  </button>
                </div>
              </form>
            </div>

            {/* Sales 목록 */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Token Sales 목록</h2>
              {loading
                ? <p>로딩 중...</p>
                : (
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-2 py-1">ID</th>
                        <th className="px-2 py-1">Name</th>
                        <th className="px-2 py-1">Total</th>
                        <th className="px-2 py-1">Remaining</th>
                        <th className="px-2 py-1">Price</th>
                        <th className="px-2 py-1">Start</th>
                        <th className="px-2 py-1">End</th>
                        <th className="px-2 py-1">Active</th>
                        <th className="px-2 py-1">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(s => (
                        <tr key={s.id} className="border-t">
                          <td className="px-2 py-1 text-sm">{s.id}</td>
                          <td className="px-2 py-1 text-sm">{s.name}</td>
                          <td className="px-2 py-1 text-sm">{s.total_supply}</td>
                          <td className="px-2 py-1 text-sm">{s.remaining_supply}</td>
                          <td className="px-2 py-1 text-sm">{s.price}</td>
                          <td className="px-2 py-1 text-sm">{new Date(s.start_time).toLocaleString()}</td>
                          <td className="px-2 py-1 text-sm">{new Date(s.end_time).toLocaleString()}</td>
                          <td className="px-2 py-1 text-sm">{s.is_active ? 'Yes' : 'No'}</td>
                          <td className="px-2 py-1 space-x-2">
                            <button onClick={() => handleEdit(s)} className="text-blue-600">수정</button>
                            <button onClick={() => handleDelete(s.id)} className="text-red-600">삭제</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        )}

        {/* 구매내역 탭 */}
        {activeTab==='purchases' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">전체 주문 목록</h2>
            {loading
              ? <p>로딩 중...</p>
              : (
                <div className="overflow-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-2 py-1">ID</th>
                        <th className="px-2 py-1">User</th>
                        <th className="px-2 py-1">Token</th>
                        <th className="px-2 py-1">Sale</th>
                        <th className="px-2 py-1">Amount</th>
                        <th className="px-2 py-1">Total Price</th>
                        <th className="px-2 py-1">Status</th>
                        <th className="px-2 py-1">Lockup Until</th>
                        <th className="px-2 py-1">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(p => (
                        <tr key={p.id} className="border-t">
                          <td className="px-2 py-1 text-sm">{p.id}</td>
                          <td className="px-2 py-1 text-sm">{p.user_id}</td>
                          <td className="px-2 py-1 text-sm">{p.token_id}</td>
                          <td className="px-2 py-1 text-sm">{p.sale_id}</td>
                          <td className="px-2 py-1 text-sm">{p.amount}</td>
                          <td className="px-2 py-1 text-sm">{p.total_price}</td>
                          <td className="px-2 py-1 text-sm">{p.status}</td>
                          <td className="px-2 py-1 text-sm">{p.lockup_until ? new Date(p.lockup_until).toLocaleString() : ''}</td>
                          <td className="px-2 py-1 text-sm">{new Date(p.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
