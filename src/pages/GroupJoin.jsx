import React, { useState, useEffect } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { useModal } from '../context/ModalContext';
import { useFriends } from '../context/FriendsContext';
import { signInAsGuest, joinMeetingByCode } from '../utils/meetingService';

const GroupJoin = ({ onNavigate, groupCode }) => {
  const { t } = useTranslation();
  const { showAlert } = useModal();
  const { setActiveMeetingId } = useFriends();
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState(groupCode || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupCode) {
      setCode(groupCode);
    }
  }, [groupCode]);

  const handleJoin = async () => {
    if (!nickname || !code) return;
    setLoading(true);

    try {
        // 1. Sign in anonymously with the nickname
        const user = await signInAsGuest(nickname);
        
        // 2. Join the actual meeting in Firestore
        const userProfile = {
            nickname: nickname,
            avatar: nickname.charAt(0)
        };
        const meeting = await joinMeetingByCode(code, user.uid, userProfile);
        setActiveMeetingId(meeting.id);
        console.log("[GroupJoin] Successfully joined meeting and set active ID:", meeting.id);
        
        setLoading(false);
        // Redirect to meeting list or map
        onNavigate(ScreenType.MEETINGS);
    } catch (err) {
        console.error("Guest join failed:", err);
        if (err.code === 'auth/admin-restricted-operation') {
            showAlert("Firebase Console에서 'Anonymous(익명) 로그인' 기능이 활성화되어 있지 않습니다. 설정이 필요합니다.", "설정 확인 필요");
        } else {
            showAlert(err.message || "Failed to join as guest");
        }
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans px-6">
      <header className="pt-10 pb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight font-display mb-2">{t('group_join_title') || "모임 참가"}</h1>
        <p className="text-gray-400 font-medium leading-relaxed">{t('group_join_desc') || "초대받은 코드를 입력하여 모임에 참여하세요."}</p>
      </header>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('auth_nickname')}</label>
           <div className="relative flex items-center">
             <span className="absolute left-4 text-gray-500">
               <span className="material-symbols-outlined">person</span>
             </span>
             <input
               className="w-full h-14 bg-card-dark border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
               value={nickname}
               onChange={(e) => setNickname(e.target.value)}
               placeholder={t('auth_nickname_placeholder')}
             />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_code')}</label>
           <div className="relative flex items-center">
             <span className="absolute left-4 text-gray-500">
               <span className="material-symbols-outlined">key</span>
             </span>
             <input
               className="w-full h-14 bg-card-dark border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
               value={code}
               onChange={(e) => setCode(e.target.value)}
               placeholder="ABC123"
             />
           </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={!nickname || !code || loading}
          className={`w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(!nickname || !code || loading) ? 'opacity-50' : ''}`}
        >
          {loading ? 'Joining...' : (t('meeting_join') || "모임 참가")}
          {!loading && <span className="material-symbols-outlined">login</span>}
        </button>

        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {t('group_join_existing_user') || "기존 가입자라면 로그인 한 후에 모임 참가 기능을 이용하세요"}
          </p>
          <button
            onClick={() => onNavigate(ScreenType.LOGIN)}
            className="text-primary font-bold hover:underline transition-all flex items-center justify-center gap-1 mx-auto"
          >
            {t('auth_login')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupJoin;
