// 📁 src/pages/RegisterPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function RegisterPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referral: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // URL에 ?ref= 코드가 있으면 referral 필드에 자동 채우기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setForm(prev => ({ ...prev, referral: ref.toUpperCase() }));
    }
  }, []);

  const isValidName = name => /^[a-zA-Z가-힣0-9\s]{2,}$/.test(name);
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!isValidName(form.name)) return setError(t("register.name_error"));
    if (!isValidEmail(form.email)) return setError(t("register.email_error"));
    if (form.password.length < 6) return setError(t("register.password_error"));
    if (form.password !== form.confirmPassword) return setError(t("register.confirm_error"));
    if (!captchaToken) return setError(t("register.captcha_required"));

    try {
      await axios.post(
        "http://54.85.128.211:4000/api/auth/register",
        { ...form, captchaToken },
        { withCredentials: true }
      );
      setSuccess(t("register.success"));
    } catch (err) {
      setError(err.response?.data?.error || t("register.fail"));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">{t("register.title")}</h1>

      <input
        type="text"
        placeholder={t("register.name")}
        className="border px-4 py-2 rounded w-full"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder={t("register.email")}
        className="border px-4 py-2 rounded w-full"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder={t("register.password")}
        className="border px-4 py-2 rounded w-full"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <input
        type="password"
        placeholder={t("register.confirmPassword")}
        className="border px-4 py-2 rounded w-full"
        value={form.confirmPassword}
        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
      />
      <input
        type="text"
        placeholder={t("register.referral")}
        className="border px-4 py-2 rounded w-full"
        value={form.referral}
        onChange={e => setForm({ ...form, referral: e.target.value.toUpperCase() })}
      />

      <ReCAPTCHA
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={token => setCaptchaToken(token)}
      />

      <button
        className="bg-yellow-500 text-white py-2 rounded w-full hover:bg-yellow-600"
        onClick={handleSubmit}
      >
        {t("register.submit")}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </div>
  );
}
