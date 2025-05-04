// 📁 src/pages/FundingDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function FundingDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [amount, setAmount] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [projRes, balRes] = await Promise.all([
          axios.get(`/api/projects/${id}/summary`, { withCredentials: true }),
          axios.get(`/api/wallet/finance-summary`, { withCredentials: true })
        ]);
        const { project: projData, currentAmount, investors: invList } = projRes.data;
        setProject({ ...projData, currentAmount });
        setInvestors(invList);
        setAvailableBalance(parseFloat(balRes.data.data.fundBalance || 0));
      } catch (err) {
        console.error(t("funding.detail2.loadError"), err);
      }
    })();
  }, [id, t]);

  const handleSubscribe = async () => {
    setError("");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return setError(t("funding.detail2.invalidAmount"));
    }
    if (amt < project.minAmount || amt > project.maxAmount) {
      return setError(
        t("funding.detail2.amountRange", { min: project.minAmount, max: project.maxAmount })
      );
    }
    const remaining = project.targetAmount - project.currentAmount;
    if (amt > remaining) {
      return alert(t("funding.detail2.exceedRemaining", { remaining: remaining.toFixed(6) }));
    }
    if (amt > availableBalance) {
      return setError(t("funding.detail2.insufficientBalance"));
    }
    try {
      await axios.post(
        `/api/wallet/projects/${id}/invest`,
        { amount: amt },
        { withCredentials: true }
      );
      alert(t("funding.detail2.subscribeSuccess"));
      navigate("/funding");
    } catch (err) {
      setError(err.response?.data?.error || t("funding.detail2.subscribeError"));
    }
  };

  if (!project) {
    return <div className="text-center mt-10 text-gray-400">{t("funding.detail2.loading")}</div>;
  }

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <button onClick={() => navigate(-1)} className="text-white text-xl mb-4">
        ←
      </button>
      <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
      <p className="mb-2">
        {t("funding.detail2.descriptionLabel")} {project.description}
      </p>
      <p className="mb-2">
        {t("funding.detail2.cycleLabel", { cycle: project.cycle })}
      </p>
      <p className="mb-2">
        {t("funding.detail2.dailyRateLabel", { rate: project.dailyRate })}
      </p>
      <p className="mb-2">
        {t("funding.detail2.minMaxLabel", { min: project.minAmount, max: project.maxAmount })}
      </p>
      <p className="mb-2">
        {t("funding.detail2.targetLabel", { target: project.targetAmount })}
      </p>
      <p className="mb-2">
        {t("funding.detail2.currentLabel", { current: project.currentAmount })}
      </p>
      <p className="mb-4 text-green-300">
        {t("funding.detail2.availableLabel", { balance: availableBalance })}
      </p>

      <input
        type="number"
        className="w-full p-2 mb-2 bg-[#1a1109] rounded text-yellow-200 placeholder-yellow-500"
        placeholder={t("funding.detail2.amountPlaceholder")}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error && <p className="text-red-400 mb-2 text-sm">{error}</p>}

      <button
        className="w-full py-2 bg-yellow-500 text-black font-semibold rounded"
        onClick={handleSubscribe}
      >
        {t("funding.detail2.subscribe")}
      </button>

      <h3 className="text-lg font-bold mt-8 mb-2">
        {t("funding.detail2.investorsTitle")}
      </h3>
      {investors.length === 0 ? (
        <p className="text-sm text-gray-400">{t("funding.detail2.noInvestors")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {investors.map((inv) => (
            <li key={inv.id} className="border-b border-gray-700 pb-1">
              📧 {inv.email} - 💰 {inv.amount} USDT - 🕒{' '}
              {new Date(inv.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}