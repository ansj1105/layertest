import '../styles/MainLanding.css';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import React from 'react';

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

        {/* 공식 안내문을 항상 맨 위에 출력 */}
        <div className="notification-item official" style={{ whiteSpace: 'pre-line', overflow: 'auto' }}>
          <h4>{t('notification.subtitle')}</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{t('notification.official')}</p>
        </div>

        {/* {list.map((item) => (
          <div key={item.id} className="notification-item">
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        ))} */}
      </div>
    </div>
  );
});

export default NotificationPopup;