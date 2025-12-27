import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Plus, Minus, LocateFixed } from 'lucide-react';
import { useFriends } from '../context/FriendsContext';

const MapView = () => {
  const { friends, userLocation } = useFriends();
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        setViewportSize({
          width: mapRef.current.clientWidth,
          height: mapRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Map coordinate to pixel (centered on user)
  const getPixelPos = (coord, size, centerCoord) => {
    const scale = 10 * zoom;
    return (size / 2) + (coord - centerCoord) * scale;
  };

  /**
   * Advanced Position Calculation Logic:
   * Calculates the intersection point of a ray from center to target with the viewport rectangle.
   */
  const getIntersectionPoint = (targetX, targetY, centerX, centerY, width, height, margin) => {
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    
    if (dx === 0 && dy === 0) return { x: width/2, y: height/2 };

    const halfW = (width / 2) - margin;
    const halfH = (height / 2) - margin;

    const slope = dy / dx;

    let x, y;

    if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
      // Intersects left or right edge
      x = dx > 0 ? halfW : -halfW;
      y = slope * x;
    } else {
      // Intersects top or bottom edge
      y = dy > 0 ? halfH : -halfH;
      x = y / slope;
    }

    return { 
      x: x + (width / 2), 
      y: y + (height / 2),
      angle: Math.atan2(dy, dx) * (180 / Math.PI)
    };
  };

  return (
    <div ref={mapRef} className="relative w-full h-full bg-[#0b0f17] overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Radar Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] transition-all duration-500"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #3b82f6 1px, transparent 1px),
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: `${100 * zoom}px ${100 * zoom}px, ${20 * zoom}px ${20 * zoom}px, ${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Ambient Radar Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.05)_0%,_transparent_70%)] pointer-events-none" />

      {/* Map Content Layer */}
      <div className="absolute inset-0">
        {/* User Location (Always Center) - Blue Dot Pulse */}
        <div 
          className="absolute"
          style={{
            left: `${viewportSize.width / 2}px`,
            top: `${viewportSize.height / 2}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-[-12px] bg-blue-500 rounded-full blur-md"
            />
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Friend Pins */}
        <AnimatePresence>
          {friends.map(friend => {
            const px = getPixelPos(friend.x, viewportSize.width, userLocation.x);
            const py = getPixelPos(friend.y, viewportSize.height, userLocation.y);
            
            const isOffScreen = px < 40 || px > viewportSize.width - 40 || py < 40 || py > viewportSize.height - 40;

            if (isOffScreen) return null;

            return (
              <motion.div
                key={`pin-${friend.id}`}
                layoutId={`friend-${friend.id}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: px, y: py }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                className="absolute z-10"
                style={{ x: px, y: py, transform: 'translate(-50%, -100%)' }}
              >
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="px-2 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold text-white mb-1.5 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {friend.nickname}
                  </div>
                  <div className="relative">
                    {/* Pin Shape */}
                    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                      <path d="M20 48C20 48 36 34.6 36 20C36 11.1634 28.8366 4 20 4C11.1634 4 4 11.1634 4 20C4 34.6 20 48 20 48Z" fill="white" />
                      <circle cx="20" cy="20" r="14" fill={`var(--${friend.color}-bg, #1e293b)`} />
                    </svg>
                    <div className="absolute top-[6px] left-[6px] w-[28px] h-[28px] rounded-full overflow-hidden flex items-center justify-center text-white font-black text-xs">
                      {friend.avatar}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Off-screen Indicators (Advanced Steering) */}
      {friends.map(friend => {
        const px = getPixelPos(friend.x, viewportSize.width, userLocation.x);
        const py = getPixelPos(friend.y, viewportSize.height, userLocation.y);
        
        const isOffScreen = px < 40 || px > viewportSize.width - 40 || py < 40 || py > viewportSize.height - 40;

        if (!isOffScreen) return null;

        const intersection = getIntersectionPoint(
          px, py, 
          viewportSize.width / 2, viewportSize.height / 2, 
          viewportSize.width, viewportSize.height, 
          45
        );

        return (
          <motion.div
            key={`indicator-${friend.id}`}
            layoutId={`friend-${friend.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: intersection.x, y: intersection.y }}
            className="absolute z-30"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative group cursor-pointer">
              {/* Indicator Background & Glow */}
              <div 
                className="w-11 h-11 rounded-full bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.4)] flex items-center justify-center relative border border-white/20 overflow-visible transition-transform active:scale-90"
              >
                <div 
                  className="absolute inset-[-4px] rounded-full opacity-20 blur-sm"
                  style={{ backgroundColor: `var(--${friend.color}-bg, #3b82f6)` }}
                />
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-inner bg-${friend.color}`}>
                  {friend.avatar}
                </div>
                
                {/* Directional Arrow (Outward Pointing) */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ transform: `rotate(${intersection.angle}deg)` }}
                >
                  <div 
                    className="absolute top-1/2 -right-3 w-4 h-4 flex items-center justify-center -translate-y-1/2"
                  >
                    <div 
                      className="w-3 h-3 bg-slate-900 border-r border-t border-white/30 rotate-45 rounded-sm shadow-lg"
                      style={{ backgroundColor: `var(--${friend.color}-bg, #1e293b)` }}
                    />
                  </div>
                </div>

                {/* Counter for distance (optional visual) */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-bold text-white whitespace-nowrap">{friend.nickname}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Map Navigation FABs */}
      <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-30 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.2, 3)); }}
          className="p-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 text-white shadow-2xl active:scale-90 transition-all hover:bg-slate-800"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.2, 0.5)); }}
          className="p-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 text-white shadow-2xl active:scale-90 transition-all hover:bg-slate-800"
        >
          <Minus size={20} />
        </button>
        <button className="p-3 bg-blue-600 rounded-2xl text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-90 transition-all hover:bg-blue-500">
          <LocateFixed size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapView;
