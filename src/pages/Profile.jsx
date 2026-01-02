import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { useModal } from '../context/ModalContext';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { subscribeToMeetings } from '../utils/meetingService';

const Profile = ({ onNavigate, onLogout, deferredPrompt, onInstallSuccess }) => {
  const { t } = useTranslation();
  const { showAlert } = useModal();
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = subscribeToMeetings(user.uid, (data) => {
        setMeetings(data);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        // Simple visual feedback could be added here
        showAlert(t('settings_code_copied') || "Group code copied!");
    });
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      onInstallSuccess();
    }
  };

  const renderSectionHeader = (title) => (
    <h3 className="px-6 pt-8 pb-3 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{title}</h3>
  );

  const renderSettingItem = ({ icon, label, color, value, isToggle, isLast, onClick, isActive, onToggle }) => (
    <div 
      className={`flex items-center justify-between p-5 px-6 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 ${isLast ? 'border-none' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/20`}>
          <span className="material-symbols-outlined text-white text-xl">{icon}</span>
        </div>
        <span className="text-sm font-bold text-white tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-xs font-bold text-gray-500 uppercase">{value}</span>}
        {isToggle ? (
           <div 
             className={`w-11 h-6 ${isActive ? 'bg-primary' : 'bg-gray-700'} rounded-full relative p-0.5 transition-colors cursor-pointer`}
             onClick={(e) => { e.stopPropagation(); onToggle(); }}
           >
             <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-all ${isActive ? 'right-0.5' : 'left-0.5'}`}></div>
           </div>
        ) : (
           <span className="material-symbols-outlined text-gray-700 text-lg">chevron_right</span>
        )}
      </div>
    </div>
  );

  const [toggles, setToggles] = useState({
    sound: true,
    push: true,
    chat: true,
    nearby: false,
    online: true,
  });

  const handleToggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-background-dark/95 backdrop-blur-md z-20 font-display">
        <button onClick={() => onNavigate(ScreenType.MAP)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-all active:scale-95">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-extrabold text-white">{t('settings_title')}</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="flex flex-col items-center pt-10 pb-4">
          <div className="w-28 h-28 rounded-full bg-card-dark flex items-center justify-center border-4 border-white/5 shadow-2xl ring-2 ring-primary/20">
            <span className="material-symbols-outlined text-gray-700 text-5xl">person</span>
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-white font-display">Alex Doe</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 opacity-60">@alexdoe</p>
        </div>

        {meetings.length > 0 && (
          <>
            {renderSectionHeader(t('settings_my_groups') || '참여 중인 그룹')}
            <div className="mx-6 rounded-[2.5rem] bg-card-dark border border-white/5 overflow-hidden shadow-xl">
              {meetings.map((meeting, index) => (
                renderSettingItem({
                  icon: "group",
                  label: meeting.groupCode,
                  color: "bg-pink-600",
                  value: t('settings_copy_code') || "복사",
                  onClick: () => handleCopyCode(meeting.groupCode),
                  isLast: index === meetings.length - 1
                })
              ))}
            </div>
          </>
        )}

        {renderSectionHeader(t('settings_general'))}
        <div className="mx-6 rounded-[2.5rem] bg-card-dark border border-white/5 overflow-hidden shadow-xl">
          {renderSettingItem({
            icon: "language",
            label: t('settings_language'),
            color: "bg-blue-600",
            value: t('settings_language_value'),
            onClick: () => {} // Simplified for now
          })}
          {renderSettingItem({
            icon: "volume_up",
            label: t('settings_sound'),
            color: "bg-purple-600",
            isToggle: true,
            isActive: toggles.sound,
            onToggle: () => handleToggle('sound'),
            isLast: true
          })}
        </div>

        {renderSectionHeader(t('settings_notifications'))}
        <div className="mx-6 rounded-[2.5rem] bg-card-dark border border-white/5 overflow-hidden shadow-xl">
          {renderSettingItem({
            icon: "notifications",
            label: t('settings_push'),
            color: "bg-red-500",
            isToggle: true,
            isActive: toggles.push,
            onToggle: () => handleToggle('push')
          })}
          {renderSettingItem({
            icon: "chat_bubble",
            label: t('settings_new_message'),
            color: "bg-emerald-500",
            isToggle: true,
            isActive: toggles.chat,
            onToggle: () => handleToggle('chat')
          })}
          {renderSettingItem({
            icon: "near_me",
            label: t('settings_nearby_friends'),
            color: "bg-orange-500",
            isToggle: true,
            isActive: toggles.nearby,
            onToggle: () => handleToggle('nearby'),
            isLast: true
          })}
        </div>

        {renderSectionHeader(t('settings_privacy'))}
        <div className="mx-6 rounded-[2.5rem] bg-card-dark border border-white/5 overflow-hidden shadow-xl">
          {renderSettingItem({
            icon: "person_search",
            label: t('settings_who_find'),
            color: "bg-indigo-600",
            value: t('settings_who_find_value')
          })}
          {renderSettingItem({
            icon: "visibility",
            label: t('settings_show_online'),
            color: "bg-teal-500",
            isToggle: true,
            isActive: toggles.online,
            onToggle: () => handleToggle('online')
          })}
          {renderSettingItem({
            icon: "block",
            label: t('settings_blocked'),
            color: "bg-rose-500",
            isLast: true
          })}
        </div>

        {deferredPrompt && (
          <>
            {renderSectionHeader(t('settings_support'))}
            <div className="mx-6 rounded-[2.5rem] bg-card-dark border border-white/5 overflow-hidden shadow-xl">
              {renderSettingItem({
                icon: "download",
                label: t('settings_install'),
                color: "bg-emerald-600",
                onClick: handleInstallClick,
                isLast: true
              })}
            </div>
          </>
        )}

        <div className="px-6 pt-10">
          <button 
            onClick={onLogout}
            className="w-full h-16 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[2rem] font-extrabold text-base flex items-center justify-center gap-3 transition-all border border-red-500/10 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            {t('settings_logout')}
          </button>
        </div>
      </main>

       <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-50">
        <button onClick={() => onNavigate(ScreenType.MAP)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_map')}</span>
        </button>
        <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_friends')}</span>
        </button>
        <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">forum</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_meetings')}</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_profile')}</span>
        </button>
      </nav>
    </div>
  );
};

export default Profile;
