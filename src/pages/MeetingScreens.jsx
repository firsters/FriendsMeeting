import React from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';

const MeetingScreens = ({ currentScreen, onNavigate }) => {
  const { t } = useTranslation();

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 max-w-md mx-auto z-50">
       <button onClick={() => onNavigate(ScreenType.MAP)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">map</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_map') || "Map"}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">group</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_friends') || "Friends"}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-primary">
         <span className="material-symbols-outlined">calendar_month</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_meetings') || "Meet"}</span>
       </button>
       <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
         <span className="material-symbols-outlined">person</span>
         <span className="text-[9px] font-bold uppercase tracking-widest">{t('nav_profile') || "Profile"}</span>
       </button>
    </nav>
  );

  const ListScreen = () => (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-4 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">{t('meetings_title') || "My Meetings"}</h1>
          <button 
            onClick={() => onNavigate(ScreenType.CREATE_MEETING)}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl">
          <button className="flex-1 py-3 rounded-xl text-sm font-bold bg-white text-primary shadow-sm">{t('meetings_upcoming') || "Upcoming"}</button>
          <button className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500">{t('meetings_active') || "Active"}</button>
          <button className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500">{t('meetings_past') || "Past"}</button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-6 overflow-y-auto scrollbar-hide pb-24">
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 overflow-hidden group cursor-pointer active:scale-[0.98] transition-all" onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}>
           <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
             <span className="text-[8px] font-bold text-white uppercase tracking-widest">{t('live_now') || "Live Now"}</span>
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
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Started 15m ago</span>
           </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">{t('time_tomorrow') || "Tomorrow"}</h4>
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
                <span className="px-2.5 py-1 bg-blue-500/10 text-primary text-[9px] font-bold rounded-lg border border-primary/20 uppercase">Upcoming</span>
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
      {renderBottomNav()}
    </div>
  );

  const CreateScreen = () => (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-4 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="text-gray-400 font-bold text-sm">{t('cancel') || "Cancel"}</button>
        <h2 className="text-lg font-extrabold text-white font-display">{t('create_meeting_title') || "New Meeting"}</h2>
        <div className="w-12"></div>
      </header>
      
      <main className="flex-1 p-6 space-y-8 overflow-y-auto scrollbar-hide pb-32">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_name_label') || "Meeting Name"}</label>
          <input 
            type="text" 
            placeholder="e.g. Dinner at Mario's" 
            className="w-full h-14 bg-card-dark border-none rounded-2xl px-5 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_date_label') || "Date"}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">calendar_today</span>
              <input type="text" value="Today" readOnly className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 text-white font-bold outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_time_label') || "Time"}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">schedule</span>
              <input type="text" value="7:00 PM" readOnly className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 text-white font-bold outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">{t('meeting_location_label') || "Location"}</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-xl">search</span>
            <input type="text" placeholder={t('search_location_placeholder') || "Search for a location"} className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
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
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('invite_friends') || "Invite Friends"}</label>
            <button className="text-[10px] font-bold text-primary uppercase">{t('view_all') || "View All"}</button>
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
          {t('create_meeting_btn') || "Create Meeting"}
        </button>
      </div>
    </div>
  );

  const DetailsScreen = () => (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-4 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-extrabold text-white font-display">{t('meeting_details_title') || "Meeting Details"}</h2>
        <button className="p-2 -mr-2 rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white">more_horiz</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide pb-40">
        <div className="p-6">
          <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden shadow-2xl group mb-8">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-xl">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Meeting Point</p>
                <p className="text-base font-extrabold">Joe's Pizza, Downtown</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live Status
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Friday Night Dinner</h1>
            <p className="text-gray-500 font-bold text-sm">Started 15 mins ago</p>
          </div>
        </div>

        <div className="h-px w-full bg-white/5 mx-auto max-w-[80%] my-2"></div>

        <div className="px-6 py-6 space-y-8">
          <div>
            <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Host</h3>
            <div className="flex items-center p-4 rounded-3xl bg-card-dark border border-white/5">
              <div className="relative">
                <img src="https://picsum.photos/seed/sarah/100/100" className="w-14 h-14 rounded-full border-2 border-primary object-cover" alt="Sarah" />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-card-dark">HOST</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-base font-extrabold text-white">Sarah Chen</p>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Location shared</p>
              </div>
              <button className="text-gray-600"><span className="material-symbols-outlined">info</span></button>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Who's Here (5)</h3>
               <button className="text-[10px] font-bold text-primary uppercase">Invite +</button>
             </div>
             <div className="space-y-3">
               {[
                 { name: 'Mike Ross', status: 'Arrived', color: 'text-emerald-400', dot: 'bg-emerald-500', avatar: '77' },
                 { name: 'Harvey Specter', status: '2 min away • Driving', color: 'text-amber-400', dot: 'bg-amber-500', avatar: '88' },
                 { name: 'Donna Paulsen', status: '15 min away', color: 'text-gray-600', dot: 'bg-gray-700', avatar: '99' },
               ].map((p, i) => (
                 <div key={i} className="flex items-center p-4 rounded-3xl bg-card-dark border border-white/5">
                   <div className="relative shrink-0">
                     <img src={`https://picsum.photos/seed/${p.avatar}/100/100`} className="w-12 h-12 rounded-full object-cover shadow-lg" alt={p.name} />
                     <div className={`absolute bottom-0 right-0 w-3 h-3 ${p.dot} border-2 border-card-dark rounded-full`}></div>
                   </div>
                   <div className="ml-4 flex-1">
                     <p className="text-sm font-extrabold text-white">{p.name}</p>
                     <p className={`text-[10px] font-bold uppercase tracking-widest ${p.color}`}>{p.status}</p>
                   </div>
                   <button className="text-red-500/50 hover:text-red-500 p-2 transition-colors"><span className="material-symbols-outlined text-xl">person_remove</span></button>
                 </div>
               ))}
             </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <span className="material-symbols-outlined text-primary text-xl">security</span>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Location Active</p>
              <p className="text-xs text-gray-500 leading-tight">Your precise location is currently being shared with all participants of this meeting.</p>
            </div>
          </div>
        </div>
      </main>

      <div className="p-6 pb-12 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 absolute bottom-0 left-0 right-0 z-20 space-y-3">
        <button className="w-full h-14 bg-red-500 rounded-xl text-white font-bold text-base shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined">cancel_presentation</span>
          End Meeting
        </button>
        <button className="w-full h-14 bg-white/5 rounded-xl text-white font-bold text-base flex items-center justify-center active:scale-[0.98] transition-all">
          Leave Quietly
        </button>
      </div>
    </div>
  );

  switch (currentScreen) {
    case ScreenType.MEETINGS: return <ListScreen />;
    case ScreenType.CREATE_MEETING: return <CreateScreen />;
    case ScreenType.MEETING_DETAILS: return <DetailsScreen />;
    default: return <ListScreen />;
  }
};

export default MeetingScreens;
