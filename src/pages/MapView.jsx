import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';

const MapView = () => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([
    { id: 1, name: 'Alex', x: 30, y: 40, status: 'online' },
    { id: 2, name: 'Sam', x: 70, y: 60, status: 'online' },
  ]);

  const [offScreenFriends, setOffScreenFriends] = useState([
    { id: 3, name: 'Jordan', angle: 45, indicatorX: 300, indicatorY: 50 },
    { id: 4, name: 'Taylor', angle: 220, indicatorX: 50, indicatorY: 400 },
  ]);

  return (
    <div className="relative h-full w-full bg-[#f8f9fa] overflow-hidden">
      {/* Dynamic Grid Background - Adjusted for Light Mode */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #4285F4 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Ambient Radial Gradient - For light depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,133,244,0.03)_0%,transparent_70%)]" />

      {/* User Location - Blue Dot Pulse */}
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-[#4285F4] rounded-full opacity-20 animate-ping" />
          <div className="absolute w-16 h-16 bg-[#4285F4] rounded-full opacity-5 animate-pulse" />
          <div className="w-3.5 h-3.5 bg-[#4285F4] rounded-full border-2 border-white shadow-md z-10" />
        </div>
      </motion.div>

      {/* Friend Markers */}
      <AnimatePresence>
        {friends.map(friend => (
          <motion.div
            key={friend.id}
            className="absolute z-20"
            style={{ left: `${friend.x}%`, top: `${friend.y}%` }}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
          >
            <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full mb-1">
              {/* Nickname Background - Material Style */}
              <div className="bg-white px-2.5 py-1 rounded-full shadow-md border border-[#E0E0E0] mb-2">
                <span className="text-[10px] font-bold text-[#212121] whitespace-nowrap uppercase tracking-tight">
                  {friend.name}
                </span>
              </div>
              
              {/* Marker Pin */}
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#4285F4] bg-white p-0.5 shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                  <div className="w-full h-full rounded-full bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-[#BDBDBD]">person</span>
                  </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34A853] border-2 border-white rounded-full shadow-sm" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Off-screen Indicators - 32px Material Style */}
      <AnimatePresence>
        {offScreenFriends.map(friend => (
          <motion.div
            key={friend.id}
            className="absolute z-[35]"
            style={{ 
              left: `${friend.indicatorX}px`, 
              top: `${friend.indicatorY}px` 
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              {/* Avatar Bubble */}
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-[#4285F4]/30 shadow-md flex items-center justify-center overflow-hidden transition-all group-hover:bg-white active:scale-90 ring-1 ring-[#4285F4]/10">
                <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                   <span className="material-symbols-outlined text-[16px] text-[#4285F4]">person</span>
                </div>
              </div>
              
              {/* Direction Arrow */}
              <div 
                className="absolute text-[#4285F4] flex items-center justify-center drop-shadow-sm"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${friend.angle}deg) translate(22px)`
                }}
              >
                <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#4285F4]" />
              </div>

              {/* Distance Label */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-[#E0E0E0] shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold text-[#4285F4]">2.4km</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MapView;
