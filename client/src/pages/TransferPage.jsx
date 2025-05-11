
// ✅ 프론트: TransferPage.jsx (axios 사용)
import { useState } from 'react';
import axios from 'axios';

export default function TransferPage() {
  const [fromKey, setFromKey] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isTronAddress = (address) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);

  const sendUSDT = async () => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    if (!isTronAddress(toAddress)) {
      setError('Invalid recipient address');
      setLoading(false);
      return;
    }

    if (!fromKey || fromKey.length !== 64) {
      setError('Invalid private key');
      setLoading(false);
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

    try {
<<<<<<< HEAD
      const res = await axios.post('http://54.85.128.211:4000/api/tron/send', {
=======
      const res = await axios.post('/api/tron/send', {
>>>>>>> main
        fromPrivateKey: fromKey,
        toAddress,
        amount: parseFloat(amount),
      });

      if (res.data.txHash) {
        setTxHash(res.data.txHash);
      } else {
        throw new Error(res.data.error || 'Transaction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-purple-600">Send USDT</h1>
      <input
        type="text"
        placeholder="From Private Key"
        value={fromKey}
        onChange={(e) => setFromKey(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />
      <input
        type="text"
        placeholder="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />
      <input
        type="number"
        placeholder="Amount (USDT)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />
      <button
        onClick={sendUSDT}
        className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 w-full"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send USDT'}
      </button>
      {txHash && (
        <p className="text-green-600">✅ Sent! TX Hash: <span className="break-all">{txHash}</span></p>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
