// 📁 src/components/PurchaseModal.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/TokenPurchasePage.css';
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
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="modal-close-btn">
          ✕
        </button>

        {/* 제목 */}
        <h3 className="modal-title">
          {sale.name} {t("tokenPurchase.phase")}
        </h3>

        {/* 1. 토큰당 가격 */}
        <div className="modal-price-info">
          1 {t("tokenPurchase.token")} ={" "}
          <strong className="text-highlight">{pricePer.toFixed(6)} USDT</strong>
        </div>



        {/* 입력박스 */}
        <div className="modal-input-group">
          <label className="modal-label">{t("tokenPurchase.quantity")}</label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              className="modal-input"
              min={minAmount}
              max={maxAmount}
              step="1"
              value={inputValue}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
            />
            <button
              type="button"
              className="modal-max-btn"
              onClick={handleSetMax}
            >
              {t("tokenPurchase.maxAll", { max: maxAmount })}
            </button>
          </div>
        </div>

        {/* 슬라이더 */}
        <div className="modal-slider-group">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step="1"
            value={quantity}
            onChange={handleSliderChange}
            className="modal-slider"
          />
        </div>

        {/* 수량/범위 */}
        <div className="modal-range-info">
          <span>{t("tokenPurchase.min")}: {minAmount}</span>
          <span>{t("tokenPurchase.selected")}: {quantity}</span>
          <span>{t("tokenPurchase.max")}: {maxAmount}</span>
        </div>

        {/* 총 비용 */}
        <div className="modal-summary">
          {t("tokenPurchase.totalCost")}: <span className="text-highlight">{totalCost} USDT</span>
        </div>

        {/* 잔액 */}
        <div className="modal-summary mb">
          {t("tokenPurchase.yourBalance")}: <span className="text-highlight">{walletBalance.toFixed(6)} USDT</span>
        </div>

        {/* 에러 */}
        {error && <p className="modal-error">{error}</p>}

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!!error}
          className={`modal-submit-btn ${error ? "disabled" : "enabled"}`}
        >
          {t("tokenPurchase.buy")}
        </button>
      </div>
    </div>
  );
}
