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
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-4 px-0 pb-20 bg-[#f0f3f5]">
      <div className="bg-white rounded-lg shadow-lg">
        <table className="min-w-full table-fixed">
          {/* 헤더 */}
          <thead className="bg-[#1E3A3C]">
            <tr>
              <th className="w-1/2 text-left px-4 py-3 text-white">Trading pair</th>
              <th className="w-1/4 text-right px-4 py-3 text-white">Latest price</th>
              <th className="w-1/4 text-right px-4 py-3 text-white">Change(%)</th>
            </tr>
          </thead>

          {/* 바디 */}
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : coins.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  No data
                </td>
              </tr>
            ) : (
              coins.map(coin => {
                const up = coin.price_change_percentage_24h >= 0;
                return (
                  <tr key={coin.id} className="hover:bg-gray-50">
                    {/* 페어 */}
                    <td className="flex items-center space-x-2 px-4 py-3">
                      <img
                        src={coin.image}
                        alt={coin.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">
                        {coin.symbol.toUpperCase()}/USDT
                      </span>
                    </td>
                    {/* 가격 */}
                    <td className="text-right px-4 py-3">
                      <span className={`font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.current_price.toLocaleString()}
                      </span>
                    </td>
                    {/* 변동률 */}
                    <td className={`text-right px-4 py-3 ${up ? 'text-green-500' : 'text-red-500'}`}>
                      {up ? '▲' : '▼'}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
