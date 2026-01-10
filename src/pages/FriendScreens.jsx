import React, { useState, useEffect } from 'react';
import { ScreenType } from '../constants/ScreenType';
import { useTranslation } from '../context/LanguageContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFriends } from '../context/FriendsContext';
import { useModal } from '../context/ModalContext';
import MeetingSwitcher from '../components/MeetingSwitcher';

const FriendScreens = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { showAlert } = useModal();
  const { friends, messages, lastSeenMap, activeMeetingId, setSelectedFriendId, myMeetings, blockFriend, unblockFriend, isHost } = useFriends();
  const lastSeenId = lastSeenMap[activeMeetingId] || null;

  const handleAction = async (friendId, action) => {
    if (action === 'block') {
      await blockFriend(friendId);
    } else if (action === 'unblock') {
      await unblockFriend(friendId);
    }
  };

  const handleFriendProfileClick = (friendId) => {
    setSelectedFriendId(friendId);
    onNavigate(ScreenType.MAP);
  };

  const handleShareInvite = async () => {
    if (!auth.currentUser) return;

    try {
      // Find the active meeting to get its group code
      const currentMeeting = myMeetings.find(m => m.id === activeMeetingId);

      let groupCode = '';
      if (currentMeeting && currentMeeting.groupCode) {
        groupCode = currentMeeting.groupCode;
      } else {
        // Fallback: Fetch from user profile if not found in active meeting context
        // This handles cases where state might not be fully synced or single-user scenarios
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          groupCode = docSnap.data().groupCode;
        }
      }

      if (!groupCode) {
        groupCode = auth.currentUser.uid.substring(0, 6).toUpperCase();
      }

      const link = `${window.location.origin}/?group_code=${groupCode}`;
      const shareData = {
        title: t('invite_title') || 'Join my Friend Group!',
        text: t('invite_text') || 'Join my group on FriendsMeeting!',
        url: link
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(link);
        showAlert(t('modal_info_title') || 'Notice', 'Link copied to clipboard: ' + link);
      }
    } catch (err) {
      console.error("Error sharing:", err);
      showAlert("Error sharing invite link", "Error");
    }
  };

  const getHasNewMessage = (friendId) => {
    if (!lastSeenId) return false;
    const lastSeenIndex = messages.findIndex(m => m.id === lastSeenId);
    if (lastSeenIndex === -1) return false;
    
    // Check if any message AFTER the lastSeenId was sent by this friend
    const newMessages = messages.slice(lastSeenIndex + 1);
    return newMessages.some(m => m.senderId === friendId);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark animate-fade-in-up font-sans">
      <header className="px-6 pt-10 pb-6 sticky top-0 bg-background-dark/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
             <MeetingSwitcher />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShareInvite}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="w-full h-14 bg-card-dark border-none rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
            placeholder={t('friends_search')} 
          />
        </div>
      </header>

      <main className="flex-1 px-6 overflow-y-auto scrollbar-hide pb-32">
        <section className="mb-0">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">{t('meeting_active_members')} ({friends.length})</h3>
           </div>
           
           <div className="space-y-4">
              {[...friends].sort((a, b) => a.isBlocked - b.isBlocked).map((friend) => {
                const hasNew = getHasNewMessage(friend.id);
                return (
                  <div key={friend.id} className={`flex items-center gap-4 group cursor-pointer transition-all ${friend.isBlocked ? 'opacity-50 grayscale' : ''}`}>
                    <div className="relative" onClick={() => handleFriendProfileClick(friend.id)}>
                      <div className="w-14 h-14 rounded-2xl bg-card-dark flex items-center justify-center border-2 border-white/5 shadow-xl group-hover:border-primary/50 transition-all">
                        <span className="text-[18px] font-black text-white uppercase tracking-tighter">
                          {friend.name.substring(0, 2)}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-background-dark shadow-sm ${friend.isBlocked ? 'bg-red-500' : friend.status === 'nearby' ? 'bg-blue-500' : friend.status === 'driving' ? 'bg-orange-500' : 'bg-gray-500'}`}></div>
                    </div>
                    <div className="flex-1 border-b border-white/5 py-4 group-last:border-none" onClick={() => handleFriendProfileClick(friend.id)}>
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-base font-bold text-white">
                          {friend.name} 
                          {friend.isBlocked && (
                            <span className="text-red-500 text-[10px] font-black uppercase ml-2 tracking-widest italic">
                              {t('action_block')}
                            </span>
                          )}
                        </h4>
                        {!friend.isBlocked && (
                          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest italic font-sans">{friend.status === 'nearby' ? '9m' : friend.status === 'driving' ? '2.5km' : 'far'} {t('friends_nearby_distance')}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{friend.isBlocked ? t('restricted_content') || 'Blocked User' : (friend.address || t('friends_location_sample'))}</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      {!friend.isBlocked && (
                        hasNew ? (
                          <button
                            onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}
                            className="w-12 px-3 h-10 rounded-xl bg-primary text-white flex flex-col items-center justify-center animate-pulse shadow-lg shadow-primary/30"
                          >
                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                            <span className="text-[7px] font-black uppercase">NEW</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigate(ScreenType.MEETING_DETAILS)}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <span className="material-symbols-outlined text-lg">chat_bubble</span>
                          </button>
                        )
                      )}
                      
                      <div className="flex gap-1 ml-1">
                        {friend.isBlocked ? (
                          <button
                            onClick={() => handleAction(friend.id, 'unblock')}
                            className="px-3 h-10 rounded-xl bg-white/5 border border-white/10 text-green-500 font-bold text-xs flex items-center gap-1 hover:bg-white/10 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            {t('action_unblock')}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction(friend.id, 'block')}
                              className="px-3 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs flex items-center gap-1 hover:bg-red-500/20 transition-all"
                            >
                              <span className="material-symbols-outlined text-base">block</span>
                              {t('action_block')}
                            </button>
                            {isHost && (
                              <button
                                onClick={() => kickFriend(friend.id)}
                                className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 text-red-600 flex items-center justify-center hover:bg-red-600/20 transition-all"
                                title="Kick participant"
                              >
                                <span className="material-symbols-outlined text-base">person_remove</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
           </div>
        </section>
      </main>
    </div>
  );
};

export default FriendScreens;
