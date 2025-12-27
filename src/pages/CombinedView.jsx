import React, { useState } from 'react';
import { ScreenType } from '../constants/ScreenType';

const CombinedView = ({ onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-hidden relative font-sans">
      {/* Immersive Map Background */}
      <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 mix-blend-luminosity" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200")'}}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark/80"></div>

      {/* Top Header & Search */}
      <header className="relative z-10 px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 bg-card-dark/90 backdrop-blur-xl p-3 pr-4 rounded-3xl border border-white/5 shadow-2xl">
           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
             <span className="material-symbols-outlined text-xl">location_on</span>
           </div>
           <div className="flex-1">
             <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Finding Friends...</p>
             </div>
             <p className="text-white font-extrabold text-sm truncate">Downtown, Manhattan NY</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-inner">
             <span className="material-symbols-outlined text-xl">notifications</span>
           </div>
        </div>

        <div className="mt-4 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="w-full h-14 bg-card-dark/80 backdrop-blur-xl border border-white/5 rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-xl" 
            placeholder="Search place or friends" 
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
        </div>
      </header>

      {/* Map Content (Friends Pins) */}
      <main className="flex-1 relative">
         <div className="absolute top-[20%] left-[30%]">
           <div className="relative group cursor-pointer">
             <div className="w-14 h-14 rounded-full border-4 border-primary p-0.5 bg-background-dark shadow-2xl transition-transform group-hover:scale-110">
               <img src="https://picsum.photos/seed/friend1/100/100" className="w-full h-full rounded-full object-cover" alt="Sarah" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-white shadow-lg">9m</div>
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card-dark/95 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               <p className="text-[10px] font-bold text-white">Sarah is nearby</p>
             </div>
           </div>
         </div>

         <div className="absolute bottom-[35%] right-[25%]">
           <div className="relative group cursor-pointer">
             <div className="w-12 h-12 rounded-full border-4 border-orange-500 p-0.5 bg-background-dark shadow-2xl transition-transform group-hover:scale-110">
               <img src="https://picsum.photos/seed/friend2/100/100" className="w-full h-full rounded-full object-cover grayscale" alt="Mike" />
             </div>
             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card-dark rounded-full border border-white/10 flex items-center justify-center text-orange-500"><span className="material-symbols-outlined text-[12px] font-bold">directions_car</span></div>
           </div>
         </div>

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

      {/* Map Controls */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-3 z-10">
        <button className="w-12 h-12 bg-card-dark/90 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/5 shadow-2xl hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">layers</span>
        </button>
        <button className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all active:scale-95">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>

      {/* Chat Expandable Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[3rem] z-20 transition-all duration-500 ease-in-out shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ${isExpanded ? 'h-[85%]' : 'h-20'}`}
      >
        <div className="w-full flex flex-col items-center py-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1.5 bg-white/10 rounded-full mb-1"></div>
          {!isExpanded && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img src="https://picsum.photos/seed/a/100/100" className="w-6 h-6 rounded-full border-2 border-background-dark" alt="User" />
                <img src="https://picsum.photos/seed/b/100/100" className="w-6 h-6 rounded-full border-2 border-background-dark" alt="User" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">3 New Messages</p>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="px-6 pb-24 h-full flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-extrabold text-white tracking-tight">Recent Chats</h2>
               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary"><span className="material-symbols-outlined">edit_square</span></button>
            </div>
            <div className="space-y-6 overflow-y-auto scrollbar-hide flex-1">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer">
                   <div className="relative">
                     <img src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-14 h-14 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" alt="User" />
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background-dark"></div>
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center mb-0.5">
                       <h4 className="text-white font-bold">Design Group</h4>
                       <span className="text-[10px] font-bold text-gray-600">12:30 PM</span>
                     </div>
                     <p className="text-xs text-gray-500 line-clamp-1 font-medium italic">"See you at the coffee shop in 5!"</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Bottom Tab Nav Integrated in Sheet Footer */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-background-dark border-t border-white/5 flex items-center justify-around px-4">
           <button className="flex flex-col items-center gap-1 text-primary">
             <span className="material-symbols-outlined">map</span>
             <span className="text-[9px] font-bold uppercase tracking-widest">Map</span>
           </button>
           <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
             <span className="material-symbols-outlined">group</span>
             <span className="text-[9px] font-bold uppercase tracking-widest">Friends</span>
           </button>
           <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
             <span className="material-symbols-outlined">calendar_month</span>
             <span className="text-[9px] font-bold uppercase tracking-widest">Meet</span>
           </button>
           <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
             <span className="material-symbols-outlined">person</span>
             <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
           </button>
        </nav>
      </div>
    </div>
  );
};

export default CombinedView;
