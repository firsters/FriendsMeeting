import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Mic, Plus, Minus, Navigation, MapPin, LocateFixed, Store, Trees, Utensils, ChevronRight } from 'lucide-react';

const LocationPicker = ({ onConfirm, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Blue Bottle Coffee",
    address: "396 Broadway, New York, NY 10013",
    type: "storefront",
    status: "Open Now",
    distance: "5 min walk"
  });

  const suggestions = [
    { id: 1, name: "City Hall Park", info: "0.1 mi • Public Park", icon: <Trees size={18} />, color: "bg-emerald-500/20 text-emerald-400" },
    { id: 2, name: "Nobu Downtown", info: "0.3 mi • Japanese Restaurant", icon: <Utensils size={18} />, color: "bg-amber-500/20 text-amber-400" }
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-900 text-white font-sans">
      {/* Top Navigation */}
      <div className="z-20 flex items-center bg-slate-900/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-white/5 absolute top-0 left-0 right-0">
        <button 
          onClick={onBack}
          className="text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">모임 위치 설정</h2>
      </div>

      {/* Main Map Area (Simulation) */}
      <div className="relative flex-1 w-full bg-slate-800">
        {/* Map Background Simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50">
          {/* Simple Grid/Street simulation */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute top-20 left-4 right-4 z-10 flex flex-col gap-2">
          <div className="flex h-12 w-full shadow-2xl shadow-black/40">
            <div className="flex w-full flex-1 items-stretch rounded-2xl bg-slate-800 border border-slate-700/50 backdrop-blur-xl">
              <div className="text-slate-400 flex items-center justify-center pl-4">
                <Search size={20} />
              </div>
              <input 
                className="flex w-full min-w-0 flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 px-4 text-base font-medium" 
                placeholder="주소 또는 장소 검색..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              />
              <button className="text-slate-400 flex items-center justify-center pr-4 hover:text-primary-400 transition-colors">
                <Mic size={20} />
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown from Stitch #2 */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col bg-slate-800/95 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">주변 추천 장소</span>
                </div>
                {suggestions.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setSelectedLocation({ ...selectedLocation, name: item.name, address: item.info.split(' • ')[1] });
                      setShowSuggestions(false);
                      setSearchQuery(item.name);
                    }}
                    className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-all text-left border-b border-white/5 group active:bg-white/10"
                  >
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color} shadow-inner`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">{item.info}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Controls (Right Side) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          <div className="flex flex-col gap-0.5 shadow-2xl shadow-black/40 rounded-xl overflow-hidden border border-slate-700/50">
            <button className="flex size-12 items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors border-b border-white/5">
              <Plus size={20} />
            </button>
            <button className="flex size-12 items-center justify-center bg-slate-800 hover:bg-slate-700 transition-colors">
              <Minus size={20} />
            </button>
          </div>
          <button className="flex size-12 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 shadow-2xl shadow-black/40 transition-colors border border-slate-700/50">
            <Navigation size={20} className="-rotate-45" />
          </button>
        </div>

        {/* Center Pin Marker (Simulation) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none pb-12 flex flex-col items-center justify-end z-10">
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl mb-2 whitespace-nowrap uppercase tracking-widest ring-4 ring-slate-900"
          >
            지도를 움직여 위치를 조정하세요
          </motion.div>
          <MapPin size={48} className="text-primary-500 fill-primary-500/20 drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]" />
          <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[2px] mt-1 scale-x-150"></div>
        </div>

        {/* Recenter FAB */}
        <div className="absolute bottom-8 right-4 z-10">
          <button className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-primary-400 shadow-2xl shadow-black/60 hover:bg-slate-700 transition-all border border-slate-700/50 active:scale-90">
            <LocateFixed size={24} />
          </button>
        </div>
      </div>

      {/* Bottom Action Panel from Stitch */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="z-20 bg-slate-900 border-t border-white/5 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] rounded-t-[2.5rem] -mt-6 relative"
      >
        <div className="w-full flex justify-center pt-4 pb-1">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
        </div>
        <div className="p-6 pb-12">
          <div className="flex flex-col gap-6">
            {/* Location Info */}
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600/20 text-primary-400 shadow-inner">
                <Store size={28} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-white text-xl font-extrabold tracking-tight">{selectedLocation.name}</p>
                <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-wide">{selectedLocation.address}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border border-emerald-500/20">영업 중</span></span>
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">도보 5분</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <button 
              onClick={() => onConfirm(selectedLocation)}
              className="flex w-full cursor-pointer items-center justify-center h-16 rounded-[1.5rem] bg-primary-600 hover:bg-primary-500 transition-all text-white text-sm font-bold uppercase tracking-[0.1em] shadow-2xl shadow-primary-900/40 active:scale-[0.98]"
            >
              위치 확정하기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationPicker;
