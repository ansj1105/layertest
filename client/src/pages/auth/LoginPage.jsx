// 📁 src/pages/auth/LoginPage.jsx
import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!isValidEmail(form.email)) return setError(t("login.email_error"));
    if (!form.password) return setError(t("login.password_error"));
    if (!captcha) return setError("reCAPTCHA 인증이 필요합니다");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        ...form,
        captchaToken: captcha,
      }, { withCredentials: true });

      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess(t("login.success"));
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || t("login.fail"));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">{t("login.title")}</h1>

      <input
        type="email"
        placeholder={t("login.email")}
        className="border px-4 py-2 rounded w-full"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder={t("login.password")}
        className="border px-4 py-2 rounded w-full"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      {/* ✅ reCAPTCHA */}
      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={(token) => setCaptcha(token)}
        className="mx-auto"
      />

      <button
        className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600"
        onClick={handleLogin}
      >
        {t("login.submit")}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
            {/* ✅ 회원가입 링크 */}
            <p className="text-center text-sm mt-4">
        {t("login.no_account")}{" "}
        <a href="/register" className="text-blue-600 hover:underline font-semibold">
          {t("login.register")}
        </a>
      </p>
    </div>
  );
}
