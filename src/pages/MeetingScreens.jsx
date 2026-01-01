import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { useFriends } from '../context/FriendsContext';
import GroupChat from '../components/GroupChat';

const RenderBottomNav = ({ onNavigate, t, currentScreen }) => (
  <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-50">
     <button onClick={() => onNavigate(ScreenType.MAP)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
       <span className="material-symbols-outlined">map</span>
       <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_map')}</span>
     </button>
     <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
       <span className="material-symbols-outlined">group</span>
       <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_friends')}</span>
     </button>
     <button onClick={() => onNavigate(ScreenType.MEETINGS)} className={`flex flex-col items-center gap-1 ${currentScreen === ScreenType.MEETINGS ? 'text-primary' : 'text-gray-600 hover:text-white transition-colors'}`}>
       <span className="material-symbols-outlined">calendar_month</span>
       <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_meetings')}</span>
     </button>
     <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
       <span className="material-symbols-outlined">person</span>
       <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_profile')}</span>
     </button>
  </nav>
);

const ListScreen = ({ onNavigate, t, guestMeetings }) => (
  <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
    <header className="px-6 pt-10 pb-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">{t('meeting_my_meetings')}</h1>
        <button 
          onClick={() => onNavigate(ScreenType.CREATE_MEETING)}
          className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <div className="flex p-1 bg-white/5 rounded-2xl">
        <button className="flex-1 py-3 rounded-xl text-sm font-bold bg-white text-primary shadow-sm">{t('meeting_upcoming')}</button>
        <button className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500">{t('meeting_status_active')}</button>
        <button className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500">{t('meeting_past')}</button>
      </div>
    </header>

    <main className="flex-1 px-6 space-y-6 overflow-y-auto scrollbar-hide pb-24">
      {/* Render Guest Meetings */}
      {guestMeetings.map(meeting => (
        <div key={meeting.id} className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 overflow-hidden group cursor-pointer active:scale-[0.98] transition-all" onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}>
          <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">{t('meeting_status_live')}</span>
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">diversity_3</span>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-white mb-0.5">{meeting.title}</h3>
              <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Map View Enabled
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {meeting.participants.map((p, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center border-2 border-background-dark text-[10px] text-white font-bold" title={p.name}>
                  {p.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest text-[#FF4D8D] animate-pulse">{t('nav_alerts')}</span>
          </div>
        </div>
      ))}

      <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 overflow-hidden group cursor-pointer active:scale-[0.98] transition-all" onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}>
         <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
           <span className="text-[8px] font-bold text-white uppercase tracking-widest">{t('meeting_status_live')}</span>
         </div>
         <div className="flex gap-4">
           <div className="w-16 h-16 rounded-2xl bg-cover bg-center shrink-0 shadow-lg" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1543269865-cbf427effbad?w=100")'}}></div>
           <div className="flex-1 pt-1">
             <h3 className="text-lg font-bold text-white mb-0.5">Friday Night Dinner</h3>
             <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
               <span className="material-symbols-outlined text-sm">location_on</span>
               Joe's Pizza, Downtown
             </div>
           </div>
         </div>
         <div className="mt-4 flex items-center justify-between">
           <div className="flex -space-x-2">
             {[1, 2, 3].map((_, i) => (
               <img key={i} src={`https://picsum.photos/seed/${i + 50}/100/100`} className="w-7 h-7 rounded-full border-2 border-background-dark object-cover" alt="Avatar" />
             ))}
             <div className="w-7 h-7 rounded-full bg-surface-dark flex items-center justify-center text-[8px] font-bold text-gray-400 border-2 border-background-dark">+5</div>
           </div>
           <span className="text-[10px] font-bold text-primary uppercase tracking-widest text-emerald-400">3 {t('dashboard_new_messages')}</span>
         </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-4 mb-4">
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">{t('meeting_tomorrow')}</h4>
          <div className="h-px w-full bg-white/5"></div>
        </div>
        
        <div className="space-y-4">
          <div className="p-5 bg-card-dark rounded-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer active:scale-[0.98]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold mb-1">Coffee with Design Team</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  10:00 AM - 11:30 AM
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/10 text-primary text-[9px] font-bold rounded-lg border border-primary/20 uppercase">{t('meeting_status_upcoming')}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                <span className="material-symbols-outlined text-base">storefront</span>
                Starbucks Reserve
              </div>
              <div className="flex -space-x-2">
                 <img src="https://picsum.photos/seed/a/100/100" className="w-7 h-7 rounded-full border-2 border-background-dark" alt="Avatar" />
                 <img src="https://picsum.photos/seed/b/100/100" className="w-7 h-7 rounded-full border-2 border-background-dark" alt="Avatar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <RenderBottomNav onNavigate={onNavigate} t={t} currentScreen={ScreenType.MEETINGS} />
  </div>
);

const CreateScreen = ({ onNavigate, t }) => (
  <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
    <header className="px-4 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
      <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="text-gray-400 font-bold text-sm">{t('cancel')}</button>
      <h2 className="text-lg font-extrabold text-white font-display">{t('meeting_new')}</h2>
      <div className="w-12"></div>
    </header>
    
    <main className="flex-1 p-6 space-y-8 overflow-y-auto scrollbar-hide pb-32">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_name')}</label>
        <input 
          type="text" 
          placeholder={t('meeting_name_placeholder')} 
          className="w-full h-14 bg-card-dark border-none rounded-2xl px-5 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
        />
      </div>

       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_date')}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">calendar_today</span>
            <input type="text" value={t('meeting_tomorrow')} readOnly className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 text-white font-bold outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_time')}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">schedule</span>
            <input type="text" value="7:00 PM" readOnly className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 text-white font-bold outline-none" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_location')}</label>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">search</span>
          <input type="text" placeholder={t('meeting_location_placeholder')} className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
            <span className="material-symbols-outlined text-xl">my_location</span>
          </button>
        </div>
        <div className="w-full h-40 rounded-3xl overflow-hidden relative border border-white/5">
           <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400")'}}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
           <div className="absolute bottom-4 left-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-white text-base">location_on</span>
             </div>
             <div>
               <p className="text-white text-sm font-bold">Mario's Italian</p>
               <p className="text-gray-400 text-[10px]">123 Pasta Lane, NY</p>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('meeting_invite_friends')}</label>
          <button className="text-[10px] font-bold text-primary uppercase">{t('meeting_view_all')}</button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <button className="w-14 h-14 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-all shrink-0">
            <span className="material-symbols-outlined">add</span>
          </button>
          {[1, 2, 3, 4].map(i => (
            <img key={i} src={`https://picsum.photos/seed/${i + 80}/100/100`} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-primary" alt="Friend" />
          ))}
        </div>
      </div>
    </main>

    <div className="p-6 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 absolute bottom-0 left-0 right-0 z-20">
      <button 
        onClick={() => onNavigate(ScreenType.MEETINGS)}
        className="w-full h-16 bg-primary rounded-2xl text-white font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined">check_circle</span>
        Create Meeting
      </button>
    </div>
  </div>
);

const MeetingScreens = ({ currentScreen, onNavigate }) => {
  const { t } = useTranslation();
  const { guestMeetings } = useFriends();

  switch (currentScreen) {
    case ScreenType.MEETINGS: 
      return <ListScreen onNavigate={onNavigate} t={t} guestMeetings={guestMeetings} />;
    case ScreenType.CREATE_MEETING: 
      return <CreateScreen onNavigate={onNavigate} t={t} />;
    case ScreenType.MEETING_DETAILS: 
      return <GroupChat onBack={() => onNavigate(ScreenType.MEETINGS)} meetingTitle="Friday Night Dinner" />;
    default: 
      return <ListScreen onNavigate={onNavigate} t={t} guestMeetings={guestMeetings} />;
  }
};

export default MeetingScreens;
