import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const FriendScreens = ({ currentScreen, onNavigate }) => {
  const { t } = useTranslation();

  const FriendsList = () => (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-4 sticky top-0 bg-background-dark/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight font-display">{t('nav_friends') || "Friends"}</h1>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-95 transition-all">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-95 transition-all">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">search</span>
          <input 
            type="text" 
            placeholder={t('search_placeholder') || "Search by username..."} 
            className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          />
        </div>
      </header>

      <main className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide pb-24">
        {/* Requests Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{t('requests_title') || "Requests"} (2)</h3>
            <button onClick={() => onNavigate(ScreenType.FRIEND_REQUESTS)} className="text-[10px] font-bold text-primary uppercase">{t('view_all') || "View All"}</button>
          </div>
          <div className="space-y-3">
             <div className="p-4 bg-card-dark rounded-3xl border border-white/5 flex items-center gap-4 shadow-sm">
                <div className="relative">
                  <img src="https://picsum.photos/seed/sarah/100/100" className="w-12 h-12 rounded-full object-cover" alt="Sarah" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card-dark rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-white">Sarah Jenkins</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{t('wants_to_share_location') || "Wants to share location"}</p>
                </div>
                <div className="flex gap-2">
                   <button className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                     <span className="material-symbols-outlined text-xl">close</span>
                   </button>
                   <button className="px-4 bg-primary rounded-xl text-white text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all">
                     {t('accept') || "Accept"}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Friend List */}
        <div className="space-y-2 pt-2">
          <h3 className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">{t('all_friends') || "All Friends"} (42)</h3>
          {[
            { name: 'Jessica Pearson', status: 'Downtown • 2km away', color: 'text-primary', avatar: '10', online: true },
            { name: 'Louis Litt', status: 'Last seen 2h ago', color: 'text-gray-600', avatar: '11', online: false },
            { name: 'Donna Paulsen', status: 'Central Park • 500m away', color: 'text-primary', avatar: '12', online: true },
            { name: 'Rachel Zane', status: 'Idle for 10m', color: 'text-amber-400', avatar: '13', online: true },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer border-b border-white/5 last:border-0 group">
              <div className="relative">
                <img src={`https://picsum.photos/seed/${f.avatar}/100/100`} className="w-14 h-14 rounded-full object-cover shadow-xl group-hover:scale-110 transition-transform" alt={f.name} />
                {f.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[3px] border-background-dark rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-white truncate">{f.name}</p>
                <div className={`flex items-center gap-1.5 ${f.color} text-[10px] font-bold uppercase tracking-widest mt-0.5`}>
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {f.status}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                </button>
                <button className="w-10 h-10 rounded-full text-gray-600 flex items-center justify-center hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">more_vert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 max-w-md mx-auto z-50">
        <button onClick={() => onNavigate(ScreenType.MAP)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_map') || "Map"}</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_friends') || "Friends"}</span>
        </button>
        <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_meetings') || "Meet"}</span>
        </button>
        <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_profile') || "Profile"}</span>
        </button>
      </nav>
    </div>
  );

  return <FriendsList />;
};

export default FriendScreens;
