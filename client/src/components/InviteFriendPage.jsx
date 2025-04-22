// 📁 components/InviteFriendPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

export default function InviteFriendPage() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  const DOMAIN = "https://www.quantvines.top"; // ✅ 실제 도메인

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const res = await axios.get("/api/referral/code");
      setReferralCode(res.data?.data?.referralCode || "");
    } catch (err) {
      console.error("초대 코드 로딩 실패", err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullUrl = `${DOMAIN}/?tid=${referralCode}`;

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      <h2 className="text-center text-xl font-semibold mb-6">친구를 초대</h2>

      <div className="bg-[#2b1e0f] p-4 rounded-md mb-4">
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

      <div className="bg-[#3a270e] p-4 rounded-md text-center relative">
        <p className="text-yellow-300 text-sm mb-2">
          세계적 수준의 정량 제품, 일반인에게 무료로 개방
        </p>
        <div className="inline-block p-2 bg-white rounded">
          <QRCode value={fullUrl} size={160} fgColor="#000000" />
        </div>
        <p className="text-sm mt-2">
          초대 코드 : <span className="font-bold text-yellow-200">{referralCode}</span>
        </p>
        <button
          onClick={() => handleCopy(referralCode)}
          className="mt-2 bg-yellow-500 text-black py-2 px-4 rounded"
        >
          초대 코드 복사
        </button>
        {copied && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-sm px-4 py-1 rounded">성공적으로 복사</div>}
      </div>
    </div>
  );
}
