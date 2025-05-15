// 📁 components/InviteFriendPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)
import '../styles/InviteFriendPage.css';
import '../styles/topbar.css';



export default function InviteFriendPage() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const DOMAIN = window.location.origin; // 도메인을 자동으로 가져옵니다.

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        const res = await axios.get("/api/referral/code-u", { withCredentials: true });
        setReferralCode(res.data.data.referral_code || "");
      } catch (err) {
        console.error("초대 코드 로딩 실패", err);
      }
    };
    fetchReferralCode();
  }, []);

    const handleCopy = async (text) => {
        // Clipboard API 지원 확인
       if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error("클립보드 복사 실패:", err);
         }
        } else {
          // 폴백: textarea + execCommand
          const textarea = document.createElement("textarea");
          textarea.value = text;
          // 화면 밖으로 배치
         textarea.style.position = "fixed";
          textarea.style.top = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
           setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error("폴백 복사 실패:", err);
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
        <div className="invite-title">친구를 초대</div>
      </div>

        <div className="invite-box">
          <p className="invite-label">초대 링크</p>
          <input
            readOnly
            className="invite-input"
            value={fullUrl}
          />
          <button
            className="invite-copy-btn"
            onClick={() => handleCopy(fullUrl)}
          >
            초대 링크 복사
          </button>
        </div>


      {/* QR 코드 + 초대 코드 복사 섹션 */}
      <div className="referral-box-container">
        <p className="referral-box-description">
          세계적 수준의 정량 제품, 일반인에게 무료로 개방
        </p>
        <div className="referral-box-qr">
          <QRCodeCanvas value={fullUrl} size={180} fgColor="#000000" />
        </div>
        <p className="referral-box-code-label">
          초대 코드 : <span className="referral-box-code">{referralCode}</span>
        </p>
        <button
          onClick={() => handleCopy(referralCode)}
          className="referral-box-copy-btn"
        >
          초대 코드 복사
        </button>

        {copied && (
          <div className="referral-box-alert">
            성공적으로 복사되었습니다
          </div>
        )}
      </div>
    </div>
  );
}
