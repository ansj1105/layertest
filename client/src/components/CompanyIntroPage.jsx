// 📁 src/components/CompanyIntroPage.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, X, CheckCircle } from 'lucide-react';
import '../styles/CompanyIntroPage.css';
import '../styles/topbar.css';

export default function CompanyIntroPage() {
  const { t } = useTranslation();
  const [selectedDetail, setSelectedDetail] = useState(null);

  // 배열 형태의 번역 문자열을 꺼낼 때는 returnObjects: true 옵션 사용
  const items = t('companyIntro.items', { returnObjects: true });
  const details = t('companyIntro.details', { returnObjects: true });

  const handleItemClick = (index) => {
    const detailKeys = ['quantitative', 'funding', 'blockchain', 'security'];
    const selectedKey = detailKeys[index];
    setSelectedDetail(details[selectedKey]);
  };

  const closeModal = () => {
    setSelectedDetail(null);
  };

  return (
    <div className="company-intro-wrapper">
      <div className="company-intro-top-bar">
        {/* 뒤로 가기 */}
        <button
          onClick={() => window.history.back()}
          className="company-intro-back-btn"
        >
          <ArrowLeft size={24} />
        </button>

        {/* 타이틀 */}
        <div className="company-intro-title">
          {t('companyIntro.title')}
        </div>
      </div>

      <ul className="company-intro-list">
        {items.map((line, idx) => (
          <li
            key={idx}
            className="company-intro-list-item"
            onClick={() => handleItemClick(idx)}
          >
            {line}
          </li>
        ))}
      </ul>

      {/* 상세 설명 모달 */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 닫기 버튼 */}
            <button onClick={closeModal} className="modal-close-btn">
              ✕
            </button>

            {/* 제목 */}
            <h3 className="modal-title">
              {selectedDetail.title}
            </h3>

            {/* 설명 */}
            <div className="modal-text-row">
              {selectedDetail.description}
            </div>

            {/* 주요 특징 */}
            <div className="modal-features">
              <h4 className="modal-text-row" style={{ color: '#fef08a', marginBottom: '10px' }}>
                {t('companyIntro.featuresTitle')}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {selectedDetail.features.map((feature, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    color: '#d1d5db',
                    fontSize: '14px'
                  }}>
                    <CheckCircle size={16} style={{
                      color: '#10b981',
                      marginRight: '8px',
                      marginTop: '2px',
                      flexShrink: 0
                    }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 결론 */}
            <div style={{
              backgroundColor: '#1f2937',
              padding: '12px',
              borderRadius: '6px',
              borderLeft: '3px solid #fde68a',
              marginTop: '16px'
            }}>
              <p style={{
                color: '#d1d5db',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0,
                fontStyle: 'italic'
              }}>
                {selectedDetail.conclusion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
