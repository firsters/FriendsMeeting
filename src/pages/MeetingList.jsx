import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Users, ChevronRight, MapPin, Clock, Hash } from 'lucide-react';
import { Button } from '../components/UI';
import MeetingDetails from './MeetingDetails';
import MeetingOverlay from '../components/MeetingOverlay';
import { useTranslation } from '../context/LanguageContext';
import { auth } from '../firebase';
import { subscribeToMeetings } from '../utils/meetingService';

const MeetingList = () => {
  const { t } = useTranslation();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [overlayType, setOverlayType] = useState(null); // 'create' | 'join'
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = subscribeToMeetings(user.uid, (data) => {
        setMeetings(data);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">{t('meeting_list_title')}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl px-3 py-2 text-primary-400 border-primary-500/20" onClick={() => setOverlayType('join')}>
               <Hash size={16} className="mr-1" />
               {t('meeting_join')}
            </Button>
            <Button variant="primary" size="sm" className="rounded-xl px-4 py-2" onClick={() => setOverlayType('create')}>
              <Plus size={18} className="mr-1" />
              {t('meeting_create')}
            </Button>
          </div>
        </div>

        <div className="space-y-6 pb-20">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading Meetings...</p>
             </div>
          ) : meetings.length === 0 ? (
             <div className="text-center py-20 bg-slate-800/20 rounded-[2.5rem] border border-white/5 mx-4">
                <Calendar size={48} className="text-slate-700 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 font-bold mb-1">No meetings yet</p>
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Create or join one to get started!</p>
             </div>
          ) : (
            <>
              {meetings.some(m => m.status !== 'past') && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">{t('meeting_upcoming')}</span>
                  <div className="space-y-4">
                    {meetings.filter(m => m.status !== 'past').map(meeting => (
                      <MeetingCard key={meeting.id} meeting={meeting} t={t} onClick={() => setSelectedMeeting(meeting)} />
                    ))}
                  </div>
                </div>
              )}

              {meetings.some(m => m.status === 'past') && (
                <div className="mt-8">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">{t('meeting_past')}</span>
                  <div className="space-y-4">
                    {meetings.filter(m => m.status === 'past').map(meeting => (
                      <MeetingCard key={meeting.id} meeting={meeting} t={t} onClick={() => setSelectedMeeting(meeting)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedMeeting && (
          <MeetingDetails 
            meeting={selectedMeeting} 
            onBack={() => setSelectedMeeting(null)} 
            isHost={selectedMeeting.hostId === currentUserId || selectedMeeting.participants?.find(p => p.id === currentUserId)?.role === 'host'}
          />
        )}
        {overlayType && (
          <MeetingOverlay 
            type={overlayType} 
            onClose={() => setOverlayType(null)}
            onCreate={(data) => { console.log('Create', data); setOverlayType(null); }}
            onJoin={(code) => { console.log('Join', code); setOverlayType(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MeetingCard = ({ meeting, onClick, t }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="glass p-5 rounded-3xl border border-white/5 shadow-xl hover:border-primary-500/30 transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex gap-4">
        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
          {meeting.icon || '📍'}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{meeting.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
            <span className="flex items-center gap-1"><Calendar size={12} /> {meeting.date}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {meeting.time}</span>
          </div>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors mt-2" />
    </div>
    
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {meeting.participants?.slice(0, 3).map((p, i) => (
            <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-primary-900 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden`}>
               {p.avatar && p.avatar.length > 2 ? (
                   <img src={p.avatar} className="w-full h-full object-cover" />
               ) : (
                   p.avatar || p.nickname?.charAt(0) || '?'
               )}
            </div>
          ))}
          {meeting.participants?.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
              +{meeting.participants.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">{meeting.participants?.length || 0}{t('meeting_participants')}</span>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${meeting.status !== 'past' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500'}`}>
        {meeting.status !== 'past' ? t('meeting_status_upcoming') : t('meeting_status_past')}
      </div>
    </div>
  </motion.div>
);

export default MeetingList;
