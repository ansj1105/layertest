// 📁 src/pages/RegisterPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation, Trans } from "react-i18next";
import { ArrowLeft, Globe, X as CloseIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LANGUAGES } from '../../i18n/languages';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const countryCodes = [
  { code: '+82', label: '🇰🇷 KR (+82)' },
  { code: '+1',  label: '🇺🇸 US (+1)' },
  { code: '+84', label: '🇻🇳 VN (+84)' },
  { code: '+81', label: '🇯🇵 JP (+81)' },
  { code: '+86', label: '🇨🇳 CN (+86)' },
];

export default function RegisterPage() {
  const [countryCode, setCountryCode] = useState('+82');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("phone"); 
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    confirmPassword: "", referral: "", nationality: "KR",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [openTerms, setOpenTerms]     = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setForm(f => ({ ...f, referral: ref.toUpperCase() }));
  }, []);

  const isValidName  = name  => /^[a-zA-Z가-힣0-9\s]{2,}$/.test(name);
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = phone => /^\+\d{1,3}\s?\d{4,14}$/.test(phone);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    const fullPhone = `${countryCode}${form.phone}`;
    if (!isValidName(form.name))                  return setError(t("register.name_error"));
    if (method==="email" && !isValidEmail(form.email)) return setError(t("register.email_error"));
    if (method==="phone" && !isValidPhone(fullPhone)) return setError(t("register.phone_error"));
    if (form.password.length < 6)                return setError(t("register.password_error"));
    if (form.password !== form.confirmPassword)  return setError(t("register.confirm_error"));
    if (!captchaToken)                           return setError(t("register.captcha_required"));
    if (!form.nationality)                       return setError("국적을 선택해주세요.");

    try {
      await axios.post("http://localhost:4000/api/auth/register", {
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

  // 재사용 가능한 Neon 스타일 input
  const NeonInput = props => (
    <input
      {...props}
      className={`
        w-full px-3 py-2 bg-[#11131a] text-teal-200
        border-2 border-teal-400 rounded-md
        shadow-[0_0_8px_rgba(44,196,201,0.8)]
      `}
      onChange={e => props.onChange?.(e.target.value)}
    />
  );

  return (
    <div className="h-screen flex flex-col bg-[#0d0f13]">
      {/* 헤더 */}
      <header className="
        fixed top-0 left-1/2 transform -translate-x-1/2
        w-full max-w-md h-14 bg-[#11131a] z-20
        flex items-center justify-between px-4
      ">
        <button onClick={() => navigate(-1)}><ArrowLeft size={20} className="text-teal-200"/></button>
        <h1 className="text-white font-semibold t">회원가입</h1>
        <button onClick={() => navigate("/settings/language")}><Globe size={20} className="text-teal-200"/></button>
      </header>

      {/* 본문 (스크롤) */}
      <main className="pt-14 pb-6 px-4 flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-5">
          
          {/* 로고 */}
          <div className="flex justify-center">
            <img src="/img/item/logo/logo.png" alt="Upstart" className="h-12"/>
          </div>

          {/* ─── Tabs ──────────────────────────────────────────────────────────── */}
          <div className="flex gap-2">
            {['phone','email'].map(tab => (
              <button
                key={tab}
                onClick={()=>setMethod(tab)}
                className={`
                  flex-1 text-center font-medium rounded-md
                  border-2 border-teal-400
                  shadow-[0_0_8px_rgba(44,196,201,0.8)]
                  transition-colors
                  ${method===tab
                    ? 'bg-teal-400 text-white'          /* Active: 흰 텍스트 */
                    : 'bg-[#11131a] text-teal-300'}      /* Inactive: 연한 민트 */
                  py-3                                  /* 높이 살짝 늘림 */
                `}
              >
                {tab==='phone' ? t("register.by_phone") : t("register.by_email")}
              </button>
            ))}
          </div>

          {/* 국적 */}
          <div>
            <label className="block mb-1 text-sm text-teal-200">국적</label>
            <select
              value={form.nationality}
              onChange={e=>setForm(f=>({...f,nationality:e.target.value}))}
              className="
                w-full px-3 py-2 bg-[#11131a] text-teal-200
                border-2 border-teal-400 rounded-md
                shadow-[0_0_8px_rgba(44,196,201,0.8)]
              "
            >
              {LANGUAGES.map(lang=>(
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* 입력 필드 */}
          <div className="space-y-4">
            <NeonInput
              placeholder={t("register.name")}
              value={form.name}
              onChange={v=>setForm(f=>({...f,name:v}))}
              
            />

            {method==="email" ? (
              <NeonInput
                type="email"
                placeholder={t("register.email")}
                value={form.email}
                onChange={v=>setForm(f=>({...f,email:v}))}
              />
            ) : (
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={e=>setCountryCode(e.target.value)}
                  className="
                    w-24 px-3 py-2 bg-[#11131a] text-teal-200
                    border-2 border-teal-400 rounded-l-md
                    shadow-[0_0_8px_rgba(44,196,201,0.8)]
                  "
                >
                  {countryCodes.map(c=>(
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <NeonInput
                  placeholder={t("register.phone")}
                  value={form.phone}
                  onChange={v=>setForm(f=>({...f,phone:v}))}
                  className="rounded-r-md"
                />
              </div>
            )}

            <NeonInput
              type="password"
              placeholder={t("register.password")}
              value={form.password}
              onChange={v=>setForm(f=>({...f,password:v}))}
            />
            <NeonInput
              type="password"
              placeholder={t("register.confirmPassword")}
              value={form.confirmPassword}
              onChange={v=>setForm(f=>({...f,confirmPassword:v}))}
            />
            <NeonInput
              placeholder={t("register.referral")}
              value={form.referral}
              onChange={v=>setForm(f=>({...f,referral:v.toUpperCase()}))}
            />
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center mt-3">
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={token=>setCaptchaToken(token)}/>
          </div>

          {/* 에러/성공 메시지 */}
          {error   && <p className="text-red-400 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSubmit}
            className="
              w-full mt-4 rounded-lg
              bg-[#206D7F] border-2 border-[#A8CAC6]
              text-white font-semibold text-lg
              py-4
              transition-colors
              hover:bg-[#2DD4BF]               /* 약간 어두운 hover 색 선택 가능 */
            "
          >
            회원가입
          </button>

          {/* 로그인 & 약관 */}
          <div className="mt-4 text-center text-xs text-teal-200">
            {t("register.no_account")}&nbsp;
            <Link to="/login" className="underline text-teal-400">{t("register.login")}</Link>
          </div>
          <div className="mt-2 text-center text-xs text-teal-300">
            <Trans i18nKey="register.agree">
              <button className="underline text-yellow-300" onClick={()=>setOpenTerms(true)}/>
              <button className="underline ml-2 text-yellow-300" onClick={()=>setOpenPrivacy(true)}/>
            </Trans>
          </div>

        </div>
      </main>

      {/* 팝업 모달 */}
      {openTerms && (
        <Modal title={t("agreement.terms.title")} content={t("agreement.terms.content")} onClose={()=>setOpenTerms(false)}/>
      )}
      {openPrivacy && (
        <Modal title={t("agreement.privacy.title")} content={t("agreement.privacy.content")} onClose={()=>setOpenPrivacy(false)}/>
      )}
    </div>
  );
}

// 간단 모달 컴포넌트
function Modal({ title, content, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30" onClick={onClose}>
      <div className="bg-[#1d1d27] text-teal-100 p-6 rounded-md max-w-md mx-4" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}><CloseIcon size={18} className="text-teal-200"/></button>
        </div>
        <div className="text-sm leading-relaxed max-h-60 overflow-y-auto">{content}</div>
      </div>
    </div>
  );
}
