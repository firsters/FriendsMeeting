import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion, onSnapshot } from 'firebase/firestore';
import { subscribeToMeetings, sendMessage as sendFirebaseMessage, subscribeToMessages, joinMeetingByCode, updateLastReadMessage, subscribeToReadStatus, leaveMeeting, deleteMeeting } from '../utils/meetingService';
import { useModal } from './ModalContext';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const { showAlert } = useModal();
  const [userLocation, setUserLocation] = useState({ x: 50, y: 50 });
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [guestMeetings, setGuestMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [lastSeenMap, setLastSeenMap] = useState({}); // { meetingId: lastSeenId }
  const [currentUserId, setCurrentUserId] = useState(null);
  const [serverLastReadId, setServerLastReadId] = useState(null);
  const [isReadStatusLoaded, setIsReadStatusLoaded] = useState(false);
  const [blockedIds, setBlockedIds] = useState([]);
  
  const activeMeeting = useMemo(() => 
    guestMeetings.find(m => m.id === activeMeetingId),
    [guestMeetings, activeMeetingId]
  );

  const isHost = useMemo(() => 
    activeMeeting?.hostId === currentUserId,
    [activeMeeting, currentUserId]
  );

  const isSwitchingMeeting = useRef(false);

  // 1. Auth Subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setCurrentUserId(user?.uid || null);
      if (!user) {
        setFriends([]);
        setGuestMeetings([]);
        setActiveMeetingId(null);
        setBlockedIds([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Meeting Subscription
  useEffect(() => {
    if (!currentUserId) return;

    console.log("[FriendsContext] Subscribing to meetings for:", currentUserId);
    const unsubMeetings = subscribeToMeetings(currentUserId, (meetings) => {
      console.log("[FriendsContext] Meetings updated:", meetings.length);
      setGuestMeetings(prev => {
        const remoteIds = new Set(meetings.map(m => m.id));
        const localOnly = prev.filter(m => m.id.startsWith('guest-') && !remoteIds.has(m.id));
        const merged = [...meetings, ...localOnly];
        console.log(`[FriendsContext] Merged meetings: remote=${meetings.length}, localGuest=${localOnly.length}`);
        return merged;
      });
      
      // Auto-set active meeting if none is selected OR if currently on a guest placeholder
      // Also handle case where the active meeting was DELETED or LEAVED
      const isPlaceholder = !activeMeetingId || activeMeetingId.toString().startsWith('guest-');
      const activeIsStillValid = meetings.some(m => m.id === activeMeetingId);

      if (meetings.length > 0) {
          if (isPlaceholder || (!isPlaceholder && !activeIsStillValid)) {
             // If we lost our meeting, pick the first available
             console.log("[FriendsContext] Active meeting invalid or placeholder, switching to:", meetings[0].id);
             setActiveMeetingId(meetings[0].id);
          }
      } else {
         // No meetings left
         if (activeMeetingId && !activeMeetingId.toString().startsWith('guest-')) {
             if (!isSwitchingMeeting.current) {
                // If we didn't initiate a leave/switch, then the meeting was deleted by host (or we were kicked, though logic is same).
                console.log("[FriendsContext] Meeting disappeared unexpectedly. Triggering alert.");
                showAlert("호스트가 모임을 종료했습니다.", "모임 종료");
             } else {
                 console.log("[FriendsContext] Meeting disappeared due to intentional switch/leave.");
             }
             setActiveMeetingId(null);
             // Note: isSwitchingMeeting.current will be reset by the action that set it,
             // but strictly speaking, if it was true, we are done with the old meeting.
         }
      }
    });

    return () => {
      console.log("[FriendsContext] Cleaning up meeting subscription");
      unsubMeetings();
    };
  }, [currentUserId]);

  // 2.1 Dynamic Friends Derivation (Meeting-centric)
  useEffect(() => {
    if (!currentUserId || !activeMeetingId) {
      setFriends([]);
      return;
    }

    const currentMeeting = guestMeetings.find(m => m.id === activeMeetingId);
    if (currentMeeting && currentMeeting.participants) {
      const otherParticipants = currentMeeting.participants
        .filter(p => p.id !== currentUserId && p.id !== 'me') // Exclude self
        .filter(p => !blockedIds.includes(p.id)) // Exclude blocked users
        .map(p => ({
          id: p.id,
          name: p.nickname || p.name || 'Unknown',
          lat: p.lat,
          lng: p.lng,
          status: p.status || 'online',
          avatar: p.avatar || (p.nickname || p.name || '?').charAt(0),
          address: p.address || ''
        }));
      
      console.log(`[FriendsContext] Syncing friends for meeting ${activeMeetingId}:`, otherParticipants.length);
      setFriends(otherParticipants);
    } else {
      setFriends([]);
    }
  }, [activeMeetingId, guestMeetings, currentUserId, blockedIds]);

  // 2.2 Subscription to User's Blocked List
  useEffect(() => {
    if (!currentUserId) return;
    
    const userRef = doc(db, 'users', currentUserId);
    const unsubUser = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBlockedIds(data.blockedUsers || []);
      }
    });
    return () => unsubUser();
  }, [currentUserId]);

  // 3. Message Subscription
  useEffect(() => {
    if (!activeMeetingId) {
      console.log("[FriendsContext] Skipping message subscription: No activeMeetingId");
      setMessages([]);
      return;
    }

    console.log("[FriendsContext] Subscribing to messages for meeting:", activeMeetingId);
    const unsubMessages = subscribeToMessages(activeMeetingId, (remoteMsgs) => {
      console.log(`[FriendsContext] Remote messages received for ${activeMeetingId}:`, remoteMsgs.length);
      
      setMessages(prev => {
        // Keep local messages that are still "sending" or "error" and not yet in the remote list
        const localPending = prev.filter(m => m.status === 'sending' || m.status === 'error');
        
        const remoteClientIds = new Set(remoteMsgs.map(m => m.clientMsgId).filter(Boolean));
        
        // A pending message is removed if its clientMsgId is now present in the remote (persisted) list
        const filteredPending = localPending.filter(m => !remoteClientIds.has(m.id));
        
        const finalMessages = [...remoteMsgs, ...filteredPending].sort((a, b) => 
          (a.timestamp?.getTime?.() || 0) - (b.timestamp?.getTime?.() || 0)
        );
        
        console.log(`[FriendsContext] Merged message count: ${finalMessages.length} (Remote: ${remoteMsgs.length}, Pending: ${filteredPending.length})`);
        return finalMessages;
      });
    });

    return () => {
      console.log("[FriendsContext] Cleaning up message subscription for:", activeMeetingId);
      unsubMessages();
    };
  }, [activeMeetingId]);

  // 4. Read Status Subscription
  useEffect(() => {
    if (!activeMeetingId || !currentUserId) {
      setServerLastReadId(null);
      setIsReadStatusLoaded(false);
      return;
    }

    // Reset loaded state when switching meetings
    setIsReadStatusLoaded(false);

    const unsubRead = subscribeToReadStatus(activeMeetingId, currentUserId, (readId) => {
      console.log(`[FriendsContext] Read status updated for ${activeMeetingId}: ${readId}`);
      setServerLastReadId(readId);
      setIsReadStatusLoaded(true);
    });
    return () => unsubRead();
  }, [activeMeetingId, currentUserId]);

  const markMeetingAsRead = (messageId) => {
    if (activeMeetingId && currentUserId && messageId && messageId !== serverLastReadId) {
      // Optimistic update
      setServerLastReadId(messageId);
      updateLastReadMessage(activeMeetingId, currentUserId, messageId);
    }
  };

  const leaveCurrentMeeting = async (meetingId, userId) => {
      isSwitchingMeeting.current = true;
      try {
          await leaveMeeting(meetingId, userId);
      } finally {
          // We keep it true for a moment to allow subscription to fire
          setTimeout(() => {
              isSwitchingMeeting.current = false;
          }, 2000);
      }
  };

  const deleteCurrentMeeting = async (meetingId) => {
      isSwitchingMeeting.current = true;
      try {
          await deleteMeeting(meetingId);
      } finally {
          setTimeout(() => {
              isSwitchingMeeting.current = false;
          }, 2000);
      }
  };

  const kickFriend = async (friendId) => {
    if (!activeMeetingId || !friendId) return;
    try {
      await leaveMeeting(activeMeetingId, friendId);
      showAlert("해당 사용자를 모임에서 삭제했습니다.", "사용자 삭제");
    } catch (err) {
      showAlert("삭제 중 오류가 발생했습니다.", "오류");
    }
  };

  const blockFriend = async (friendId) => {
    if (!currentUserId || !friendId) return;
    try {
      const userRef = doc(db, 'users', currentUserId);
      await updateDoc(userRef, {
        blockedUsers: arrayUnion(friendId)
      });
      showAlert("해당 사용자를 차단했습니다.", "사용자 차단");
    } catch (err) {
      showAlert("차단 중 오류가 발생했습니다.", "오류");
    }
  };

  // Function to update a friend's address (local-only demo)
  const updateFriendAddress = (id, address) => {
    setFriends(prev => prev.map(f => f.id === id ? { ...f, address } : f));
  };

  // Function to join a guest meeting
  const joinGuestMeeting = (guestNickname, groupCode) => {
    const newMeeting = {
      id: `guest-${Date.now()}`,
      title: `${groupCode} ` + (navigator.language.startsWith('ko') ? '주최 모임' : "'s Group Meeting"),
      hostCode: groupCode,
      startTime: new Date(),
      status: 'active',
      participants: [
        { id: 'host', name: 'Host (' + groupCode + ')', nickname: 'Host (' + groupCode + ')', role: 'host', avatar: 'host' },
        { id: 'me', name: guestNickname, nickname: guestNickname, role: 'guest', avatar: 'guest' } // You
      ]
    };
    setGuestMeetings(prev => [newMeeting, ...prev]);
    setActiveMeetingId(newMeeting.id); // Switch to the new guest meeting immediately
  };

  const setLastSeenId = (meetingId, messageId) => {
    setLastSeenMap(prev => ({ ...prev, [meetingId]: messageId }));
  };

  const sendMessage = async (content, senderId = auth.currentUser?.uid || 'me', senderName = auth.currentUser?.displayName || '나') => {
    console.log("[FriendsContext] sendMessage triggered:", content);
    
    const effectiveSenderId = auth.currentUser?.uid || senderId;
    const effectiveSenderName = auth.currentUser?.displayName || senderName;

    // Always create an optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderId: effectiveSenderId,
      senderName: effectiveSenderName,
      content,
      timestamp: new Date(),
      status: 'sending'
    };
    
    // Add to local state immediately
    setMessages(prev => [...prev, optimisticMsg]);
    console.log(`[FriendsContext] Optimistic message added (tempId: ${tempId}) to meeting: ${activeMeetingId}`);

    let targetMeetingId = activeMeetingId;
    
    // Rescue: If we are on a guest ID but have real meetings, try to find a match or use a real one
    if (targetMeetingId.toString().startsWith('guest-')) {
      const realMeeting = guestMeetings.find(m => !m.id.startsWith('guest-'));
      if (realMeeting) {
        console.log(`[FriendsContext] Rescue: Redirecting message from ${targetMeetingId} to real meeting ${realMeeting.id}`);
        targetMeetingId = realMeeting.id;
      }
    }

    console.log(`[FriendsContext] Finalizing send to meeting ID: ${targetMeetingId} (Type: ${targetMeetingId.toString().startsWith('guest-') ? 'GUEST/MOCK' : 'REAL/FIRESTORE'})`);

    try {
      await sendFirebaseMessage(targetMeetingId, {
        senderId: effectiveSenderId,
        senderName: effectiveSenderName,
        content,
        clientMsgId: tempId,
        avatar: auth.currentUser?.photoURL || (effectiveSenderName || '?').charAt(0)
      });
      console.log(`[FriendsContext] Message SUCCESS for ${targetMeetingId} (tempId: ${tempId})`);
    } catch (err) {
      console.error(`[FriendsContext] Message FAILURE for ${targetMeetingId}:`, err.message || err);
      
      // Basic diagnostic alert for the user
      showAlert(`메시지 전송 실패: ${err.message || 'Unknown error'}\nMeeting ID: ${targetMeetingId}`, "전송 오류 발생");
      
      // Update the optimistic message to reflect failure
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    }
  };

  return (
    <FriendsContext.Provider value={{ 
      friends, 
      userLocation, 
      setUserLocation, 
      guestMeetings, 
      joinGuestMeeting, 
      messages, 
      sendMessage,
      updateFriendAddress,
      selectedFriendId,
      setSelectedFriendId,
      activeMeetingId,
      setActiveMeetingId,
      isHost,
      lastSeenMap,
      setLastSeenId,
      currentUserId,
      serverLastReadId,
      markMeetingAsRead,
      isReadStatusLoaded,
      leaveCurrentMeeting,
      deleteCurrentMeeting,
      kickFriend,
      blockFriend
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
