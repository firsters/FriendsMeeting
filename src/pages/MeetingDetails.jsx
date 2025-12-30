import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, UserMinus, Shield, LogOut, Trash2, MoreHorizontal, UserPlus, ShieldCheck, BellRing, ChevronRight, MessageSquarePlus, X } from 'lucide-react';
import { Button } from '../components/UI';
import LocationPicker from './LocationPicker';
import { useTranslation } from '../context/LanguageContext';
import { subscribeToMeetingDetails } from '../utils/meetingService';

const MeetingDetails = ({ meeting, onBack, isHost = false }) => {
  const { t } = useTranslation();
  const [showNotificationTemplate, setShowNotificationTemplate] = useState(false);
  const [showJoinToast, setShowJoinToast] = useState(false);
  const [lastJoinedFriend, setLastJoinedFriend] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(meeting);
  const [participants, setParticipants] = useState(meeting.participants || []);
  const [prevParticipantCount, setPrevParticipantCount] = useState(meeting.participants?.length || 0);

  React.useEffect(() => {
    if (!meeting.id) return;

    const unsubscribe = subscribeToMeetingDetails(meeting.id, (data) => {
        setCurrentMeeting(data);
        const newParticipants = data.participants || [];
        setParticipants(newParticipants);
        
        // Logical check for "new friend added" feedback
        if (data.participants && newParticipants.length > prevParticipantCount && prevParticipantCount > 0) {
            const latest = newParticipants[newParticipants.length - 1];
            setLastJoinedFriend(latest.nickname);
            setShowJoinToast(true);
            setTimeout(() => setShowJoinToast(false), 5000);
        }
        setPrevParticipantCount(newParticipants.length);
    });

    return () => unsubscribe();
  }, [meeting.id, prevParticipantCount]);

  const handleLocationUpdate = (newLocation) => {
    setCurrentMeeting({ ...currentMeeting, location: newLocation });
    setShowLocationPicker(false);
    setShowNotificationTemplate(true);
  };

  return (
    <motion.div 
      initial={{ x: '100dvw' }}
      animate={{ x: 0 }}
      exit={{ x: '100dvw' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-slate-900 z-50 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Top Navigation */}
      <div className="sticky top-0 z-[60] flex items-center justify-between px-4 py-4 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="flex items-center justify-center p-2 text-white rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">{t('meeting_details_title')}</h2>
        <button className="flex items-center justify-center p-2 text-white rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Map & Hero Section from Stitch */}
        <div className="p-6">
          <div className="relative w-full h-56 rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5">
            <div 
              className="absolute inset-0 bg-slate-800 bg-cover bg-center opacity-60 transition-transform duration-[2000ms] group-hover:scale-110" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 text-white shadow-2xl ring-4 ring-slate-900/50 backdrop-blur-sm border border-white/10">
                <MapPin size={24} className="fill-white/20" />
              </div>
              <div className="text-white">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">{t('meeting_location_label')}</p>
                <p className="text-lg font-extrabold tracking-tight">{currentMeeting.location?.name}</p>
                <p className="text-[10px] font-medium text-slate-400 opacity-80 truncate">{currentMeeting.location?.address}</p>
              </div>
            </div>

            {isHost && (
              <button 
                onClick={() => setShowLocationPicker(true)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-2xl border border-white/10 text-white transition-all active:scale-90"
              >
                <MessageSquarePlus size={20} />
              </button>
            )}
          </div>

          {/* Title & Status */}
          <div className="mt-8 text-center">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t('meeting_status_live')}
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase italic">{currentMeeting.name}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">15{t('meeting_time_start')} • {currentMeeting.location?.name}</p>
          </div>
        </div>

        {/* Host Notification Trigger from Stitch Requirements */}
        {isHost && (
          <div className="px-6 mb-4">
            <button 
              onClick={() => setShowNotificationTemplate(true)}
              className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 text-amber-500 group hover:bg-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <BellRing size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-tight">{t('meeting_send_notif')}</p>
                  <p className="text-[10px] font-medium opacity-70">{t('meeting_notif_desc')}</p>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <div className="h-px w-full bg-white/5 mx-auto max-w-[80%] my-6"></div>

        {/* Participants Section from Stitch */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-bold text-slate-500 opacity-60 uppercase tracking-widest">{t('meeting_active_members')} ({participants.length})</h3>
            <button className="text-primary-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:text-primary-300">
              <UserPlus size={14} />
              {t('meeting_invite')}
            </button>
          </div>
          
          <div className="space-y-4">
            {participants.map(p => (
              <div key={p.id} className="flex items-center p-4 rounded-[2rem] bg-slate-800/40 border border-white/5 shadow-sm group hover:bg-slate-800/60 transition-all">
                <div className="relative shrink-0">
                  <div className={`h-12 w-12 rounded-[1rem] flex items-center justify-center text-lg font-black bg-slate-800 shadow-inner ${p.role === 'host' ? 'ring-2 ring-primary-500 border border-primary-500/50 text-primary-400' : 'border border-white/5 text-slate-400'}`}>
                    {p.avatar}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-slate-900 ${p.online ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-slate-500'}`}></span>
                  {p.role === 'host' && (
                    <div className="absolute -top-3 -left-2 bg-primary-600 text-white text-[7px] font-black px-2 py-0.5 rounded-lg shadow-2xl border border-slate-900 tracking-widest uppercase">
                      {t('meeting_role_host')}
                    </div>
                  )}
                </div>
                <div className="ml-5 flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-white truncate tracking-tight">{p.nickname}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-tight truncate mt-0.5 ${p.warning ? 'text-amber-500' : 'text-slate-500 opacity-70'}`}>
                    {p.status}
                  </p>
                </div>
                {isHost && p.role !== 'host' && (
                  <button className="opacity-0 group-hover:opacity-100 p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all active:scale-90">
                    <UserMinus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Banner from Stitch */}
        <div className="px-6 mt-10">
          <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-primary-500/5 border border-primary-500/10 shadow-inner overflow-hidden relative group">
            <div className="absolute -right-8 -top-8 text-primary-500 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <ShieldCheck size={120} />
            </div>
            <div className="flex items-center justify-center h-12 w-12 bg-primary-500/20 rounded-2xl shrink-0 text-primary-400 border border-primary-500/20">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1 shadow-primary-900/40">{t('meeting_safe_label')}</p>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed opacity-70">{t('meeting_safe_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Panel from Stitch */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-slate-900/95 backdrop-blur-2xl border-t border-white/5 z-[60]">
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {isHost ? (
            <button className="w-full flex items-center justify-center gap-3 h-16 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all shadow-2xl shadow-red-900/40">
              <Trash2 size={20} />
              {t('meeting_end')}
            </button>
          ) : (
            <button className="w-full flex items-center justify-center gap-3 h-16 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all shadow-2xl shadow-red-900/40">
              <LogOut size={20} />
              {t('meeting_leave')}
            </button>
          )}
          <button 
            onClick={onBack}
            className="w-full flex items-center justify-center h-14 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-[1.5rem] font-bold text-[10px] tracking-widest uppercase transition-all border border-white/5 active:scale-[0.98]"
          >
            {t('meeting_hide')}
          </button>
        </div>
      </div>

      {/* Overlays for Location Update Flow */}
      <AnimatePresence>
        {showLocationPicker && (
          <div className="fixed inset-0 z-[200]">
            <LocationPicker 
              onConfirm={handleLocationUpdate}
              onBack={() => setShowLocationPicker(false)}
            />
          </div>
        )}
        {showNotificationTemplate && (
          <div className="fixed inset-0 z-[200]">
            <LocationNotificationTemplate 
              meeting={currentMeeting}
              t={t}
              onSend={() => setShowNotificationTemplate(false)}
              onBack={() => setShowNotificationTemplate(false)}
            />
          </div>
        )}
        {showJoinToast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-32 left-6 right-6 z-[100] bg-primary-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-white/70">{t('meeting_new_participant')}</p>
              <p className="text-sm font-bold text-white">
                <span className="text-yellow-400">{lastJoinedFriend}</span> {t('meeting_joined_msg')}
              </p>
            </div>
            <button onClick={() => setShowJoinToast(false)} className="p-1 hover:bg-white/10 rounded-lg">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Stitch-inspired Location Update Notification Template
const LocationNotificationTemplate = ({ meeting, onSend, onBack, t }) => {
  const [customMessage, setCustomMessage] = useState('');
  
  return (
    <motion.div 
      initial={{ y: '100dvh' }}
      animate={{ y: 0 }}
      exit={{ y: '100dvh' }}
      className="absolute inset-0 bg-slate-900 z-[100] flex flex-col"
    >
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white"><ArrowLeft size={24} /></button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">{t('meeting_notif_title')}</h2>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 p-8 space-y-10 overflow-y-auto no-scrollbar">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('meeting_preview')}</label>
          <div className="p-6 rounded-[2.5rem] bg-primary-600 shadow-2xl shadow-primary-900/40 text-white space-y-4 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
              <BellRing size={120} />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl"><MapPin size={20} /></div>
              <p className="text-xs font-black uppercase tracking-widest">{t('meeting_notif_banner')}</p>
            </div>
            <p className="text-lg font-extrabold leading-tight tracking-tight">
              {t('meeting_notif_prefix')} <span className="underline decoration-4 underline-offset-4 decoration-white/30">{meeting.name}</span> {t('meeting_notif_mid')} <span className="text-white bg-slate-900/20 px-1 rounded">{meeting.location?.name}</span>{t('meeting_notif_suffix')}
            </p>
            {customMessage && (
              <p className="text-sm font-bold bg-black/10 p-4 rounded-2xl italic">"{customMessage}"</p>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('meeting_notif_tap')}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('meeting_custom_msg')}</label>
          <textarea 
            className="w-full bg-slate-800/50 border-white/5 rounded-[2rem] p-6 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-inner min-h-[160px] resize-none"
            placeholder={t('meeting_msg_placeholder')}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>
      </main>

      <footer className="p-8 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 pb-10">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSend}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black text-sm tracking-[0.2em] uppercase h-20 rounded-[2rem] shadow-2xl shadow-primary-900/40 flex items-center justify-center gap-4 transition-all"
        >
          <BellRing size={24} />
          {t('meeting_broadcast')}
        </motion.button>
      </footer>
    </motion.div>
  );
};

export default MeetingDetails;
