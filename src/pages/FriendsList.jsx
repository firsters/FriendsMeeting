import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, UserPlus, MessageCircle, MoreVertical, MapPin, Clock, X } from 'lucide-react';

const FriendsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const requests = [
    { id: '1', name: 'Sarah Jenkins', status: '위치 공유를 요청했습니다', avatar: 'S' },
    { id: '2', name: 'Mike Ross', status: '함께 아는 친구: Harvey S.', avatar: 'M' },
  ];

  const friends = [
    { id: '1', name: 'Jessica Pearson', status: '도심 • 2km 거리', avatar: 'J', online: true },
    { id: '2', name: 'Louis Litt', status: '2시간 전 마지막 확인', avatar: 'L', online: false },
    { id: '3', name: 'Donna Paulsen', status: '센트럴 파크 • 500m 거리', avatar: 'D', online: true },
    { id: '4', name: 'Rachel Zane', status: '10분 동안 활동 없음', avatar: 'R', online: true, idle: true },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md p-4 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold leading-tight tracking-tight">친구 목록</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center rounded-full w-10 h-10 bg-slate-800 text-white hover:bg-slate-700 transition-colors">
              <QrCode size={20} />
            </button>
            <button className="flex items-center justify-center rounded-full w-10 h-10 bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/30">
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={18} />
          </div>
          <input 
            className="w-full bg-slate-800 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500/30 transition-all"
            placeholder="사용자 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Pending Requests */}
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">친구 요청 ({requests.length})</h3>
          <div className="space-y-3">
            {requests.map(req => (
              <motion.div 
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-white/5 shadow-sm"
              >
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold">
                    {req.avatar}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{req.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{req.status}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="flex items-center justify-center rounded-xl h-9 w-9 bg-slate-800 text-slate-400 hover:text-red-400 transition-colors">
                    <X size={18} />
                  </button>
                  <button className="flex items-center justify-center rounded-xl h-9 px-4 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-700 transition-colors shadow-sm">
                    수락
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Friends */}
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">모든 친구 (42)</h3>
          <div className="space-y-1">
            {friends.map(friend => (
              <motion.div 
                key={friend.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="group relative flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="relative shrink-0">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold bg-slate-800 border-2 transition-all ${friend.online ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent opacity-60'}`}>
                    {friend.avatar}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full ${friend.online ? (friend.idle ? 'bg-amber-500' : 'bg-green-500') : 'bg-slate-500'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{friend.name}</p>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    {friend.online && !friend.idle ? <MapPin size={12} className="text-primary-400" /> : <Clock size={12} />}
                    <p className="text-[10px] font-medium truncate uppercase tracking-tighter">{friend.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center justify-center rounded-full w-9 h-9 bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all">
                    <MessageCircle size={18} />
                  </button>
                  <button className="flex items-center justify-center rounded-full w-9 h-9 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendsList;
