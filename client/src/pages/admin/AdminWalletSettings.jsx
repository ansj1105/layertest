import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function AdminWalletSettings({ onLogout }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    deposit_fee_rate: '',
    withdraw_fee_rate: '',
    auto_approve: 'auto'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/wallet/admin/wallet-settings', { withCredentials: true });
      setSettings(res.data.data);
      setForm({
        deposit_fee_rate: res.data.data.deposit_fee_rate,
        withdraw_fee_rate: res.data.data.withdraw_fee_rate,
        auto_approve: res.data.data.auto_approve
      });
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.put('/api/wallet/admin/wallet-settings', form, { withCredentials: true });
      await fetchSettings();
      alert('Settings updated successfully');
    } catch (err) {
      console.error('Failed to update settings', err);
      alert('Error updating settings: ' + err.response?.data?.error || err.message);
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
          <p>Loading...</p>
        ) : (
          <div className="bg-white shadow rounded p-6 max-w-md">
            <div className="mb-4">
              <label className="block mb-1 font-medium">입금 수수료율 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.deposit_fee_rate}
                onChange={e => handleChange('deposit_fee_rate', parseFloat(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">출금 수수료율 (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.withdraw_fee_rate}
                onChange={e => handleChange('withdraw_fee_rate', parseFloat(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">자동 승인 모드</label>
              <select
                value={form.auto_approve}
                onChange={e => handleChange('auto_approve', e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
