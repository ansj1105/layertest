// 📁 src/components/admin/DepositModal.jsx
import { useState } from 'react';
import axios from 'axios';

export default function DepositModal({ wallet, onClose, onDeposited }) {
  const [type, setType]     = useState('fund');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return setError('유효한 금액을 입력하세요.');
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `/api/withdrawals/wallets/${wallet.wallet_id}/deposit`,
        { type, amount },
        { withCredentials: true }
      );
      onDeposited(res.data.data);
      onClose();
      window.location.reload();
    } catch (e) {
      console.error(e);
      setError('입금 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-semibold mb-4">지갑 #{wallet.wallet_id} 입금 처리</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="mb-3">
          <label className="block mb-1">입금 구분</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="fund">펀딩 잔액</option>
            <option value="quant">양적(퀀트) 잔액</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">금액</label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? '처리 중…' : '입금'}
          </button>
        </div>
      </form>
    </div>
  );
}
