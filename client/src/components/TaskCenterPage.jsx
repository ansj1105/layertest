// 📁 src/pages/TaskCenterPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AlertPopup from './AlertPopup';
import '../styles/TaskCenterPage.css';
import '../styles/topbar.css';

export default function TaskCenterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  // 초대 보상
  const [inviteOpen, setInviteOpen] = useState(true);
  const [inviteRewards, setInviteRewards] = useState([]);

  // 가입 보너스
  const [joinRewards, setJoinRewards] = useState([]);

  // 알림 상태
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    title: '',
    message: '',
    type: 'success'
  });

  // 초대 보상 불러오기 (토글 시)
  useEffect(() => {
    if (inviteOpen) {
      axios.get('/api/mydata/invite-rewards', { withCredentials: true })
        .then(res => setInviteRewards(res.data.data))
        .catch(console.error);
    }
  }, [inviteOpen]);

  // 가입 보너스는 마운트 시 한 번만
  useEffect(() => {
    axios.get('/api/mydata/join-rewards', { withCredentials: true })
      .then(res => setJoinRewards(res.data.data))
      .catch(console.error);
  }, []);

  const claimInvite = async id => {
    try {
      const reward = inviteRewards.find(r => r.id === id);
      await axios.post(`/api/mydata/invite-rewards/claim/${id}`, {}, { withCredentials: true });
      setInviteRewards(rs => rs.map(x => x.id === id ? { ...x, claimed: true } : x));

      // 알림 표시
      setAlertInfo({
        title: t('task.invite_reward.success'),
        message: t('task.invite_reward.reward_claimed', {
          level: reward.level,
          amount: reward.amount
        }),
        type: 'success'
      });
      setShowAlert(true);
    } catch (e) {
      setAlertInfo({
        title: t('task.invite_reward.error'),
        message: e.response?.data?.error || t('task.invite_reward.claim_fail'),
        type: 'error'
      });
      setShowAlert(true);
    }
  };

  const claimJoin = async id => {
    try {
      const reward = joinRewards.find(r => r.id === id);
      await axios.post(`/api/mydata/join-rewards/claim/${id}`, {}, { withCredentials: true });
      setJoinRewards(rs => rs.map(x => x.id === id ? { ...x, claimed: true } : x));

      // 알림 표시
      setAlertInfo({
        title: t('task.join_reward.success'),
        message: t('task.join_reward.reward_claimed', {
          amount: reward.amount
        }),
        type: 'success'
      });
      setShowAlert(true);
    } catch (e) {
      setAlertInfo({
        title: t('task.join_reward.error'),
        message: e.response?.data?.error || t('task.join_reward.claim_fail'),
        type: 'error'
      });
      setShowAlert(true);
    }
  };

  return (
    <div className="page-wrapper-task">
      {/* Header */}
      <div className="top-bar">
        <button onClick={() => nav(-1)} className="top-tran">
          <ArrowLeft size={24} className="back-button-icon" />
        </button>
        <h1 className="top-h-text">{t('task.title')}</h1>
      </div>

      {/* 초대 보상 영역 */}
      <div
        onClick={() => setInviteOpen(o => !o)}
        className="invite-toggle-box"
      >
        <span className="invite-toggle-title">{t('task.invite_reward.title')}</span>
        {inviteOpen ? <ChevronUp /> : <ChevronDown />}
      </div>

      {/* 설명문구: 토글 전/후 항상 보임 */}
      <p className="invite-reward-description" style={{ whiteSpace: 'pre-line' }}>
        {t('task.invite_reward.description')}
      </p>
      {inviteOpen && (
        <div className="invite-reward-list">
          {inviteRewards.map(r => (
            <div key={r.id} className="invite-reward-card">
              <div>
                <p className="invite-reward-text">
                  {t('task.invite_reward.required', {
                    level: r.level,
                    required: r.required
                  })}
                </p>
                <p className="invite-reward-subtext">
                  {t('task.invite_reward.reward', { amount: r.amount })}
                </p>
                <p className="invite-reward-subtext">
                  ({r.count}/{r.required})
                </p>
              </div>
              <button
                disabled={r.claimed || r.count < r.required}
                onClick={() => claimInvite(r.id)}
                className={`invite-reward-button ${r.claimed
                  ? 'reward-btn-claimed'
                  : r.count < r.required
                    ? 'reward-btn-disabled'
                    : 'reward-btn-active'
                  }`}
              >
                {r.claimed
                  ? t('task.invite_reward.claimed')
                  : t('task.invite_reward.claim')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-box-container" style={{ whiteSpace: 'pre-line' }}>
        <p>{t('task.text2')}</p>
      </div>

      <div className="text-box-container" style={{ whiteSpace: 'pre-line' }}>
        <p>{t('task.text3')}</p>
      </div>

      {/* 가입 보너스 영역 - invite-reward-card 구조로 통일 */}
      <div className="join-reward-header">
        <span className="join-reward-title">{t('task.join_reward.title')}</span>
      </div>
      <div className="invite-reward-list">
        {joinRewards.map((jr, idx) => (
          <div key={jr.id} className="invite-reward-card">
            <div>
              <p className="invite-reward-text">
                {t('task.join_reward.step', { step: idx + 1 })}
              </p>
              <p className="invite-reward-subtext">
                {t('task.join_reward.description', { amount: jr.amount })}
              </p>
            </div>
            <button
              disabled={jr.claimed}
              onClick={() => claimJoin(jr.id)}
              className={`invite-reward-button ${jr.claimed ? 'reward-btn-disabled' : 'reward-btn-active'}`}
            >
              {jr.claimed ? t('task.join_reward.claimed') : t('task.join_reward.claim')}
            </button>
          </div>
        ))}
      </div>

      <AlertPopup
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
      />
    </div>
  );
}
