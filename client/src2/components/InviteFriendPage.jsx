// 📁 components/InviteFriendPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeftIcon } from "lucide-react"; // 아이콘 라이브러리 (shadcn-ui)

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 왼쪽 화살표 - 이전 페이지로 이동 */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>

      <h2 className="text-center text-2xl font-semibold mb-6">친구를 초대</h2>

      {/* 초대 링크 복사 섹션 */}
      <div className="bg-[#2b1e0f] p-4 rounded-md mb-6">
        <p className="text-sm mb-1">초대 링크</p>
        <input
          readOnly
          className="w-full bg-black p-2 rounded text-white border border-yellow-400"
          value={fullUrl}
        />
        <button
          className="w-full mt-2 bg-yellow-600 text-black py-2 rounded"
          onClick={() => handleCopy(fullUrl)}
        >
          초대 링크 복사
        </button>
      </div>

      {/* QR 코드 + 초대 코드 복사 섹션 */}
      <div className="bg-[#3a270e] p-6 rounded-md text-center relative">
        <p className="text-yellow-300 text-sm mb-4">
          세계적 수준의 정량 제품, 일반인에게 무료로 개방
        </p>
        <div className="inline-block p-2 bg-white rounded mb-4">
          <QRCodeCanvas value={fullUrl} size={180} fgColor="#000000" />
        </div>
        <p className="text-sm">
          초대 코드 : <span className="font-bold text-yellow-200">{referralCode}</span>
        </p>
        <button
          onClick={() => handleCopy(referralCode)}
          className="mt-4 bg-yellow-500 text-black py-2 px-4 rounded"
        >
          초대 코드 복사
        </button>
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white text-sm px-4 py-2 rounded">
            성공적으로 복사되었습니다
          </div>
        )}
      </div>
    </div>
  );
}
