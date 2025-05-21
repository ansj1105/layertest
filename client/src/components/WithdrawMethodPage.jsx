// 📁 src/pages/WithdrawMethodPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
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
  const [showKeypad, setShowKeypad] = useState(false);
  const [tradePassword, setTradePassword] = useState("");
  const [hasTradePassword, setHasTradePassword] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newTradePassword, setNewTradePassword] = useState("");
  const [confirmTradePassword, setConfirmTradePassword] = useState("");
  const [setupError, setSetupError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [feeRate, setFeeRate] = useState(0);     // 관리자 설정에서 불러온 실출금 수수료율
  const [netAmount, setNetAmount] = useState(0); // 예상 수령액
  const { t } = useTranslation();
  // 1) 마운트 시 관리자 수수료율 로드
  useEffect(() => {
    axios.get("/api/withdrawals/admin/wallet-settings")
      .then(res => {
        console.log("🔍 API 응답:", res.data);
        const rate = parseFloat(res.data.data.real_withdraw_fee) || 0;
        console.log("💰 수수료율 로드 완료:", rate);
        setFeeRate(rate);
      })
      .catch(err => {
        console.error("❌ 수수료율 로드 실패:", err);
      });
  }, []);
  
  // 거래 비밀번호 설정 여부 확인
  useEffect(() => {
    const checkTradePassword = async () => {
      try {
        const response = await axios.get("/api/withdrawals/verify-trade-password");
        setHasTradePassword(response.data.success);
      } catch (err) {
        console.error("거래 비밀번호 확인 실패:", err);
        setHasTradePassword(false);
      }
    };
    checkTradePassword();
  }, []);

  // 2) amount 또는 feeRate 변경 시 netAmount 다시 계산
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const fee = +(amt * feeRate).toFixed(6);
    setNetAmount(+(amt - fee).toFixed(6));
  }, [amount, feeRate]);

  // 현재 잔액 조회
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get("/api/wallet/finance-summary");
        if (response.data.success) {
          setCurrentBalance(response.data.data.quantBalance);
        }
      } catch (err) {
        console.error("❌ 잔액 조회 실패:", err);
      }
    };
    fetchBalance();
  }, []);

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

    if (!hasTradePassword) {
      setError("errors.noTradePassword");
      setShowSetupModal(true);
      return;
    }

    setShowKeypad(true);
  };

  const handleKeypadSubmit = async () => {
    if (!tradePassword) {
      setError("errors.tradePasswordRequired");
      return;
    }

    setSubmitting(true);
    try {
      // 1) 거래 비밀번호 확인
      const verifyResponse = await axios.post("/api/withdrawals/verify-trade-password", {
        trade_password: tradePassword
      });

      if (!verifyResponse.data.success) {
        throw new Error('Invalid trade password');
      }

      // 2) 출금 요청
      await axios.post("/api/withdrawals/withdraw", {
        to_address: address,
        amount,
        method: "USDT",
      });

      setSuccess("success.submitted");
      setAddress("");
      setAmount("");
      setAddressValid(null);
      setTradePassword("");
      setShowKeypad(false);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === 'Invalid trade password' || err.message === 'Invalid trade password') {
        setError("errors.invalidTradePassword");
      } else {
        setError(err.response?.data?.error || "errors.submitFailed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupTradePassword = async () => {
    setSetupError("");
    
    if (!newTradePassword || !confirmTradePassword) {
      setSetupError("errors.passwordRequired");
      return;
    }

    if (newTradePassword.length < 6) {
      setSetupError("errors.passwordTooShort");
      return;
    }

    if (newTradePassword !== confirmTradePassword) {
      setSetupError("errors.passwordMismatch");
      return;
    }

    try {
      const response = await axios.post("/api/withdrawals/set-trade-password", {
        trade_password: newTradePassword
      });
      
      if (response.data.success) {
        setHasTradePassword(true);
        setShowSetupModal(false);
        setNewTradePassword("");
        setConfirmTradePassword("");
        setSuccess("success.tradePasswordSet");
      } else {
        throw new Error('Failed to set trade password');
      }
    } catch (err) {
      console.error(err);
      setSetupError(err.response?.data?.error || "errors.setupFailed");
    }
  };

  const renderKeypad = () => {
    if (!showKeypad) return null;

    return (
      <div className="keypad-overlay">
        <div className="keypad-container">
          <h3>{t("withdraw.enterTradePassword")}</h3>
          <div className="password-input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              value={tradePassword}
              onChange={(e) => setTradePassword(e.target.value)}
              className="keypad-input"
              placeholder={t("withdraw.tradePasswordPlaceholder")}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          <div className="keypad-buttons">
            <button
              onClick={() => {
                setShowKeypad(false);
                setTradePassword("");
                setShowNewPassword(false);
              }}
              className="keypad-cancel"
            >
              {t("withdraw.cancel")}
            </button>
            <button
              onClick={handleKeypadSubmit}
              disabled={submitting}
              className="keypad-submit"
            >
              {submitting ? t("withdraw.submitting") : t("withdraw.confirm")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSetupModal = () => {
    if (!showSetupModal) return null;

    return (
      <div className="keypad-overlay">
        <div className="keypad-container">
          <h3>{t("withdraw.setupTradePassword")}</h3>
          <div className="password-input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newTradePassword}
              onChange={(e) => setNewTradePassword(e.target.value)}
              className="keypad-input"
              placeholder={t("withdraw.newTradePassword")}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmTradePassword}
              onChange={(e) => setConfirmTradePassword(e.target.value)}
              className="keypad-input"
              placeholder={t("withdraw.confirmTradePassword")}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          {setupError && <p className="withdraw-ww-error">{t(setupError)}</p>}
          <div className="keypad-buttons">
            <button
              onClick={() => setShowSetupModal(false)}
              className="keypad-cancel"
            >
              {t("withdraw.cancel")}
            </button>
            <button
              onClick={handleSetupTradePassword}
              className="keypad-submit"
            >
              {t("withdraw.setup")}
            </button>
          </div>
        </div>
      </div>
    );
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
          <div className="withdraw-ww-input-container">
            {!hasTradePassword && (
              <div className="withdraw-ww-warning">
                <p>{t("withdraw.setTradePasswordFirst")}</p>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(true)}
                  className="withdraw-ww-setup-button"
                >
                  {t("withdraw.setupTradePassword")}
                </button>
              </div>
            )}

            {hasTradePassword && (
              <div className="withdraw-ww-info-box">
                <p>{t("withdraw.tradePasswordSet")}</p>
                <button
                  type="button"
                  disabled={true}
                  className="withdraw-ww-setup-button withdraw-ww-setup-button-disabled"
                >
                  {t("withdraw.tradePasswordAlreadySet")}
                </button>
              </div>
            )}

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
              <p className="withdraw-ww-balance">
                {t("withdraw.currentBalance")}: {currentBalance.toFixed(6)} USDT
              </p>
              {amount && (
                <p className="withdraw-ww-balance-after">
                  {t("withdraw.balanceAfter")}: {(currentBalance - (parseFloat(amount) + (parseFloat(amount) * feeRate))).toFixed(6)} USDT
                </p>
              )}
        </div>

        {error && <p className="withdraw-ww-error">{t(error)}</p>}
        {success && <p className="withdraw-ww-success">{t(success)}</p>}
          </div>

        <button
          type="submit"
            disabled={submitting || !hasTradePassword}
          className="withdraw-ww-button"
        >
          {submitting ? t("withdraw.submitting") : t("withdraw.submit")}
        </button>
      </form>
    </div>

      {renderKeypad()}
      {renderSetupModal()}
  </div>
  );
}
