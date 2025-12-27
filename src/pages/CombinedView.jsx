import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './MapView';
import ChatInterface from '../components/ChatInterface';
import ImageOverlay from '../components/ImageOverlay';
import { GripHorizontal, Menu, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

const CombinedView = () => {
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
    <div ref={containerRef} className="h-full w-full flex flex-col bg-slate-900 relative">
      {/* Map Section */}
      <div id="map-view" className="flex-1 relative overflow-hidden">
        <MapView />
        
        {/* Map Overlays from Stitch */}
        <div className="absolute top-0 left-0 right-0 p-5 pt-14 flex justify-between items-start z-30 pointer-events-none">
          <button className="flex items-center justify-center w-11 h-11 bg-slate-800/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-slate-800/60 transition-colors pointer-events-auto">
            <Menu size={22} />
          </button>
          <div className="bg-slate-800/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase">실시간 레이더</span>
          </div>
          <button className="flex items-center justify-center w-11 h-11 bg-slate-800/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-slate-800/60 transition-colors pointer-events-auto">
            <SettingsIcon size={22} />
          </button>
        </div>
      </div>

      {/* Resize Handle from Stitch */}
      <div 
        id="resize-handle"
        onMouseDown={startResizing}
        onTouchStart={startResizing}
        className="h-12 w-full flex justify-center py-3 cursor-ns-resize bg-slate-900 shrink-0 hover:bg-slate-800 transition-colors z-[30] border-t border-white/5 relative -mt-6 rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="flex flex-col gap-1 items-center opacity-40">
          <div className="w-12 h-1 bg-slate-400 rounded-full"></div>
        </div>
      </div>

      {/* Chat Section */}
      <motion.div 
        id="chat-container"
        animate={{ height: keyboardVisible ? '60%' : `${chatHeight}px` }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="shrink-0 z-20 overflow-hidden bg-slate-900"
      >
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              금요일 밤 모임
              <ChevronRight size={14} className="text-slate-500" />
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3명의 친구 접속 중</p>
            </div>
          </div>
          <div className="flex -space-x-2.5">
            <div className="h-8 w-8 rounded-full ring-2 ring-slate-900 bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white">S</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-slate-900 bg-accent-blue flex items-center justify-center text-[10px] font-bold text-white">M</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">+1</div>
          </div>
        </div>
        
        <ChatInterface 
          height={keyboardVisible ? (window.innerHeight * 0.6) : chatHeight - 70} 
          onImageClick={setSelectedImage} 
        />
      </motion.div>

      <ImageOverlay imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default CombinedView;
