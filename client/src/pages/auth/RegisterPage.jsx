// 📁 src/pages/RegisterPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation, Trans } from "react-i18next";
import { ArrowLeft, Globe, X as CloseIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LANGUAGES } from '../../i18n/languages';  // ➊
import '../../styles/RegisterPage.css';
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const countryCodes = [
  { code: '+82', label: '🇰🇷 KR (+82)' },
  { code: '+1', label: '🇺🇸 US (+1)' },
  { code: '+84', label: '🇻🇳 VN (+84)' },
  { code: '+81', label: '🇯🇵 JP (+81)' },
  { code: '+86', label: '🇨🇳 CN (+86)' },
];

export default function RegisterPage() {
  const [countryCode, setCountryCode] = useState('+82');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("phone"); // 'phone' | 'email'
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referral: "",
    nationality: "KR",   // ➋ 기본값 설정
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // 팝업 열림 상태
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  // URL에 ?ref= 코드가 있으면 referral 필드 자동 채우기
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setForm(f => ({ ...f, referral: ref.toUpperCase() }));
  }, []);

  const isValidName  = name  => /^[a-zA-Z가-힣0-9\s]{2,}$/.test(name);
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = phone => /^\+\d{1,3}\s?\d{4,14}$/.test(phone);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    const fullPhone = `${countryCode}${form.phone}`; // 국가코드 결합
    if (!isValidName(form.name))                              return setError(t("register.name_error"));
    if (method === "email" && !isValidEmail(form.email))      return setError(t("register.email_error"));
    if (method === "phone" && !isValidPhone(fullPhone)) return setError(t("register.phone_error")); // <- 변경됨
    if (form.password.length < 6)                             return setError(t("register.password_error"));
    if (form.password !== form.confirmPassword)               return setError(t("register.confirm_error"));
    if (!captchaToken)                                        return setError(t("register.captcha_required"));
    if (!form.nationality) return setError("국적을 선택해주세요.");
    try {
      await axios.post("/api/auth/register", {
        name: form.name,
        email: method==="email" ? form.email : null,
        phone: method==="phone" ? fullPhone : null,
        password: form.password,
        referral: form.referral || null,
        nationality: form.nationality,
        captchaToken
      }, { withCredentials: true });
      setSuccess(t("register.success"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || t("register.fail"));
    }
  };

  return (
    <div className="page-wrapper-r">
      <div className="r-box">
        {/* 상단 */}
        <div className="top-nav-bar-r">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="top-tran" />
          </button>
          <h1 className="login-h-text-r">
            {t("register.title")}
          </h1>
          <button onClick={() => navigate("/settings/language")}>
            <Globe size={20} className="top-tran" />
          </button>
        </div>
        {/* 로고 */}
        <img
        src="/img/item/logo/logo.png"
        alt="Upstart"
        className="login-logo-r"
        />
        {/* 탭 */}
        <div className="flex01">
        <button
          onClick={() => setMethod("phone")}
          className={`v-token-r-m ${method === "phone" ? "active-button" : "inactive-button"}`}
        >
          {t("register.by_phone")}
        </button>
        <button
          onClick={() => setMethod("email")}
          className={`v-token-r-m ${method === "email" ? "active-button" : "inactive-button"}`}
        >
          {t("register.by_email")}
        </button>
          
        </div>
      {/* 국적 선택 드롭다운 추가 */}
      <div className="flex0">
        <label className="v-token-r0">Nationality</label>
        <select
          value={form.nationality}
          onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          className="v-token-r00"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
        {/* 입력 폼 */}
        <div className="r-box1">
          <input
            type="text"
            placeholder={t("register.name")}
            className="v-token-r"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          {method === "email" ? (
            <input
              type="email"
              placeholder={t("register.email")}
              className="v-token-r"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          ) : (
            <div className="flex1">
              <select
                className="v-token-r1"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
              >
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.code}  {/* ✅ 숫자만 표시하고, 앞에 + 추가 */}
                  </option>
                ))}
              </select>

            <input
              type="tel"
              placeholder={t("register.phone")}
              className="v-token-r2"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          )}
          <input
            type="password"
            placeholder={t("register.password")}
            className="v-token-r"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <input
            type="password"
            placeholder={t("register.confirmPassword")}
            className="v-token-r"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          />
          <input
            type="text"
            placeholder={t("register.referral")}
            className="v-token-r"
            value={form.referral}
            onChange={e => setForm(f => ({ ...f, referral: e.target.value.toUpperCase() }))}
          />

          <div className="chptcha-r custom-recaptcha">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={token => setCaptchaToken(token)}
            />
          </div>

          {error   && <p className="text-red-400 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}

          <button
            onClick={handleSubmit}
            className="r-button"
          >
            {t("register.submit")}
          </button>

          <div className="auth-links-r">
          <span>Do you already have an account?&nbsp;&nbsp;</span>

            <Link to="/login" className="auth-links-r">
              login
            </Link>
          </div>

      
          {/* 약관 동의 */}
          <div className="auth-links-r">
            <Trans i18nKey="register.agree">
              {/*
                The two child <button> tags below will
                replace <0>…</0> and <1>…</1> in your JSON.
              */}
              
              <button
                className="auth-links-r-t"
                onClick={() => setOpenTerms(true)}
              />
              <button
                className="auth-links-r-t"
                onClick={() => setOpenPrivacy(true)}
              />
            </Trans>
          </div>
        </div>
      </div>

      {/* ─── 약관 팝업 ─── */}
      {openTerms && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpenTerms(false)}
        >
          <div
            className="bg-[#2c1f0f] text-yellow-100 p-6 rounded max-w-lg w-full mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-yellow-300"
              onClick={() => setOpenTerms(false)}
            >
              <CloseIcon size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{t("agreement.terms.title")}</h2>
            <div className="text-sm whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {t("agreement.terms.content")}
            </div>
          </div>
        </div>
      )}

      {/* ─── 개인정보 팝업 ─── */}
      {openPrivacy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpenPrivacy(false)}
        >
          <div
            className="bg-[#2c1f0f] text-yellow-100 p-6 rounded max-w-lg w-full mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-yellow-300"
              onClick={() => setOpenPrivacy(false)}
            >
              <CloseIcon size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{t("agreement.privacy.title")}</h2>
            <div className="text-sm whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {t("agreement.privacy.content")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
