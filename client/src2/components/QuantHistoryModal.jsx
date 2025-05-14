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
    <div className="history-modal-overlay">
    <div className="history-modal-box">
      <div className="history-modal-header">
        <h3 className="history-modal-title">{t('quantTrading.history')}</h3>
        <button onClick={onClose} className="history-modal-close">
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="history-modal-scroll">
        {loading ? (
          <p className="text-center">{t('quantTrading.loading')}</p>
        ) : history.length === 0 ? (
          <p className="text-center" style={{ color: '#9ca3af' }}>{t('quantTrading.noHistory')}</p>
        ) : (
          history.map(h => (
            <div key={h.id} className="history-card">
              <div className="history-card-header">
                <span className="history-label">{h.symbol}</span>
                <span className="history-success">{t('quantTrading.success')}</span>
              </div>

              <div className="history-card-grid">
                <div>
                  <div className="history-label">{t('quantTrading.position')}</div>
                  <div>{parseFloat(h.tradeAmount).toFixed(2)}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.buyPlatform')}</div>
                  <div>{h.buyPlatform}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.buyPrice')}</div>
                  <div>{h.buyPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.sellPlatform')}</div>
                  <div>{h.sellPlatform}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.sellPrice')}</div>
                  <div>{h.sellPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.time')}</div>
                  <div>{new Date(h.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.status')}</div>
                  <div className="history-success">{t('quantTrading.success')}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.serviceFee')}</div>
                  <div>{parseFloat(h.profit).toFixed(6)}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.profit')}</div>
                  <div className="history-profit">+{parseFloat(h.profit).toFixed(6)}</div>
                </div>
                <div>
                  <div className="history-label">{t('quantTrading.commissionRate')}</div>
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
