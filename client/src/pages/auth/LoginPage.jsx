// 📁 src/pages/auth/LoginPage.jsx
import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!isValidEmail(form.email)) return setError(t("login.email_error"));
    if (!form.password) return setError(t("login.password_error"));

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", form, {
        withCredentials: true, // ✅ 이거 추가해야 세션 쿠키 주고받기 가능!
      });
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
//세션로그인
      setSuccess(t("login.success"));
      // 여기에 토큰 저장 또는 리다이렉트 로직 추가 가능
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

      <button
        className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600"
        onClick={handleLogin}
      >
        {t("login.submit")}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </div>
  );
}
