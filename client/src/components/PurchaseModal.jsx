// 📁 src/components/PurchaseModal.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function PurchaseModal({ sale, walletBalance, onClose, onPurchased }) {
  const { t } = useTranslation();

  const minAmount = sale.minimum_purchase;
  const maxAmount = sale.maximum_purchase || sale.remaining_supply;
  const pricePer  = sale.price; // USDT

  // 수량 상태
  const [quantity, setQuantity] = useState(minAmount);
  const [error, setError]       = useState('');
  const [inputValue, setInputValue] = useState(String(minAmount));
  // 전체 비용
  const totalCost = +(pricePer * quantity).toFixed(6);

  // 유효성 검사
  const validate = (q = quantity) => {
    if (q < minAmount) {
      setError(t('tokenPurchase.errors.belowMin', { min: minAmount }));
      return false;
    }
    if (q > maxAmount) {
      setError(t('tokenPurchase.errors.aboveMax', { max: maxAmount }));
      return false;
    }
    if (pricePer * q > walletBalance) {
      setError(t('tokenPurchase.errors.insufficientFunds'));
      return false;
    }
    setError('');
    return true;
  };

  // 수량이 바뀔 때마다 검사
  useEffect(() => {
    validate();
  }, [quantity]);
    // 입력 중에는 그대로 문자열을 받아두고
   
    const handleSetMax = () => {
      setQuantity(maxAmount);
      setInputValue(String(maxAmount));
      setError('');
    };
    // 숫자 입력칸 onChange
    const handleQuantityChange = e => {
      setInputValue(e.target.value);
    };
      // 포커스가 나갈 때 (또는 Enter 누를 때) 값 보정
    const handleQuantityBlur = () => {
      let v = parseFloat(inputValue);
      if (isNaN(v)) v = minAmount;
      v = Math.max(minAmount, Math.min(maxAmount, v));
      setQuantity(v);
      setInputValue(String(v));
   };
  
    // 슬라이더 onChange: 즉시 quantity, inputValue 동기화
    const handleSliderChange = e => {
      const v = +e.target.value;
      setQuantity(v);
      setInputValue(String(v));
    };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await axios.post(
        '/api/token/purchase-token',
        { saleId: sale.id, amount: quantity },
        { withCredentials: true }
      );
      onPurchased();
      onClose();
      alert(t('tokenPurchase.purchaseSuccess'));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || t('tokenPurchase.errors.purchaseFail'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-[#2c1f0f] text-yellow-100 rounded-lg w-11/12 max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-yellow-300 hover:text-yellow-100"
        >✕</button>

        {/* 1. 토큰당 가격 */}
        <div className="mb-2 text-sm text-gray-300">
          1 {t('tokenPurchase.token')} = <strong className="text-yellow-100">{pricePer.toFixed(6)} USDT</strong>
        </div>

        <h3 className="text-xl font-bold mb-4">
          {sale.name} {t('tokenPurchase.phase')}
        </h3>

        {/* 숫자 입력박스 + Max 버튼 */}
        <div className="mb-4 relative">
          <label className="block text-sm mb-1">{t('tokenPurchase.quantity')}</label>
          <input
            type="number"
            className="w-full bg-[#1a1109] p-2 rounded text-yellow-100 pr-16"
            min={minAmount}
            max={maxAmount}
            step="1"
            value={inputValue}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
          />
          <button
            type="button"
            onClick={handleSetMax}
            className="absolute right-2 top-8 bg-yellow-600 hover:bg-yellow-700 text-black px-2 py-1 rounded text-sm"
          >
            {t('tokenPurchase.maxAll', { max: maxAmount })}
          </button>
        </div>

        {/* 슬라이더 */}
        <div className="mb-4">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step="1"
            value={quantity}
            onChange={handleSliderChange}
            className="w-full"
          />
        </div>

        {/* 수량·범위 */}
        <div className="flex justify-between text-sm mb-2 text-gray-300">
          <span>{t('tokenPurchase.min')}: {minAmount}</span>
          <span>{t('tokenPurchase.selected')}: {quantity}</span>
          <span>{t('tokenPurchase.max')}: {maxAmount}</span>
        </div>

        {/* 총 비용 */}
        <div className="mb-2 text-sm">
          {t('tokenPurchase.totalCost')}: <span className="text-yellow-100">{totalCost} USDT</span>
        </div>

        {/* 잔액 */}
        <div className="mb-4 text-sm">
          {t('tokenPurchase.yourBalance')}: <span className="text-yellow-100">{walletBalance.toFixed(6)} USDT</span>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!!error}
          className={`w-full py-2 rounded font-semibold 
            ${error ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-600'}`}
        >
          {t('tokenPurchase.buy')}
        </button>
      </div>
    </div>
  );
}
