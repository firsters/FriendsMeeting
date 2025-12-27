import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Hash, ChevronRight, Plus, CheckCircle } from 'lucide-react';
import { Input, Button } from '../components/UI';
import LocationPicker from '../pages/LocationPicker';
import { useTranslation } from '../context/LanguageContext';

const MeetingOverlay = ({ type = 'create', onClose, onCreate, onJoin }) => {
  const { t } = useTranslation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: 'Today',
    time: '7:00 PM',
    participants: '',
    code: '',
    location: null, // Stores { name, address, etc. }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'create') onCreate(formData);
    else onJoin(formData.code);
  };

  const handleLocationConfirm = (location) => {
    setFormData({ ...formData, location });
    setShowLocationPicker(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="meeting-overlay"
        initial={{ opacity: 0, y: '100dvh' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100dvh' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] bg-slate-900 flex flex-col overflow-hidden"
      >
        <header className="sticky top-0 z-[110] flex items-center justify-between px-4 py-4 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
          <button 
            onClick={onClose} 
            className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors px-2"
          >
            {t('cancel')}
          </button>
          <h1 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            {type === 'create' ? t('meeting_new') : t('meeting_join_overlay')}
          </h1>
          <div className="w-12"></div> 
        </header>

        <main className="flex-1 w-full max-w-md mx-auto p-6 pb-32 overflow-y-auto no-scrollbar">
          {type === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Meeting Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('meeting_name')}</label>
                <div className="relative group">
                  <input 
                    className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder={t('meeting_name_placeholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('meeting_date')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary-400">
                      <Calendar size={18} />
                    </div>
                    <input 
                      className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all shadow-inner cursor-pointer"
                      value="Today"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('meeting_time')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary-400">
                      <Clock size={18} />
                    </div>
                    <input 
                      className="w-full h-16 bg-slate-800/50 border-white/5 rounded-3xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/30 focus:bg-slate-800 transition-all shadow-inner cursor-pointer"
                      value={formData.time}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Location Selection Logic from Stitch */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('meeting_location')}</label>
                <button 
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="flex items-center w-full bg-slate-800/50 hover:bg-slate-800 active:scale-[0.98] rounded-2xl px-5 h-16 border border-white/5 transition-all group shadow-inner"
                >
                  <MapPin size={22} className="text-primary-400 mr-4" />
                  <span className={`flex-1 text-left text-sm font-bold truncate ${formData.location ? 'text-white' : 'text-slate-500 italic'}`}>
                    {formData.location ? formData.location.name : t('meeting_location_placeholder')}
                  </span>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
                </button>

                {/* Map Preview from Stitch */}
                {formData.location && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border border-white/5 group"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700" 
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center shadow-2xl border border-white/10">
                        <MapPin size={20} className="text-white fill-white/20" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-extrabold tracking-tight truncate">{formData.location.name}</p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight truncate opacity-80">{formData.location.address}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Invite Friends from Stitch */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('meeting_invite_friends')}</label>
                  <button type="button" className="text-primary-400 text-[10px] font-bold uppercase tracking-widest hover:text-primary-300">{t('meeting_view_all')}</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  <button type="button" className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center hover:border-primary-500 hover:bg-primary-500/10 transition-all group">
                    <Plus size={20} className="text-slate-500 group-hover:text-primary-400" />
                  </button>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 relative">
                      <div className={`w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-900 shadow-xl flex items-center justify-center text-xs font-bold text-white`}>
                        {['JD', 'SM', 'TL'][i-1]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-12 py-10">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary-600/10 rounded-[2.5rem] mx-auto flex items-center justify-center border border-primary-500/20 mb-6 group relative">
                  <Hash size={48} className="text-primary-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-primary-500/5 blur-2xl rounded-full"></div>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tighter text-white uppercase italic">{t('meeting_enter_code')}</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] max-w-[240px] mx-auto leading-relaxed">
                  {t('meeting_code_desc')}
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('meeting_code')}</label>
                <input 
                  className="w-full h-20 bg-slate-800/50 border-white/5 rounded-3xl text-center text-3xl font-black tracking-[0.3em] text-primary-400 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-2xl placeholder:opacity-20"
                  placeholder="X7Y-3A"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  maxLength={6}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900/95 backdrop-blur-2xl border-t border-white/5 z-[110]">
          <div className="max-w-md mx-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-sm tracking-widest uppercase h-16 rounded-[1.5rem] shadow-2xl shadow-primary-900/40 flex items-center justify-center gap-3 transition-all"
            >
              <CheckCircle size={20} />
              {type === 'create' ? t('meeting_create') : t('meeting_join')}
            </motion.button>
          </div>
        </footer>

        {/* Nested Location Picker Overlay */}
        <AnimatePresence>
          {showLocationPicker && (
            <div className="fixed inset-0 z-[150] overflow-hidden">
              <LocationPicker 
                onConfirm={handleLocationConfirm}
                onBack={() => setShowLocationPicker(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeetingOverlay;
