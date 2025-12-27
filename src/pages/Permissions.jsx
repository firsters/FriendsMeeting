import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Bell, ArrowLeft, CheckCircle2, Navigation, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Permissions = ({ onGrant }) => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false
  });

  const handleToggle = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-900 text-white overflow-hidden max-w-md mx-auto shadow-2xl">
      {/* Top App Bar from Stitch */}
      <div className="flex items-center justify-between p-4 sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <button onClick={() => {}} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest flex-1 text-center pr-10">{t('perm_title')}</h2>
      </div>

      <div className="flex-1 flex flex-col pb-32 overflow-y-auto no-scrollbar">
        {/* Header Illustration Component from Stitch */}
        <div className="px-6 py-6">
          <div className="w-full aspect-video bg-slate-800/50 flex flex-col justify-end overflow-hidden rounded-[2.5rem] shadow-2xl relative border border-white/5 group">
            {/* Background pattern similar to Stitch */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -left-8 -top-8 size-16 rounded-full bg-primary-500/20 blur-xl"
                ></motion.div>
                <div className="bg-primary-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-primary-900/40 border-4 border-slate-900 relative z-10">
                  <Map size={48} />
                </div>
                <div className="absolute -right-4 -bottom-4 bg-slate-800 p-2.5 rounded-2xl shadow-xl z-20 border-2 border-slate-900">
                  <CheckCircle2 size={24} className="text-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Headline & Body from Stitch */}
        <div className="flex flex-col items-center px-8 text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tighter leading-tight mb-4 text-white">
            {t('perm_subtitle_1')} <span className="text-primary-400">{t('perm_subtitle_2')}</span>{t('perm_subtitle_3')}
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wide opacity-80 leading-relaxed max-w-xs">
            {t('perm_desc')}
          </p>
        </div>

        {/* Permissions List from Stitch */}
        <div className="flex flex-col gap-4 px-6 w-full pb-10">
          {/* Location Permission */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`flex flex-col gap-6 p-6 rounded-[2rem] border transition-all duration-300 ${permissions.location ? 'bg-primary-500/10 border-primary-500/30 shadow-xl' : 'bg-slate-800/40 border-white/5'}`}
          >
            <div className="flex gap-5">
              <div className={`flex items-center justify-center shrink-0 size-14 rounded-2xl shadow-inner transition-colors ${permissions.location ? 'bg-primary-500 text-white' : 'bg-slate-800 text-primary-400'}`}>
                <Navigation size={28} />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1">
                <p className="text-base font-bold text-white tracking-tight">{t('perm_location')}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('perm_location_desc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pl-[64px] gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{t('perm_location_always')}</span>
              </div>
              <button 
                onClick={() => handleToggle('location')}
                className={`flex min-w-[100px] h-10 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${permissions.location ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-primary-600 text-white shadow-primary-900/20'}`}
              >
                {permissions.location ? t('perm_set_done') : t('perm_set')}
              </button>
            </div>
          </motion.div>

          {/* Notifications Permission */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`flex flex-col gap-6 p-6 rounded-[2rem] border transition-all duration-300 ${permissions.notifications ? 'bg-purple-500/10 border-purple-500/30 shadow-xl' : 'bg-slate-800/40 border-white/5'}`}
          >
            <div className="flex gap-5">
              <div className={`flex items-center justify-center shrink-0 size-14 rounded-2xl shadow-inner transition-colors ${permissions.notifications ? 'bg-purple-500 text-white' : 'bg-slate-800 text-purple-400'}`}>
                <Bell size={28} />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1">
                <p className="text-base font-bold text-white tracking-tight">{t('perm_notifications')}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{t('perm_notifications_desc')}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <button 
                onClick={() => handleToggle('notifications')}
                className={`flex min-w-[100px] h-10 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${permissions.notifications ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-slate-700 text-white'}`}
              >
                {permissions.notifications ? t('perm_enabled') : t('perm_enable')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Action from Stitch */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 z-30">
        <div className="max-w-md mx-auto w-full flex flex-col gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGrant}
            disabled={!permissions.location}
            className={`flex w-full items-center justify-center h-16 rounded-[1.5rem] font-bold text-sm tracking-widest uppercase shadow-2xl transition-all ${permissions.location ? 'bg-primary-600 text-white shadow-primary-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'}`}
          >
            {t('continue')}
          </motion.button>
          <div className="flex items-center justify-center gap-2 opacity-50 px-2">
            <ShieldCheck size={14} className="text-primary-400" />
            <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest leading-relaxed">
              {t('perm_privacy_note')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
