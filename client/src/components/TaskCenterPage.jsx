// 📁 src/pages/TaskCenterPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TaskCenterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  // 초대 보상
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [inviteRewards, setInviteRewards] = useState([]);

  // 가입 보너스
  const [joinRewards, setJoinRewards] = useState([]);

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
      await axios.post(`/api/mydata/invite-rewards/claim/${id}`, {}, { withCredentials: true });
      setInviteRewards(rs => rs.map(x => x.id===id ? { ...x, claimed:true } : x));
      alert(t('task.invite_reward.claimed'));
    } catch (e) {
      alert(e.response?.data?.error || t('task.invite_reward.claim_fail'));
    }
  };

  const claimJoin = async id => {
    try {
      await axios.post(`/api/mydata/join-rewards/claim/${id}`, {}, { withCredentials: true });
      setJoinRewards(rs => rs.map(x => x.id===id ? { ...x, claimed:true } : x));
      alert(t('task.join_reward.claimed'));
    } catch (e) {
      alert(e.response?.data?.error || t('task.join_reward.claim_fail'));
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={()=>nav(-1)} className="mr-2">
          <ArrowLeft size={24} className="text-yellow-200"/>
        </button>
        <h1 className="text-xl font-semibold">{t('task.title')}</h1>
      </div>

      {/*** 초대 보상 영역 ***/}
      <div
        onClick={() => setInviteOpen(o => !o)}
        className="flex justify-between items-center p-4 bg-[#2c1f0f] rounded mb-0 cursor-pointer"
      >
        <span className="font-medium">{t('task.invite_reward.title')}</span>
        {inviteOpen ? <ChevronUp/> : <ChevronDown/>}
      </div>
      {/* 설명문구: 토글 전/후 항상 보임 */}
      <p className="p-4 bg-[#2c1f0f] rounded-b mb-6 text-sm text-yellow-300">
        {t('task.invite_reward.description')}
      </p>
      {inviteOpen && (
        <div className="space-y-2 mb-8">
          {inviteRewards.map(r => (
            <div key={r.id} className="flex justify-between items-center p-3 bg-[#3a270e] rounded">
              <div>
                <p className="text-sm">
                  {t('task.invite_reward.required', {
                    level: r.level,
                    required: r.required
                  })}
                </p>
                <p className="text-xs text-yellow-300">
                  {t('task.invite_reward.reward', { amount: r.amount })}
                </p>
                <p className="text-xs text-yellow-300">
                  ({r.count}/{r.required})
                </p>
              </div>
              <button
                disabled={r.claimed || r.count < r.required}
                onClick={()=>claimInvite(r.id)}
                className={`py-1 px-3 rounded text-sm font-semibold
                  ${r.claimed
                    ? 'bg-gray-600 text-gray-300'
                    : r.count < r.required
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-600 text-black'
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

      {/*** 가입 보너스 영역 ***/}
      <div className="p-4 bg-[#2c1f0f] rounded mb-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{t('task.join_reward.title')}</span>
          {/* 수령 가능 횟수 표시: 0/1 또는 1/1 */}
          {joinRewards.map(jr => (
            <span key={jr.id} className="text-sm text-yellow-300">
              ({ jr.claimed ? 1 : 0 }/1)
            </span>
          ))}
        </div>
        <p className="mt-1 text-sm text-yellow-300">
          {joinRewards.map(jr => 
            t('task.join_reward.description', { amount: jr.amount })
          )}
        </p>
        <div className="mt-3 flex justify-end">
          {joinRewards.map(jr => (
            <button
              key={jr.id}
              disabled={jr.claimed}
              onClick={()=>claimJoin(jr.id)}
              className={`py-1 px-3 rounded text-sm font-semibold
                ${jr.claimed
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-yellow-600 text-black'
                }`}
            >
              {jr.claimed
                ? t('task.join_reward.claimed')
                : t('task.join_reward.claim')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
