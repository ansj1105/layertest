// ✅ 프론트: BalancePage.jsx (axios 사용)
import { useState } from 'react';
import axios from 'axios';

export default function BalancePage() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValidTronAddress = (addr) => {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr);
  };

  const checkBalance = async () => {
    const cleanAddress = address.trim();
    if (!isValidTronAddress(cleanAddress)) {
      setError('Invalid TRON address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:4000/api/get-balance`, {
        params: { address: cleanAddress },
      });
      setBalance(res.data.usdt);
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-green-600">Check USDT Balance</h1>

      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />

      <button
        onClick={checkBalance}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        disabled={loading || !address}
      >
        {loading ? 'Checking...' : 'Check Balance'}
      </button>

      {balance !== null && (
        <p className="text-lg">
          <strong>💰 USDT Balance:</strong> {balance}
        </p>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}