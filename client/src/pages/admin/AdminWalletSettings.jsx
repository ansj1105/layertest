// 📁 src/pages/admin/AdminWalletSettings.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav';

export default function AdminWalletSettings({ onLogout }) {
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'withdrawal'

  // 지갑 설정 상태
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

  // 출금 한도 설정 상태
  const [withdrawalSettings, setWithdrawalSettings] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(true);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editForm, setEditForm] = useState({
    min_amount: '',
    daily_max_amount: ''
  });

  // load current wallet settings
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/withdrawals/admin/wallet-settings', { withCredentials: true });
      const data = res.data.data || {};
      setSettings(data);
      setForm({
        deposit_fee_rate: data.deposit_fee_rate ?? '',
        withdraw_fee_rate: data.withdraw_fee_rate ?? '',
        real_withdraw_fee: data.real_withdraw_fee ?? '',
        auto_approve: data.auto_approve || 'auto',
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

  // load withdrawal settings
  const fetchWithdrawalSettings = async () => {
    try {
      const res = await axios.get('/api/withdrawals/admin/withdrawals-settings', { withCredentials: true });
      setWithdrawalSettings(res.data.data || []);
    } catch (err) {
      console.error('출금 설정 로드 실패', err);
      alert('출금 설정 로드 중 오류가 발생했습니다.');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchWithdrawalSettings();
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
          deposit_fee_rate: parseFloat(form.deposit_fee_rate),
          withdraw_fee_rate: parseFloat(form.withdraw_fee_rate),
          real_withdraw_fee: parseFloat(form.real_withdraw_fee),
          auto_approve: form.auto_approve,
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

  // 출금 설정 관련 함수들
  const handleEditClick = (setting) => {
    setEditingLevel(setting.level);
    setEditForm({
      min_amount: setting.min_amount.toString(),
      daily_max_amount: setting.daily_max_amount.toString()
    });
  };

  const handleEditCancel = () => {
    setEditingLevel(null);
    setEditForm({ min_amount: '', daily_max_amount: '' });
  };

  const handleEditSubmit = async () => {
    setWithdrawalSaving(true);
    try {
      await axios.put(
        `/api/withdrawals/admin/withdrawals-settings/${editingLevel}`,
        {
          min_amount: parseFloat(editForm.min_amount),
          daily_max_amount: parseFloat(editForm.daily_max_amount)
        },
        { withCredentials: true }
      );
      alert('출금 설정이 성공적으로 수정되었습니다.');
      setEditingLevel(null);
      setEditForm({ min_amount: '', daily_max_amount: '' });
      fetchWithdrawalSettings();
    } catch (err) {
      console.error('출금 설정 수정 실패', err);
      alert('출금 설정 수정 중 오류: ' + (err.response?.data?.error || err.message));
    } finally {
      setWithdrawalSaving(false);
    }
  };

  const handleAddSetting = async () => {
    const level = prompt('VIP 레벨을 입력하세요 (1-10):');
    if (!level) return;

    const minAmount = prompt('최소 출금 금액을 입력하세요:');
    if (!minAmount) return;

    const maxAmount = prompt('일일 최대 출금 금액을 입력하세요:');
    if (!maxAmount) return;

    setWithdrawalSaving(true);
    try {
      await axios.post(
        '/api/withdrawals/admin/withdrawals-settings',
        {
          level: parseInt(level),
          min_amount: parseFloat(minAmount),
          daily_max_amount: parseFloat(maxAmount)
        },
        { withCredentials: true }
      );
      alert('출금 설정이 성공적으로 추가되었습니다.');
      fetchWithdrawalSettings();
    } catch (err) {
      console.error('출금 설정 추가 실패', err);
      alert('출금 설정 추가 중 오류: ' + (err.response?.data?.error || err.message));
    } finally {
      setWithdrawalSaving(false);
    }
  };

  const handleDeleteSetting = async (level) => {
    if (!confirm(`VIP 레벨 ${level}의 출금 설정을 삭제하시겠습니까?`)) return;

    setWithdrawalSaving(true);
    try {
      await axios.delete(
        `/api/withdrawals/admin/withdrawals-settings/${level}`,
        { withCredentials: true }
      );
      alert('출금 설정이 성공적으로 삭제되었습니다.');
      fetchWithdrawalSettings();
    } catch (err) {
      console.error('출금 설정 삭제 실패', err);
      alert('출금 설정 삭제 중 오류: ' + (err.response?.data?.error || err.message));
    } finally {
      setWithdrawalSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AdminNav onLogout={onLogout} />
      <div className="flex-1 ml-64 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">⚙️ 설정 관리</h1>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'wallet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                지갑 설정 관리
              </button>
              <button
                onClick={() => setActiveTab('withdrawal')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'withdrawal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                출금 한도 설정 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 지갑 설정 탭 */}
        {activeTab === 'wallet' && (
          <div>
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
        )}

        {/* 출금 한도 설정 탭 */}
        {activeTab === 'withdrawal' && (
          <div>
            {withdrawalLoading ? (
              <p>로딩 중…</p>
            ) : (
              <div className="bg-white shadow rounded p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">VIP 등급별 출금 한도 설정</h2>
                  <button
                    onClick={handleAddSetting}
                    disabled={withdrawalSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    + 새 설정 추가
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VIP 레벨
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          최소 출금 금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          일일 최대 출금 금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수정일시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {withdrawalSettings.map((setting) => (
                        <tr key={setting.level}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            VIP {setting.level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingLevel === setting.level ? (
                              <input
                                type="number"
                                step="0.000001"
                                value={editForm.min_amount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, min_amount: e.target.value }))}
                                className="w-24 border px-2 py-1 rounded text-sm"
                              />
                            ) : (
                              parseFloat(setting.min_amount).toFixed(6)
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingLevel === setting.level ? (
                              <input
                                type="number"
                                step="0.000001"
                                value={editForm.daily_max_amount}
                                onChange={(e) => setEditForm(prev => ({ ...prev, daily_max_amount: e.target.value }))}
                                className="w-24 border px-2 py-1 rounded text-sm"
                              />
                            ) : (
                              parseFloat(setting.daily_max_amount).toFixed(6)
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(setting.updated_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingLevel === setting.level ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleEditSubmit}
                                  disabled={withdrawalSaving}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditClick(setting)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteSetting(setting.level)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
