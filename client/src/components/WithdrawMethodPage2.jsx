// 📁 src/pages/WithdrawMethodPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
        //console.log("🔍 API 응답:", res.data); // 전체 구조 확인
        const rate = parseFloat(res.data.data.real_withdraw_fee) || 0;
        //console.log("💰 수수료율 로드 완료:", rate);
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
      setError("유효한 주소를 입력해 주세요.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("출금 수량을 올바르게 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/withdrawals/withdraw", {
        to_address: address,
        amount,
        method: "USDT",
      });
      setSuccess("출금 요청이 성공적으로 접수되었습니다.");
      setAddress("");
      setAmount("");
      setAddressValid(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "출금 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>{t("common.back")}</span>
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">{t("withdraw.title")}</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm mb-1">{t("withdraw.addressLabel")}</label>
          <input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressValid(null);
            }}
            onBlur={validateAddress}
            className="w-full p-2 bg-[#2f1f10] rounded text-white"
            placeholder={t("withdraw.addressPlaceholder")}
          />
          {addressValid === false && (
            <p className="text-red-400 text-sm mt-1">{t("withdraw.invalidAddress")}</p>
          )}
          {addressValid === true && (
            <p className="text-green-400 text-sm mt-1">{t("withdraw.validAddress")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">{t("withdraw.amountLabel")}</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-[#2f1f10] rounded text-white"
            placeholder={t("withdraw.amountPlaceholder")}
          />
        </div>

        <div className="text-sm space-y-1">
          <p>{t("withdraw.feeRate")}: {(feeRate * 100).toFixed(2)}%</p>
          <p>{t("withdraw.estimatedFee")}: {(parseFloat(amount) * feeRate || 0).toFixed(6)} USDT</p>
          <p>{t("withdraw.netAmount")}: {netAmount.toFixed(6)} USDT</p>
        </div>

        {error && <p className="text-red-500 text-center">{t(error)}</p>}
        {success && <p className="text-green-500 text-center">{t(success)}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-yellow-500 text-black rounded disabled:opacity-50"
        >
          {submitting ? t("withdraw.submitting") : t("withdraw.submit")}
        </button>
      </form>
    </div>
  );
}
