import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './MapView';
import ChatInterface from '../components/ChatInterface';
import ImageOverlay from '../components/ImageOverlay';
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
    <div ref={containerRef} className="h-full w-full flex flex-col bg-background relative overflow-hidden font-sans">
      {/* Map Section */}
      <div id="map-view" className="flex-1 relative overflow-hidden bg-background-secondary">
        <MapView />
        
        {/* Map Overlays - Radar Live Badge & Controls */}
        <div className="absolute top-0 left-0 right-0 p-xs pt-12 flex justify-between items-start z-30 pointer-events-none">
          <button className="flex items-center justify-center w-11 h-11 bg-background rounded-full text-text shadow-fab hover:bg-background-secondary transition-all pointer-events-auto active:scale-95 border border-border">
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="bg-background px-4 py-2 rounded-full border border-border flex items-center gap-xxs shadow-fab">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-wider text-text uppercase">{t('radar_live')}</span>
          </div>

          <button className="flex items-center justify-center w-11 h-11 bg-background rounded-full text-text shadow-fab hover:bg-background-secondary transition-all pointer-events-auto active:scale-95 border border-border">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      {/* Resizable Chat Section */}
      <motion.div 
        id="chat-container"
        animate={{ height: keyboardVisible ? '60%' : `${chatHeight}px` }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 1 }}
        className="shrink-0 z-40 flex flex-col bg-background-secondary shadow-[0_-8px_32px_rgba(0,0,0,0.08)] relative"
      >
        {/* Resize Handle - 8px Height Material Style */}
        <div 
          id="resize-handle"
          onMouseDown={startResizing}
          onTouchStart={startResizing}
          className="h-2 w-full flex justify-center items-center cursor-ns-resize bg-border hover:bg-text-placeholder transition-colors absolute -top-0 left-0 z-50 pointer-events-auto shadow-[0_-2px_4px_rgba(0,0,0,0.02)]"
        >
          {/* Pill Grip - 32x4 rounded */}
          <div className="w-8 h-1 bg-text-placeholder rounded-full" />
        </div>

        {/* Chat Header */}
        <div className="px-sm py-xs border-b border-border flex justify-between items-center bg-background shrink-0 mt-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-h2 font-bold text-text tracking-tight flex items-center gap-xxs truncate">
              Friday Night Out
              <span className="material-symbols-outlined text-[18px] text-text-secondary">chevron_right</span>
            </h2>
            <div className="flex items-center gap-xxs mt-0.5">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-status-success"></span>
              </span>
              <p className="text-nickname font-semi-bold text-text-secondary tracking-tight truncate">3 {t('meeting_participants')}</p>
            </div>
          </div>
          <div className="flex -space-x-1.5 ml-4">
            <div className="h-8 w-8 rounded-full ring-2 ring-background bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">S</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-background bg-accent flex items-center justify-center text-[10px] font-bold text-white shadow-sm">M</div>
            <div className="h-8 w-8 rounded-full ring-2 ring-background bg-background-secondary border border-border text-text-secondary flex items-center justify-center text-[10px] font-bold">+1</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            height={keyboardVisible ? (window.innerHeight * 0.6) : chatHeight - 74} 
            onImageClick={setSelectedImage} 
          />
        </div>
      </motion.div>

      <ImageOverlay imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default CombinedView;
