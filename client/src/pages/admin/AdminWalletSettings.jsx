// 📁 src/pages/admin/AdminWalletSettings.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function AdminWalletSettings({ onLogout }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    deposit_fee_rate: '',
    withdraw_fee_rate: '',
    real_withdraw_fee: '',
    auto_approve: 'auto',
    token_to_quant_rate: '',
    minimum_deposit_amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // load current settings
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/withdrawals/admin/wallet-settings', { withCredentials: true });
      const data = res.data.data || {};
      setSettings(data);
      setForm({
        deposit_fee_rate:    data.deposit_fee_rate ?? '',
        withdraw_fee_rate:   data.withdraw_fee_rate ?? '',
        real_withdraw_fee:   data.real_withdraw_fee ?? '',
        auto_approve:        data.auto_approve || 'auto',
        token_to_quant_rate: data.token_to_quant_rate ?? '',
        minimum_deposit_amount: data.minimum_deposit_amount ?? ''
      });
    } catch (err) {
      console.error('설정 로드 실패', err);
      alert('설정 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.put(
        '/api/withdrawals/admin/wallet-settings',
        {
          deposit_fee_rate:    parseFloat(form.deposit_fee_rate),
          withdraw_fee_rate:   parseFloat(form.withdraw_fee_rate),
          real_withdraw_fee:   parseFloat(form.real_withdraw_fee),
          auto_approve:        form.auto_approve,
          token_to_quant_rate: parseFloat(form.token_to_quant_rate),
          minimum_deposit_amount: parseFloat(form.minimum_deposit_amount)
        },
        { withCredentials: true }
      );
      alert('설정이 성공적으로 저장되었습니다.');
      fetchSettings();
    } catch (err) {
      console.error('설정 저장 실패', err);
      alert('설정 저장 중 오류: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">⚙️ 지갑 설정 관리</h1>

        {loading ? (
          <p>로딩 중…</p>
        ) : (
          <div className="bg-white shadow rounded p-6 max-w-md">
            {/* deposit fee */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">입금 수수료율 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.deposit_fee_rate}
                onChange={e => handleChange('deposit_fee_rate', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* minimum deposit amount */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">최소 입금액</label>
              <input
                type="number"
                step="0.01"
                value={form.minimum_deposit_amount}
                onChange={e => handleChange('minimum_deposit_amount', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* withdraw fee */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">출금 수수료율 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.withdraw_fee_rate}
                onChange={e => handleChange('withdraw_fee_rate', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* real withdraw fee */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">실제 출금 수수료율</label>
              <input
                type="number"
                step="0.0001"
                value={form.real_withdraw_fee}
                onChange={e => handleChange('real_withdraw_fee', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              <p className="text-sm text-gray-500 mt-1">
                예: 0.0050 = 0.5%
              </p>
            </div>

            {/* token to quant rate */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">토큰 → 정량 환율</label>
              <input
                type="number"
                step="0.000001"
                value={form.token_to_quant_rate}
                onChange={e => handleChange('token_to_quant_rate', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              <p className="text-sm text-gray-500 mt-1">
                예: 1.25
              </p>
            </div>

            {/* auto approve */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">레퍼럴 승인 모드</label>
              <select
                value={form.auto_approve}
                onChange={e => handleChange('auto_approve', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="auto">자동</option>
                <option value="manual">수동</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
            >
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
