import React, { useState } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const CombinedView = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Mock data for the home screen
  const friends = [
    { id: 1, name: 'Sarah', x: 30, y: 35, distance: '500m', image: 'https://picsum.photos/seed/friend1/100/100', status: 'nearby' },
    { id: 2, name: 'Mike', x: 65, y: 55, distance: '1.2km', image: 'https://picsum.photos/seed/friend2/100/100', status: 'driving' },
    { id: 3, name: 'Alex', x: 20, y: 70, distance: '2.4km', image: 'https://picsum.photos/seed/friend3/100/100', status: 'idle' },
  ];

  const activeMeeting = {
    title: "Cafe study session",
    time: "2:00 PM",
    location: "Starbucks Gangnam",
    participants: 4
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-hidden relative font-sans">
      {/* Immersive Map Background */}
      <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 mix-blend-luminosity" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200")'}}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark/80"></div>

      {/* Top Header & Search */}
      <header className="relative z-30 px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 bg-card-dark/90 backdrop-blur-xl p-3 pr-4 rounded-3xl border border-white/5 shadow-2xl">
           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/10">
             <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full object-cover" alt="Me" />
           </div>
           <div className="flex-1">
             <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Live Status</p>
             </div>
             <p className="text-white font-extrabold text-sm truncate">{t('map_sample_location')}</p>
           </div>
           <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-inner">
             <span className="material-symbols-outlined text-xl">notifications</span>
           </button>
        </div>

        <div className="mt-4 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="w-full h-14 bg-card-dark/80 backdrop-blur-xl border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-xl" 
            placeholder={t('map_search_placeholder')} 
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
        </div>
      </header>

      {/* Map Content (Friends Pins) */}
      <main className="flex-1 relative z-10" onClick={() => setSelectedFriend(null)}>
         {friends.map(friend => (
           <div 
             key={friend.id} 
             className="absolute" 
             style={{ left: `${friend.x}%`, top: `${friend.y}%` }}
             onClick={(e) => {
               e.stopPropagation();
               setSelectedFriend(friend);
             }}
           >
             <div className={`relative group cursor-pointer transition-transform ${selectedFriend?.id === friend.id ? 'scale-125 z-20' : 'hover:scale-110'}`}>
               <div className={`w-14 h-14 rounded-full border-4 p-0.5 bg-background-dark shadow-2xl ${friend.status === 'nearby' ? 'border-primary' : 'border-orange-500'}`}>
                 <img src={friend.image} className="w-full h-full rounded-full object-cover" alt={friend.name} />
               </div>
               {friend.status === 'driving' && (
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-background-dark flex items-center justify-center text-white shadow-lg">
                   <span className="material-symbols-outlined text-[14px]">directions_car</span>
                 </div>
               )}
               {friend.status === 'nearby' && (
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                   {friend.distance}
                 </div>
               )}
               
               {/* Friend Tooltip */}
               <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-card-dark/95 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 shadow-xl transition-all ${selectedFriend?.id === friend.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                 <p className="text-xs font-bold text-white">{friend.name} <span className="text-gray-400 font-normal">{friend.status}</span></p>
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card-dark border-r border-b border-white/10 rotate-45"></div>
               </div>
             </div>
           </div>
         ))}

         {/* Current User Pulse */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center shadow-[0_0_20px_rgba(37,106,244,0.6)] relative z-10">
                 <span className="material-symbols-outlined text-white text-lg font-bold">my_location</span>
              </div>
            </div>
         </div>
      </main>

      {/* Quick Actions & Controls */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-3 z-30 transition-transform duration-500" style={{ transform: isExpanded ? 'translateY(-200%)' : 'none' }}>
        <button className="w-14 h-14 bg-card-dark/90 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/5 shadow-2xl hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">layers</span>
        </button>
        <button 
          onClick={() => onNavigate(ScreenType.CREATE_MEETING)}
          className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all active:scale-95 group relative"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
          <div className="absolute right-16 px-3 py-1 bg-card-dark text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-white/10">
            {t('meeting_create')}
          </div>
        </button>
      </div>

      {/* Dashboard Expandable Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-20px_80px_rgba(0,0,0,0.8)] ${isExpanded ? 'h-[90%]' : 'h-24'}`}
      >
        <div className="w-full h-full relative overflow-hidden flex flex-col pt-2">
          {/* Grab Handle */}
          <div className="w-full flex justify-center py-2" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition-colors"></div>
          </div>

          {!isExpanded && (
            <div className="px-6 flex items-center justify-between" onClick={() => setIsExpanded(true)}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {friends.map(f => (
                    <img key={f.id} src={f.image} className="w-8 h-8 rounded-full border-2 border-background-dark shadow-lg object-cover" alt={f.name} />
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{friends.length} Friends Online</p>
                  <p className="text-white text-xs font-bold">2 new messages from Sarah</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-bold">keyboard_arrow_up</span>
              </button>
            </div>
          )}

          {isExpanded && (
            <div className="px-6 pb-24 h-full flex flex-col pt-4 overflow-y-auto scrollbar-hide animate-fade-in-up">
              {/* Meeting Card */}
              <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary/20 p-4 rounded-bl-[2rem]">
                  <span className="material-symbols-outlined text-primary text-3xl">event</span>
                </div>
                <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t('meeting_upcoming')}</h4>
                <h3 className="text-white text-xl font-extrabold mb-1">{activeMeeting.title}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{activeMeeting.time}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="truncate">{activeMeeting.location}</span>
                </div>
                <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98]">
                  {t('meeting_details_title')}
                </button>
              </div>

              {/* Friends Horizontal List */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-black text-lg">{t('nav_friends')}</h3>
                  <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="text-primary text-xs font-bold uppercase tracking-widest">{t('meeting_view_all')}</button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {friends.map(f => (
                    <div key={f.id} className="flex flex-col items-center gap-2 shrink-0">
                      <div className="w-16 h-16 rounded-3xl p-0.5 border-2 border-white/5 bg-card-dark relative group">
                        <img src={f.image} className="w-full h-full rounded-[1.4rem] object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={f.name} />
                        {f.status === 'nearby' && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background-dark shadow-lg pulse"></div>}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{f.name}</span>
                    </div>
                  ))}
                  <button className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 hover:text-white hover:border-white/20 transition-all shrink-0">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              {/* Recent Chats */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black text-lg">{t('map_recent_chats')}</h3>
                  <button className="w-12 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-xl">edit_square</span>
                  </button>
                </div>
                <div className="space-y-6">
                   {friends.slice(0, 2).map((f, i) => (
                     <div key={f.id} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-colors">
                       <div className="relative">
                         <img src={f.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt={f.name} />
                         <div className="absolute -bottom-1 -right-1 bg-background-dark p-0.5 rounded-lg flex items-center justify-center border border-white/10">
                           <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                         </div>
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-0.5">
                           <h4 className="text-white font-bold">{f.name}</h4>
                           <span className="text-[10px] font-bold text-gray-600">12:30 PM</span>
                         </div>
                         <p className="text-xs text-gray-500 line-clamp-1 font-medium">{i === 0 ? "나 곧 도착해! 조금만 기다려줘 😊" : "오늘 약속 장소 여기 맞지? 📍"}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* Persistent Bottom Nav */}
          <nav className="absolute bottom-0 left-0 right-0 h-24 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-4">
             <button className="flex flex-col items-center gap-1.5 text-primary group">
               <div className="w-1 w-1 bg-primary rounded-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="material-symbols-outlined text-2xl">map</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_map')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">group</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_friends')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">calendar_month</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_meetings')}</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-all transform active:scale-90">
               <span className="material-symbols-outlined text-2xl">person</span>
               <span className="text-[9px] font-black uppercase tracking-[0.15em]">{t('nav_profile')}</span>
             </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CombinedView;
