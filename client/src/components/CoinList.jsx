// 📁 src/components/CoinList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CoinList() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/market-data');
        setCoins(res.data);
      } catch (err) {
        console.error("❌ Coin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // 60초마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md w-full bg-gray-900 text-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">📈 Market Price</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <ul className="space-y-3">
          {coins.map((coin) => (
            <li
              key={coin.id}
              className="flex justify-between items-center px-2 py-2 bg-gray-800 rounded"
            >
    <div className="flex items-center space-x-2">
  <img src={coin.image} alt={coin.name} className="w-[27px] h-[27px]" />
  <span className="font-semibold">{coin.symbol.toUpperCase()}/USDT</span>
</div>
<div className="text-right">
  <div>${coin.current_price.toLocaleString()}</div>
  <div className={coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
    {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}
    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
  </div>
  {/* 아래처럼 숨겨서 Tailwind에게 사용 중임을 알려줘도 됨 */}
<div className="hidden text-green-400 text-red-400" />
</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
