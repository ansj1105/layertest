// 📁 src/components/CoinList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import '../styles/MainLanding.css';

export default function CoinList() {
  const { t } = useTranslation();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await axios.get('/api/market-data');
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
    <div className="v-main-bottom-list-one">
      <div className="v-main-bottom-list-one-box">
        
        {/* 헤더 */}
        <div className="v-main-bottom-list-one-head">
          <div className="v-main-bottom-list-one-head-item-name">{t('coin_list.trading_pair')}</div>
          <div className="v-main-bottom-list-one-head-item-price">{t('coin_list.latest_price')}</div>
          <div className="v-main-bottom-list-one-head-item-zhangfu">{t('coin_list.change_percent')}</div>
        </div>

        {/* 바디 */}
        {loading ? (
          <div className="text-center py-6 text-gray-500">{t('common.loading')}</div>
        ) : coins.length === 0 ? (
          <div className="text-center py-6 text-gray-500">{t('common.no_data')}</div>
        ) : (
          coins.map(coin => {
            const up = coin.price_change_percentage_24h >= 0;
            return (
              <div key={coin.id} className="v-main-bottom-list-one-item">
                {/* 코인 이미지 + 이름 */}
                <div className="g-flex-align-center">
                  <div className="v-main-bottom-list-one-item-img">
                    <img src={coin.image} alt={coin.symbol} />
                  </div>
                  <span>{coin.symbol.toUpperCase()}/ USDT</span>
                </div>

                {/* 가격 */}
                <div className="g-flex-justify-end">
                  <span className={up ? 'g-up' : 'g-down'}>
                    {coin.current_price.toLocaleString()}
                  </span>
                </div>

                {/* 변동률 */}
                <div className="g-flex-justify-center11">
                  <span className={up ? 'g-bg-font-color-up' : 'g-bg-font-color-down'}>
                    {up ? '▲' : '▼'}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
