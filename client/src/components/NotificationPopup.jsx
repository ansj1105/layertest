import '../styles/MainLanding.css';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import React from 'react';

const NotificationPopup = React.memo(({ list, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="notification-overlay" onClick={onClose}>
      <div
        className="notification-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notification-header">
          <h3 className="notification-title">{t('notification.title')}</h3>
          <button className="notification-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="notification-item official" style={{ whiteSpace: 'pre-line', overflow: 'auto' }}>
          <h4>{t('notification.subtitle')}</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{t('notification.official')}</p>
        </div>

        {/* 알림 리스트 출력 (주석 해제 가능) */}
        {/* list.map((item) => (
          <div key={item.id} className="notification-item">
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        )) */}
      </div>
    </div>
  );
});

// ✅ 선언 이후에 propTypes 지정
NotificationPopup.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationPopup;
