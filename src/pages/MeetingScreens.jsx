import React, { useState } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { useFriends } from '../context/FriendsContext';
import { useModal } from '../context/ModalContext';
import GroupChat from '../components/GroupChat';
import { createMeeting } from '../utils/meetingService';

const ListScreen = ({ onNavigate, t, myMeetings, activeMeetingId, setActiveMeetingId, isEmailUser, currentUserId, showConfirm, leaveCurrentMeeting, deleteCurrentMeeting, showPrompt, updateMeetingName }) => {
  const handleAction = (e, meeting, isHost) => {
    e.stopPropagation();
    if (isHost) {
      showConfirm(t('meeting_confirm_delete_msg'), () => deleteCurrentMeeting(meeting.id));
    } else {
      showConfirm(t('meeting_confirm_leave_msg'), () => leaveCurrentMeeting(meeting.id, currentUserId));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">{t('nav_meetings')}</h1>
          <div className="flex gap-2">
            {isEmailUser && (
              <button 
                onClick={() => onNavigate(ScreenType.CREATE_MEETING)}
                className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-2xl font-bold">add</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="px-6 py-6 pb-2 opacity-50">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            {myMeetings.length > 0 ? t('meeting_status_active') : t('meeting_empty')}
          </span>
        </div>

        {myMeetings.map(meeting => {
          const isHost = meeting.hostId === currentUserId;
          const isActive = meeting.id === activeMeetingId;
          
          return (
            <div 
              key={meeting.id} 
              className={`px-6 py-5 flex gap-4 transition-all cursor-pointer items-center border-b border-white/5 ${isActive ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-white/5 active:bg-white/10'}`}
              onClick={() => { setActiveMeetingId(meeting.id); onNavigate(ScreenType.MEETING_DETAILS); }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${isActive ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-card-dark border-white/10'}`}>
                <span className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-gray-500'} text-2xl`}>
                  {isHost ? 'crown' : 'diversity_3'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 
                    className={`text-base font-bold truncate ${isActive ? 'text-white' : 'text-gray-300'} ${isHost ? 'hover:text-primary transition-colors cursor-pointer' : ''}`}
                    onClick={(e) => {
                      if (isHost) {
                        e.stopPropagation();
                        showPrompt(
                          t('meeting_rename_prompt') || "새로운 모임 이름을 입력하세요",
                          (newName) => updateMeetingName(meeting.id, newName),
                          meeting.title,
                          t('meeting_rename_title') || "모임명 변경"
                        );
                      }
                    }}
                  >
                    {meeting.title || 'Untitled Meeting'}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">
                  {isHost ? t('role_host') : t('role_member')} • {meeting.participants?.length || 0} 명 참여 중
                </p>
              </div>

              <button 
                onClick={(e) => handleAction(e, meeting, isHost)}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {isHost ? 'delete' : 'logout'}
                </span>
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
};

const CreateScreen = ({ onNavigate, t, currentUserId, showAlert }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      const meetingData = {
        title: name,
        location: '', // Optional location field
        status: 'active'
      };
      const userProfile = {
        nickname: user?.displayName || 'Unknown',
        avatar: user?.photoURL || (user?.displayName || '?').charAt(0)
      };
      await createMeeting(meetingData, currentUserId, userProfile);
      onNavigate(ScreenType.MEETINGS);
    } catch (err) {
      console.error(err);
      showAlert("모임 생성 실패", "오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-4 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="px-4 py-2 text-gray-400 font-bold text-sm uppercase tracking-widest">{t('cancel')}</button>
        <h2 className="text-lg font-extrabold text-white font-display uppercase tracking-widest">{t('meeting_new')}</h2>
        <div className="w-16"></div>
      </header>
      
      <main className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide pb-32">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">{t('meeting_name')}</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('meeting_name_placeholder')} 
            className="w-full h-16 bg-card-dark border border-white/5 rounded-2xl px-6 text-white text-lg font-bold placeholder:text-gray-700 focus:ring-2 focus:ring-primary/40 outline-none transition-all shadow-xl" 
          />
        </div>

        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
           <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                 <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                 <h4 className="text-sm font-bold text-white mb-1">모임 생성 안내</h4>
                 <p className="text-xs text-gray-500 leading-relaxed font-medium">
                   정식 회원만 모임을 생성할 수 있습니다. 모임 생성 시 고유 입장 코드가 생성되며, 이 코드를 통해 친구들을 초대할 수 있습니다.
                 </p>
              </div>
           </div>
        </div>
      </main>

      <div className="p-8 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 sticky bottom-24 left-0 right-0 z-20">
        <button 
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="w-full h-16 bg-primary disabled:opacity-50 disabled:bg-gray-700 rounded-2xl text-white font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all tracking-widest"
        >
          {loading ? (
             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined font-bold">rocket_launch</span>
              {t('meeting_new')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MeetingScreens = ({ currentScreen, onNavigate }) => {
  const { t } = useTranslation();
  const { showAlert, showConfirm, showPrompt } = useModal();
  const { myMeetings, activeMeetingId, setActiveMeetingId, isEmailUser, currentUserId, leaveCurrentMeeting, deleteCurrentMeeting, updateMeetingName } = useFriends();
  
  const activeMeeting = myMeetings.find(m => m.id === activeMeetingId) || myMeetings[0];

  switch (currentScreen) {
    case ScreenType.MEETINGS: 
      return (
        <ListScreen 
          onNavigate={onNavigate} 
          t={t} 
          myMeetings={myMeetings} 
          activeMeetingId={activeMeetingId} 
          setActiveMeetingId={setActiveMeetingId}
          isEmailUser={isEmailUser}
          currentUserId={currentUserId}
          showConfirm={showConfirm}
          leaveCurrentMeeting={leaveCurrentMeeting}
          deleteCurrentMeeting={deleteCurrentMeeting}
          showPrompt={showPrompt}
          updateMeetingName={updateMeetingName}
        />
      );
    case ScreenType.MEETING_DETAILS: 
      return (
        <div className="flex flex-col h-full bg-background-dark animate-fade-in shadow-inner">
          <div className="flex-1 overflow-hidden pb-20">
            <GroupChat 
              meetingTitle={activeMeeting?.title || "Untitled Meeting"} 
              meetingLocation={activeMeeting?.meetingLocation?.name || activeMeeting?.meetingLocation?.address || activeMeeting?.location} 
            />
          </div>
        </div>
      );
    case ScreenType.CREATE_MEETING: 
      return <CreateScreen onNavigate={onNavigate} t={t} currentUserId={currentUserId} showAlert={showAlert} />;
    default: 
      return <ListScreen onNavigate={onNavigate} t={t} myMeetings={myMeetings} setActiveMeetingId={setActiveMeetingId} />;
  }
};

export default MeetingScreens;
