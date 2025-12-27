import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './MapView';
import ChatInterface from '../components/ChatInterface';
import ImageOverlay from '../components/ImageOverlay';
import { GripHorizontal, Menu, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const CombinedView = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [chatHeight, setChatHeight] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing && containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const newChatHeight = containerHeight - relativeY;
      
      const minChatHeight = containerHeight * 0.2;
      const maxChatHeight = containerHeight * 0.7;
      
      if (newChatHeight >= minChatHeight && newChatHeight <= maxChatHeight) {
        setChatHeight(newChatHeight);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      window.addEventListener('touchmove', resize);
      window.addEventListener('touchend', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    };
  }, [isResizing]);

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col bg-slate-900 relative overflow-hidden">
      {/* Map Section */}
      <div id="map-view" className="flex-1 relative overflow-hidden bg-slate-950">
        <MapView />
        
        {/* Map Overlays - Radar Live Badge & Controls */}
        <div className="absolute top-0 left-0 right-0 p-5 pt-14 flex justify-between items-start z-30 pointer-events-none">
          <button className="flex items-center justify-center w-11 h-11 bg-slate-900/40 backdrop-blur-xl rounded-full text-white border border-white/5 shadow-2xl hover:bg-slate-900/60 transition-all pointer-events-auto active:scale-95">
            <Menu size={22} />
          </button>
          <div className="bg-slate-900/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase">{t('radar_live')}</span>
          </div>
          <button className="flex items-center justify-center w-11 h-11 bg-slate-900/40 backdrop-blur-xl rounded-full text-white border border-white/5 shadow-2xl hover:bg-slate-900/60 transition-all pointer-events-auto active:scale-95">
            <SettingsIcon size={22} />
          </button>
        </div>
      </div>

      {/* Resizable Chat Section */}
      <motion.div 
        id="chat-container"
        animate={{ height: keyboardVisible ? '60%' : `${chatHeight}px` }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="shrink-0 z-40 flex flex-col bg-[#0b0f17] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
      >
        {/* Resize Handle - Pill Design */}
        <div 
          id="resize-handle"
          onMouseDown={startResizing}
          onTouchStart={startResizing}
          className="h-7 w-full flex justify-center items-center cursor-ns-resize group active:bg-white/5 transition-colors absolute -top-3.5 left-0 z-50 pointer-events-auto"
        >
          <div className="w-12 h-1.5 bg-slate-700/60 rounded-full group-hover:bg-slate-500 transition-colors shadow-inner"></div>
        </div>

        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0b0f17] shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
              Friday Night Out
              <ChevronRight size={14} className="text-slate-500 shrink-0" />
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">3 {t('meeting_participants')}</p>
            </div>
          </div>
          <div className="flex -space-x-2.5 ml-4">
            <div className="h-8 w-8 rounded-full ring-2 ring-[#0b0f17] bg-[#256af4] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">S</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-[#0b0f17] bg-accent-blue flex items-center justify-center text-[10px] font-bold text-white shadow-lg">M</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-[#0b0f17] bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shadow-lg">+1</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            height={keyboardVisible ? (window.innerHeight * 0.6) : chatHeight - 70} 
            onImageClick={setSelectedImage} 
          />
        </div>
      </motion.div>

      <ImageOverlay imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default CombinedView;
