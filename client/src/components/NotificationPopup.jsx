import '../styles/MainLanding.css';
import PropTypes from 'prop-types';

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
 


export default function NotificationPopup({ list, onClose }) {
  return (
    <div className="notification-overlay" onClick={onClose}>
      <div
        className="notification-popup"
        onClick={(e) => e.stopPropagation()} // 모달 바깥 클릭 시만 닫히게
      >
        <div className="notification-header">
          <h3 className="notification-title">{t('notification.title')}</h3>
          <button className="notification-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {list.map((item) => (
          <div key={item.id} className="notification-item">
            <h4>{item.title}</h4>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}