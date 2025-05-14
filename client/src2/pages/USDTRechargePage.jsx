// 📁 src/pages/USDTRechargePage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { ArrowLeft as ArrowLeftIcon, ClipboardCopy } from 'lucide-react';

export default function USDTRechargePage() {
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/recharge/usdt', { withCredentials: true });
        if (res.data.success) {
          setAddress(res.data.data.address);
        } else {
          // API는 success=false 로 내려오지 않지만 혹시 대비
          alert('지갑이 없습니다. 생성해주세요.');
        }
      } catch (err) {
        console.error('❌ USDT 충전 정보 로드 실패', err);
        alert('지갑이 없습니다. 생성해주세요.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCopy = async () => {
    if (!address) {
      alert('지갑이 없습니다. 생성해주세요.');
      return;
    }
  
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        // 폴백: execCommand
        const textarea = document.createElement("textarea");
        textarea.value = address;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
  
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("주소 복사 실패:", err);
      alert("복사에 실패했습니다.");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 flex items-center justify-center">
        ⏳ 로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 뒤로가기 + 타이틀 */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-yellow-200 hover:text-yellow-100 mr-2"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="text-xl font-semibold">충전</h2>
      </div>

      {/* 체인 표시 */}
      <div className="bg-[#2c1f0f] p-4 rounded mb-4">
        <div className="inline-block bg-yellow-700 text-black px-3 py-1 rounded">
          TRC-20
        </div>
      </div>

      {/* QR 코드 또는 없음 메시지 */}
      <div className="bg-[#3a270e] p-4 rounded text-center">
        {address ? (
          <>
            <p className="text-yellow-300 text-sm mb-2">
              QR코드를 스캔하여 충전하기
            </p>
            <div className="inline-block bg-white p-2 rounded mb-2">
              <QRCode value={address} size={180} fgColor="#000000" />
            </div>
          </>
        ) : (
          <p className="text-red-400 mb-4">지갑이 없습니다. 생성해주세요.</p>
        )}

        {/* 지갑 주소 + 복사 버튼 */}
        <div className="flex items-center justify-center space-x-2 mt-2">
          <span className="text-yellow-200 break-all">
            {address || '—'}
          </span>
          <ClipboardCopy
            size={20}
            className="cursor-pointer text-yellow-300 hover:text-white"
            onClick={handleCopy}
          />
        </div>

        {copied && (
          <div className="text-center text-green-400 text-sm mt-1">
            주소가 복사되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
