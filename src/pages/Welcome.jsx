import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Welcome = ({ onGetStarted }) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-slate-900 text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"></div>

      {/* Header / Logo Area */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-center pt-8 pb-4 z-10"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-900/40">
            <MapPin size={18} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">{t('welcome_title')}</span>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Hero Visual from Stitch */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full relative aspect-[4/5] max-h-[380px] mb-8 rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group bg-slate-800/50"
        >
          {/* Using the image URL from Stitch */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          {/* Floating UI Elements from Stitch */}
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t('online')}</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                A
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Alex</p>
                <p className="text-sm font-medium text-white italic">"Hey! I'm here 📍"</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Pagination Dots */}
        <div className="flex gap-2 mb-6">
          <div className="w-8 h-1.5 rounded-full bg-primary-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 mb-4">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold tracking-tighter text-white leading-none"
          >
            {t('welcome_subtitle_1')} <br/><span className="text-primary-400">{t('welcome_subtitle_2')}</span> {t('welcome_subtitle_3')}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide opacity-80"
          >
            {t('welcome_desc')}
          </motion.p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full px-8 pb-10 pt-2 z-10">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetStarted}
          className="w-full flex items-center justify-center gap-3 h-16 rounded-[1.5rem] bg-primary-600 hover:bg-primary-500 transition-all text-white font-bold text-sm tracking-widest uppercase shadow-2xl shadow-primary-900/40 mb-5"
        >
          <span>{t('welcome_start')}</span>
          <ArrowRight size={20} />
        </motion.button>
        <div className="flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500">{t('welcome_login_prompt')}</span>
          <button className="text-primary-400 hover:text-primary-300 transition-colors" onClick={onGetStarted}>{t('welcome_login_link')}</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
