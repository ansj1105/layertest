// 📁 components/InviteFriendPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
import { useTranslation } from 'react-i18next';
import '../styles/InviteFriendPage.css';
import '../styles/topbar.css';

export default function InviteFriendPage() {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const DOMAIN = window.location.origin; // 도메인을 자동으로 가져옵니다.

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await axios.get("/api/referral/code-u", { withCredentials: true });
        setReferralCode(res.data.data.referral_code || "");
      } catch (err) {
        console.error(t('invite.error.load_failed'), err);
      }
    };
    fetchReferralCode();
  }, [t]);

  const handleCopy = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(t('invite.error.copy_failed'), err);
      }
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(t('invite.error.fallback_copy_failed'), err);
      }
      document.body.removeChild(textarea);
    }
  };

  const fullUrl = `${DOMAIN}/register?ref=${referralCode}`;

  return (
    <div className="page-wrapper-invi">
      <div className="top-bar">
        <button onClick={() => window.history.back()} className="top-tran">
          <ArrowLeftIcon size={24} />
        </button>
        <div className="invite-title">{t('invite.title')}</div>
      </div>

      <div className="invite-box">
        <p className="invite-label">{t('invite.invite_link')}</p>
        <input
          readOnly
          className="invite-input"
          value={fullUrl}
        />
        <button
          className="invite-copy-btn"
          onClick={() => handleCopy(fullUrl)}
        >
          {t('invite.copy_invite_link')}
        </button>
      </div>

      {/* QR 코드 + 초대 코드 복사 섹션 */}
      <div className="referral-box-container">
        <p className="referral-box-description">
          {t('invite.product_description')}
        </p>
        <div className="referral-box-qr">
          <QRCodeCanvas value={fullUrl} size={180} fgColor="#000000" />
        </div>
        <p className="referral-box-code-label">
          {t('invite.referral_code')}: <span className="referral-box-code">{referralCode}</span>
        </p>
        <button
          onClick={() => handleCopy(referralCode)}
          className="referral-box-copy-btn"
        >
          {t('invite.copy_referral_code')}
        </button>

        {copied && (
          <div className="referral-box-alert">
            {t('invite.copy_success')}
          </div>
        )}
      </div>
    </div>
  );
}
