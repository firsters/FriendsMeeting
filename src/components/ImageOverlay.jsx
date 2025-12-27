import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ImageOverlay = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
        onClick={onClose}
      >
        <button 
          className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-[110]"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative max-w-full max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={imageUrl} 
            alt="Full screen" 
            className="w-full h-full object-contain"
          />
        </motion.div>
        
        <div className="mt-8 text-white/50 text-sm font-medium">
          Tap anywhere to close
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageOverlay;
