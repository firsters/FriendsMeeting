
import React, { useState } from 'react';
import { ScreenType } from '../types';

interface MapViewProps {
  onNavigate: (screen: ScreenType) => void;
}

const MapView: React.FC<MapViewProps> = ({ onNavigate }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const friends = [
    { name: 'Sarah', x: '25%', y: '35%', color: 'bg-green-500', avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { name: 'Mike', x: '75%', y: '28%', color: 'bg-yellow-500', avatar: 'https://picsum.photos/seed/mike/100/100' },
    { name: 'Tom', x: '60%', y: '15%', color: 'bg-emerald-400', avatar: 'https://picsum.photos/seed/tom/100/100', dist: '800m' },
    { name: 'Jess', x: '85%', y: '45%', color: 'bg-primary', avatar: 'https://picsum.photos/seed/jess/100/100', dist: '1.2km' },
  ];

  return (
    <div className="relative h-full flex flex-col bg-background-dark">
      {/* Map Section */}
      <div className="relative h-[60%] w-full bg-slate-800 overflow-hidden">
        {/* Placeholder Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 grayscale-[0.2]"
          style={{backgroundImage: 'url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200")'}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {/* Top Controls */}
        <div className="absolute top-12 left-0 right-0 px-5 flex justify-between items-center z-30">
          <button className="w-11 h-11 bg-surface-dark/60 backdrop-blur-md rounded-full text-white border border-white/10 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <div className="bg-surface-dark/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-widest text-white uppercase">Live Radar</span>
          </div>
          <button 
            onClick={() => onNavigate(ScreenType.SETTINGS)}
            className="w-11 h-11 bg-surface-dark/60 backdrop-blur-md rounded-full text-white border border-white/10 flex items-center justify-center shadow-lg"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>

        {/* Markers */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {friends.map((f, i) => (
            <div key={i} className="absolute flex flex-col items-center gap-1.5 pointer-events-auto cursor-pointer group" style={{left: f.x, top: f.y}}>
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-white dark:border-background-dark shadow-xl bg-cover bg-center group-hover:scale-110 transition-transform" style={{backgroundImage: `url(${f.avatar})`}}></div>
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${f.color} rounded-full border-2 border-background-dark shadow-sm`}></div>
              </div>
              <div className="bg-surface-dark/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-lg">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">{f.name}</p>
                {f.dist && <p className="text-[8px] font-medium text-gray-400 text-center">{f.dist}</p>}
              </div>
            </div>
          ))}

          {/* User Location */}
          <div className="absolute top-[65%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>
            <div className="absolute w-12 h-12 bg-primary/30 rounded-full blur-md"></div>
            <div className="relative h-6 w-6 bg-primary rounded-full border-[3px] border-white dark:border-background-dark shadow-2xl z-20"></div>
            <div className="absolute -top-12 bg-primary text-white px-3 py-1.5 rounded-xl shadow-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              You
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Map Actions */}
        <div className="absolute bottom-12 right-5 flex flex-col gap-3 z-20">
          <button className="w-12 h-12 bg-card-dark backdrop-blur text-white rounded-2xl shadow-lg border border-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-12 h-12 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </div>

      {/* Chat Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-background-dark rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] z-40 flex flex-col transition-all duration-500 ease-in-out border-t border-white/5 ${sheetOpen ? 'h-[90%]' : 'h-[44%]'}`}
      >
        <div 
          className="w-full flex justify-center py-4 cursor-pointer"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="w-12 h-1.5 bg-gray-700 rounded-full opacity-50"></div>
        </div>

        <div className="px-6 flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Friday Night Out
              <span className="material-symbols-outlined text-gray-500 text-base">chevron_right</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">3 friends online</p>
            </div>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map((_, i) => (
              <img key={i} src={`https://picsum.photos/seed/${i + 20}/100/100`} className="w-10 h-10 rounded-full border-2 border-background-dark object-cover" alt="Avatar" />
            ))}
            <div className="w-10 h-10 rounded-full bg-surface-dark border-2 border-background-dark flex items-center justify-center text-[10px] font-bold text-gray-400">+1</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 scrollbar-hide py-2">
          <div className="flex justify-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
          </div>

          <div className="flex items-end gap-3 group animate-fade-in-up">
            <img src="https://picsum.photos/seed/sarah/100/100" className="w-8 h-8 rounded-full" alt="Avatar" />
            <div className="flex flex-col items-start gap-1 max-w-[80%]">
              <span className="text-[10px] font-bold text-gray-500 ml-1">Sarah</span>
              <div className="bg-card-dark px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 shadow-sm">
                <p className="text-sm text-gray-200">Hey! I just parked near the corner. Anyone nearby? 🚗</p>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 group animate-fade-in-up delay-100">
            <img src="https://picsum.photos/seed/mike/100/100" className="w-8 h-8 rounded-full" alt="Avatar" />
            <div className="flex flex-col items-start gap-1 max-w-[80%]">
              <span className="text-[10px] font-bold text-gray-500 ml-1">Mike</span>
              <div className="bg-card-dark px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 shadow-sm">
                <p className="text-sm text-gray-200">Traffic is heavy on 5th. Might be 5 mins late.</p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-end gap-3 group animate-fade-in-up delay-200">
            <div className="flex flex-col items-end gap-1 max-w-[80%]">
              <div className="bg-primary px-4 py-3 rounded-2xl rounded-tr-none shadow-xl shadow-primary/20">
                <p className="text-sm text-white">No worries! I'm walking over now.</p>
              </div>
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[9px] text-gray-600 font-bold">10:05 AM</span>
                <span className="material-symbols-outlined text-[12px] text-primary">done_all</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-11">
             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-100"></div>
             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        <div className="p-5 pb-10 bg-background-dark border-t border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Message..." 
                className="w-full h-12 bg-white/5 border-none rounded-full px-5 pr-12 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
              </button>
            </div>
            <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom Nav for Map View */}
        {!sheetOpen && (
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4">
             <button className="flex flex-col items-center gap-1 text-primary">
               <span className="material-symbols-outlined">map</span>
               <span className="text-[9px] font-bold uppercase tracking-widest">Map</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.FRIENDS)} className="flex flex-col items-center gap-1 text-gray-600">
               <span className="material-symbols-outlined">group</span>
               <span className="text-[9px] font-bold uppercase tracking-widest">Friends</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.MEETINGS)} className="flex flex-col items-center gap-1 text-gray-600">
               <span className="material-symbols-outlined">calendar_month</span>
               <span className="text-[9px] font-bold uppercase tracking-widest">Meet</span>
             </button>
             <button onClick={() => onNavigate(ScreenType.SETTINGS)} className="flex flex-col items-center gap-1 text-gray-600">
               <span className="material-symbols-outlined">person</span>
               <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
             </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default MapView;
