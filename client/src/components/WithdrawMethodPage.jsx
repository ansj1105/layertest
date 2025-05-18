// 📁 src/pages/WithdrawMethodPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import '../styles/WithdrawMethodPage.css';
import '../styles/topbar.css';

export default function WithdrawMethodPage() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [addressValid, setAddressValid] = useState(null); // null | true | false
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [feeRate, setFeeRate] = useState(0);     // 관리자 설정에서 불러온 실출금 수수료율
  const [netAmount, setNetAmount] = useState(0); // 예상 수령액
  const { t } = useTranslation();
  // 1) 마운트 시 관리자 수수료율 로드
  useEffect(() => {
    axios.get("/api/withdrawals/admin/wallet-settings")
      .then(res => {
        console.log("🔍 API 응답:", res.data); // 전체 구조 확인
        const rate = parseFloat(res.data.data.real_withdraw_fee) || 0;
        console.log("💰 수수료율 로드 완료:", rate);
        setFeeRate(rate);
      })
      .catch(err => {
        console.error("❌ 수수료율 로드 실패:", err);
      });
  }, []);
  

  // 2) amount 또는 feeRate 변경 시 netAmount 다시 계산
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const fee = +(amt * feeRate).toFixed(6);
    setNetAmount(+(amt - fee).toFixed(6));
  }, [amount, feeRate]);

  // 주소 유효성 검사
  const validateAddress = async () => {
    if (!address) return setAddressValid(null);
    try {
      const res = await axios.get("/api/withdrawals/validate-address", {
        params: { address, method: "USDT" },
      });
      setAddressValid(res.data.valid);
    } catch (err) {
      console.error(err);
      setAddressValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (addressValid !== true) {
      setError("errors.invalidAddress");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("errors.invalidAmount");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/withdrawals/withdraw", {
        to_address: address,
        amount,
        method: "USDT",
      });
      setSuccess("success.submitted");
      setAddress("");
      setAmount("");
      setAddressValid(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "errors.submitFailed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="withdraw-ww-wrapper">
      <div className="withdraw-ww-header">
        <button
          onClick={() => window.history.back()}
          className="withdraw-ww-back-button"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="withdraw-title">{t("withdraw.title")}</h2>
      </div>

      <div className="withdraw-www-wrapper">
        <form onSubmit={handleSubmit} className="withdraw-ww-form">
          <div>
            <label className="withdraw-ww-label">{t("withdraw.addressLabel")}</label>
            <input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressValid(null);
              }}
              onBlur={validateAddress}
              className="withdraw-ww-input"
              placeholder={t("withdraw.addressPlaceholder")}
            />
            {addressValid === false && (
              <p className="withdraw-ww-error">{t("withdraw.invalidAddress")}</p>
            )}
            {addressValid === true && (
              <p className="withdraw-ww-success">{t("withdraw.validAddress")}</p>
            )}
          </div>

          <div>
            <label className="withdraw-ww-label">{t("withdraw.amountLabel")}</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="withdraw-ww-input"
              placeholder={t("withdraw.amountPlaceholder")}
            />
          </div>

          <div className="withdraw-ww-info">
            <p>{t("withdraw.feeRate")}: {(feeRate * 100).toFixed(2)}%</p>
            <p>{t("withdraw.estimatedFee")}: {(parseFloat(amount) * feeRate || 0).toFixed(6)} USDT</p>
            <p>{t("withdraw.netAmount")}: {netAmount.toFixed(6)} USDT</p>
          </div>

          {error && <p className="withdraw-ww-error">{t(error)}</p>}
          {success && <p className="withdraw-ww-success">{t(success)}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="withdraw-ww-button"
          >
            {submitting ? t("withdraw.submitting") : t("withdraw.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
