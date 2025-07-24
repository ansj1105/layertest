// 📁 src/pages/WalletPage.jsx
import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import AdvancedLoadingSpinner from '../components/AdvancedLoadingSpinner';
export default function WalletPage() {
  const { address, privateKey, setWallet } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tron/create-wallet');
      const data = await res.json();
      setWallet(data.address, data.privateKey);
    } catch (err) {
      setError('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Create Wallet</h1>
      <button
        onClick={createWallet}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        disabled={loading}
      >
        {loading ? <AdvancedLoadingSpinner text="Loading..." /> : 'Create New Wallet'}
      </button>
      {address && (
        <div className="bg-gray-50 p-4 rounded border space-y-2">
          <p><strong>📦 Address:</strong> <span className="break-all">{address}</span></p>
          <p><strong>🔐 Private Key:</strong> <span className="break-all">{privateKey}</span></p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
