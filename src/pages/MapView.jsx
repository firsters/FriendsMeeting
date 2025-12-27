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
    <div ref={mapRef} className="relative w-full h-full bg-slate-800 overflow-hidden cursor-grab active:cursor-grabbing">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-300"
        style={{
          backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: 'center center'
        }}
      />

      {/* Map Content Layer */}
      <div className="absolute inset-0">
        {/* User Location (Always Center) */}
        <div 
          className="absolute"
          style={{
            left: `${viewportSize.width / 2}px`,
            top: `${viewportSize.height / 2}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 rounded-full animate-pulse-fast opacity-40 scale-150" />
            <div className="w-4 h-4 bg-primary-500 rounded-full border-2 border-white shadow-lg z-10" />
          </div>
        </div>

        {/* Friend Pins */}
        {friends.map(friend => {
          const px = getPixelPos(friend.x, viewportSize.width, userLocation.x);
          const py = getPixelPos(friend.y, viewportSize.height, userLocation.y);
          
          const isOffScreen = px < 20 || px > viewportSize.width - 20 || py < 20 || py > viewportSize.height - 20;

          if (isOffScreen) return null;

          return (
            <motion.div
              key={friend.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1, x: px, y: py }}
              className="absolute"
              style={{ x: px, y: py, transform: 'translate(-50%, -100%)' }}
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-white/10 text-[10px] font-bold text-white mb-1 shadow-lg whitespace-nowrap">
                  {friend.nickname}
                </div>
                <div className={`p-1 rounded-full bg-white shadow-xl`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-${friend.color}`}>
                    {friend.avatar}
                  </div>
                </div>
                <div className="w-2 h-2 bg-white rotate-45 -mt-1 shadow-xl" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Off-screen Indicators (Advanced Bearing-based) */}
      {friends.map(friend => {
        const px = getPixelPos(friend.x, viewportSize.width, userLocation.x);
        const py = getPixelPos(friend.y, viewportSize.height, userLocation.y);
        
        const isOffScreen = px < 30 || px > viewportSize.width - 30 || py < 30 || py > viewportSize.height - 30;

        if (!isOffScreen) return null;

        const intersection = getIntersectionPoint(
          px, py, 
          viewportSize.width / 2, viewportSize.height / 2, 
          viewportSize.width, viewportSize.height, 
          30
        );

        return (
          <motion.div
            key={`indicator-${friend.id}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x: intersection.x, y: intersection.y }}
            className="absolute z-20"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-900 shadow-lg flex items-center justify-center overflow-visible">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-${friend.color}`}>
                  {friend.avatar}
                </div>
                {/* Directional Arrow */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ transform: `rotate(${intersection.angle}deg)` }}
                >
                  <div className={`absolute top-1/2 -right-1.5 w-2.5 h-2.5 bg-${friend.color} rounded-sm rotate-45 -translate-y-1/2 shadow-sm`} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* FABs */}
      <div className="absolute right-4 bottom-6 flex flex-col gap-3 z-30">
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.2, 3)); }}
          className="p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.2, 0.5)); }}
          className="p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl active:scale-95 transition-all"
        >
          <Minus size={20} />
        </button>
        <button className="p-3 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-900/40 active:scale-95 transition-all">
          <LocateFixed size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapView;
