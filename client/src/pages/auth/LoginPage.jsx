// 📁 src/pages/auth/LoginPage.jsx
import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Globe } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // identifier: 이메일 or 전화번호
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [captcha, setCaptcha]       = useState("");
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  // 간단 유효성 검사
  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = v => /^\+\d{1,3}\s?\d{4,14}$/.test(v);

  const handleLogin = async () => {
    setError(""); setSuccess("");

    if (!(isValidEmail(identifier) || isValidPhone(identifier))) {
      return setError(t("login.identifier_error"));
    }
    if (!password) {
      return setError(t("login.password_error"));
    }
    if (!captcha) {
      return setError(t("login.captcha_required"));
    }

    try {
      await axios.post("http://54.85.128.211:4000/api/auth/login", {
        identifier,
        password,
        captchaToken: captcha
      });
      setSuccess(t("login.success"));
      setTimeout(() => window.location.href = "/", 200); // 강제 리로드
    } catch (err) {
      setError(err.response?.data?.error
        ? t(err.response.data.error)  // i18n 키로 돌려받았다면 번역
        : t("login.fail")
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 flex flex-col items-center p-4">
      {/* 상단 바 */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} className="text-yellow-300"/>
        </button>
        <h1 className="text-lg font-semibold">{t("login.title")}</h1>
        <button onClick={() => navigate("/settings/language")}>
          <Globe size={24} className="text-yellow-300"/>
        </button>
      </div>

      {/* 폼 컨테이너 */}
      <div className="w-full max-w-sm bg-[#2c1f0f] p-6 rounded-lg space-y-4 shadow-lg">
        <input
          type="text"
          placeholder={t("login.identifier")}
          className="w-full bg-[#3a270e] px-4 py-2 rounded placeholder-yellow-500 focus:outline-none"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("login.password")}
          className="w-full bg-[#3a270e] px-4 py-2 rounded placeholder-yellow-500 focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={setCaptcha}
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-600 text-black py-2 rounded hover:bg-yellow-700"
        >
          {t("login.submit")}
        </button>

        {error   && <p className="text-red-400 text-center">{error}</p>}
        {success && <p className="text-green-400 text-center">{success}</p>}

        <div className="flex justify-between text-sm text-yellow-300">
          <Link to="/register" className="hover:underline">
            {t("login.register")}
          </Link>
          <Link to="/forgot-password" className="hover:underline">
            {t("login.forgot")}
          </Link>
        </div>
      </div>
    </div>
  );
}
