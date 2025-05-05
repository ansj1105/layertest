import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X as CloseIcon } from 'lucide-react';

const EXCHANGES = [
  'Binance',
  'Coinbase Exchange',
  'Kraken',
  'Bitfinex',
  'Gate',
  'OKX',
  'KuCoin'
];

export default function QuantHistoryModal({ onClose }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/quanthistory', { withCredentials: true }),
      axios.get('/api/market-data')
    ])
      .then(([histRes, marketRes]) => {
        const raw = histRes.data.data || [];
        const markets = marketRes.data || [];
        const enriched = raw.map((h) => {
          const coin = markets[Math.floor(Math.random() * markets.length)];
          const symbol = coin.symbol.toUpperCase() + '/USDT';
          const buyPrice = coin.current_price;
          const totalSize = parseFloat(h.tradeAmount);
          const quantity = totalSize / buyPrice;
          const profit = parseFloat(h.profit);
          const sellPrice = buyPrice + profit / quantity;
          let buyPlatform = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
          let sellPlatform = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
          if (sellPlatform === buyPlatform) {
            sellPlatform = EXCHANGES[(EXCHANGES.indexOf(buyPlatform) + 1) % EXCHANGES.length];
          }
          return { ...h, symbol, buyPrice, sellPrice, buyPlatform, sellPlatform };
        });
        setHistory(enriched);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start pt-20 z-50">
      <div className="bg-[#2e1c10] text-yellow-100 rounded-lg w-full max-w-lg mx-4 p-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('quantTrading.history')}</h3>
          <button onClick={onClose} className="p-1 hover:text-red-400">
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center">{t('quantTrading.loading')}</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400">{t('quantTrading.noHistory')}</p>
          ) : (
            history.map(h => (
              <div key={h.id} className="mb-4 p-4 bg-[#342410] rounded">
                {/* header with symbol & status */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{h.symbol}</span>
                  <span className="text-green-400">{t('quantTrading.success')}</span>
                </div>

                {/* details grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-semibold">{t('quantTrading.position')}</div>
                    <div>{parseFloat(h.tradeAmount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.buyPlatform')}</div>
                    <div>{h.buyPlatform}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.buyPrice')}</div>
                    <div>{h.buyPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.sellPlatform')}</div>
                    <div>{h.sellPlatform}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.sellPrice')}</div>
                    <div>{h.sellPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.time')}</div>
                    <div>{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.status')}</div>
                    <div className="text-green-400">{t('quantTrading.success')}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.serviceFee')}</div>
                    {/* map service fee to profit */}
                    <div>{parseFloat(h.profit).toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.profit')}</div>
                    <div className="text-green-400">+{parseFloat(h.profit).toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{t('quantTrading.commissionRate')}</div>
                    <div>{parseFloat(h.commissionRate).toFixed(4)}%</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
