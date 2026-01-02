import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { subscribeToMeetings, sendMessage as sendFirebaseMessage, subscribeToMessages } from '../utils/meetingService';
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

  // 1. Auth Subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setCurrentUserId(user?.uid || null);
      if (!user) {
        setFriends([]);
        setGuestMeetings([]);
        setActiveMeetingId(null);
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
      const participantMap = new Map();

      meetings.forEach(meeting => {
        if (meeting.participants) {
          meeting.participants.forEach(p => {
            if (p.id !== currentUserId && !participantMap.has(p.id)) {
              participantMap.set(p.id, {
                id: p.id,
                name: p.nickname || p.name || 'Unknown',
                lat: p.lat,
                lng: p.lng,
                status: p.status || 'online',
                avatar: p.avatar || (p.nickname || p.name || '?').charAt(0),
                address: p.address || ''
              });
            }
          });
        }
      });

      setFriends(Array.from(participantMap.values()));
      
      setGuestMeetings(prev => {
        const remoteIds = new Set(meetings.map(m => m.id));
        const localOnly = prev.filter(m => m.id.startsWith('guest-') && !remoteIds.has(m.id));
        const merged = [...meetings, ...localOnly];
        console.log(`[FriendsContext] Merged meetings: remote=${meetings.length}, localGuest=${localOnly.length}`);
        return merged;
      });
      
      // Auto-set active meeting if none is selected OR if currently on a guest placeholder
      const isPlaceholder = !activeMeetingId || activeMeetingId.toString().startsWith('guest-');
      if (meetings.length > 0 && isPlaceholder) {
        console.log("[FriendsContext] Auto-selecting real meeting over placeholder:", meetings[0].id);
        setActiveMeetingId(meetings[0].id);
      }
    });

    return () => {
      console.log("[FriendsContext] Cleaning up meeting subscription");
      unsubMeetings();
    };
  }, [currentUserId]); // Removed activeMeetingId from dependencies to avoid loop

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
        { id: 'host', name: 'Host (' + groupCode + ')', role: 'host', avatar: 'host' },
        { id: 'guest', name: guestNickname, role: 'guest', avatar: 'guest' } // You
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
    
    // Always create an optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderId,
      senderName,
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
        senderId,
        senderName,
        content,
        clientMsgId: tempId,
        avatar: auth.currentUser?.photoURL || (auth.currentUser?.displayName || '?').charAt(0)
      });
      console.log(`[FriendsContext] Message SUCCESS for ${targetMeetingId} (tempId: ${tempId})`);
    } catch (err) {
      console.error(`[FriendsContext] Message FAILURE for ${targetMeetingId} (tempId: ${tempId}):`, err.message || err);
      // Show actual error to user for diagnostic purposes
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
      lastSeenMap,
      setLastSeenId,
      currentUserId
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
