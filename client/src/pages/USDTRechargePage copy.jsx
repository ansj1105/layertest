// 📁 src/pages/USDTRechargePage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { ArrowLeft as ArrowLeftIcon, ClipboardCopy } from 'lucide-react';
import '../styles/USDTRechargePage.css';
import '../styles/topbar.css';
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

  const handleCopy = () => {
    if (!address) {
      alert('지갑이 없습니다. 생성해주세요.');
      return;
    }
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 flex items-center justify-center">
        ⏳ 로딩 중...
      </div>
    );
  }

  return (
    <div className="charge-page">
      {/* 뒤로가기 + 타이틀 */}
      <div className="charge-header">
        <button
          onClick={() => window.history.back()}
          className="charge-back-button"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="charge-title">충전</h2>
      </div>


      {/* 체인 표시 */}
      <div className="charge-protocol-box">
        <div className="charge-protocol-label">TRC-20</div>
      </div>

      <div className="charge-qr-box">
        {address ? (
          <>
            <p className="charge-qr-label">QR코드를 스캔하여 충전하기</p>
            <div className="charge-qr-wrapper">
              <QRCode value={address} size={180} fgColor="#000000" />
            </div>
          </>
        ) : (
          <p className="charge-wallet-missing">지갑이 없습니다. 생성해주세요.</p>
        )}

        <div className="charge-wallet-line">
          <span className="charge-wallet-address">{address || '—'}</span>
          <ClipboardCopy
            size={20}
            className="charge-copy-button"
            onClick={handleCopy}
          />
        </div>

        {copied && (
          <div className="charge-copy-success">주소가 복사되었습니다!</div>
        )}
      </div>

    </div>
  );
}
