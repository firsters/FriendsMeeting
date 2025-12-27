import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, UserMinus, Shield, LogOut, Trash2, MoreHorizontal, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '../components/UI';

const MeetingDetails = ({ meeting, onBack, isHost = false }) => {
  const participants = [
    { id: '1', nickname: 'Sarah Chen', avatar: 'S', role: 'host', status: 'Location shared', online: true },
    { id: '2', nickname: 'Mike Ross', avatar: 'M', role: 'member', status: 'Arrived', online: true },
    { id: '3', nickname: 'Harvey Specter', avatar: 'H', role: 'member', status: '2 min away • Driving', online: true, warning: true },
    { id: '4', nickname: 'Donna Paulsen', avatar: 'D', role: 'member', status: '15 min away', online: false },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-slate-900 z-50 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Top Navigation from Stitch */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="flex items-center justify-center p-2 -ml-2 text-white rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-sm font-bold leading-tight tracking-widest uppercase mb-0">Meeting Details</h2>
        <button className="flex items-center justify-center p-2 -mr-2 text-white rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Map & Hero Section from Stitch */}
        <div className="p-4">
          <div className="relative w-full h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5">
            <div className="absolute inset-0 bg-slate-800 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-600 text-white shadow-xl ring-4 ring-slate-900/50 backdrop-blur-sm">
                <MapPin size={20} />
              </div>
              <div className="text-white">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-0.5">Meeting Point</p>
                <p className="text-sm font-bold">Joe's Pizza, Downtown</p>
              </div>
            </div>
          </div>

          {/* Title & Status */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Status
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{meeting.name}</h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Started 15 mins ago</p>
          </div>
        </div>

        <div className="h-px w-full bg-white/5 mx-auto max-w-[80%] my-4"></div>

        {/* Participants Section from Stitch */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-bold text-slate-500 opacity-60 uppercase tracking-widest">Who's Here ({participants.length})</h3>
            <button className="text-primary-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <UserPlus size={12} />
              Invite
            </button>
          </div>
          
          <div className="space-y-3">
            {participants.map(p => (
              <div key={p.id} className="flex items-center p-3.5 rounded-3xl bg-slate-800/40 border border-white/5 shadow-sm group hover:bg-slate-800/60 transition-colors">
                <div className="relative shrink-0">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg font-bold bg-slate-800 shadow-inner ${p.role === 'host' ? 'ring-2 ring-primary-500 border border-primary-500/50' : 'border border-white/5'}`}>
                    {p.avatar}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${p.online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></span>
                  {p.role === 'host' && (
                    <div className="absolute -top-2 -left-2 bg-primary-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg shadow-lg border border-slate-900 animate-bounce">
                      HOST
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.nickname}</p>
                  <p className={`text-[10px] font-medium uppercase tracking-tighter truncate ${p.warning ? 'text-amber-500' : 'text-slate-500'}`}>
                    {p.status}
                  </p>
                </div>
                {isHost && p.role !== 'host' && (
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Banner from Stitch */}
        <div className="px-4 mt-8">
          <div className="flex items-start gap-4 p-4 rounded-3xl bg-primary-500/10 border border-primary-500/20 shadow-inner overflow-hidden relative group">
            <div className="absolute -right-6 -top-6 text-primary-500 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={80} />
            </div>
            <div className="flex items-center justify-center h-10 w-10 bg-primary-500/20 rounded-2xl shrink-0 text-primary-400 border border-primary-500/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Precise Location Active</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Your location is shared only during the meeting and is automatically hidden when you leave. Only confirmed participants can see you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Panel from Stitch */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 z-30">
        <div className="flex flex-col gap-3">
          {isHost ? (
            <button className="w-full flex items-center justify-center gap-3 h-14 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-red-900/20">
              <Trash2 size={20} />
              End Meeting
            </button>
          ) : (
            <button className="w-full flex items-center justify-center gap-3 h-14 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-red-900/20">
              <LogOut size={20} />
              Leave Meeting
            </button>
          )}
          <button className="w-full flex items-center justify-center h-14 bg-slate-800 text-white hover:bg-slate-700 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all border border-white/5 active:scale-[0.98]">
            Minimize View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MeetingDetails;
