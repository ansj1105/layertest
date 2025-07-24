// 📁 src/pages/USDTRechargePage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { ArrowLeft as ArrowLeftIcon, ClipboardCopy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/USDTRechargePage.css';
import '../styles/topbar.css';
import AdvancedLoadingSpinner from '../components/AdvancedLoadingSpinner';
export default function USDTRechargePage() {
  const { t } = useTranslation();
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
          alert(t('usdtRecharge.errors.noWallet'));
        }
      } catch (err) {
        console.error('❌ USDT 충전 정보 로드 실패', err);
        alert(t('usdtRecharge.errors.noWallet'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const handleCopy = async () => {
    if (!address) {
      alert(t('usdtRecharge.errors.noWallet'));
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
      alert(t('usdtRecharge.errors.copyFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1109] text-yellow-100 flex items-center justify-center">
        <AdvancedLoadingSpinner text="Loading..." />
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
        <h2 className="charge-title">{t('usdtRecharge.title')}</h2>
      </div>

      {/* 체인 표시 */}
      <div className="charge-protocol-box">
        <div className="charge-protocol-label">TRC-20</div>
      </div>

      <div className="charge-qr-box">
        {address ? (
          <>
            <p className="charge-qr-label">{t('usdtRecharge.scanQRCode')}</p>
            <div className="charge-qr-wrapper">
              <QRCode value={address} size={180} fgColor="#000000" />
            </div>
          </>
        ) : (
          <p className="charge-wallet-missing">{t('usdtRecharge.errors.noWallet')}</p>
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
          <div className="charge-copy-success">{t('usdtRecharge.addressCopied')}</div>
        )}
      </div>
    </div>
  );
}
