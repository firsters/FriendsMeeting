import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { subscribeToMeetings, sendMessage as sendFirebaseMessage, subscribeToMessages } from '../utils/meetingService';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState({ x: 50, y: 50 });
  const [lastSeenId, setLastSeenId] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [guestMeetings, setGuestMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
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
      setGuestMeetings(meetings);
      
      // Update active meeting ID if changed, prioritizing the first meeting
      if (meetings.length > 0) {
        const foundId = meetings[0].id;
        if (foundId !== activeMeetingId) {
          console.log("[FriendsContext] Setting activeMeetingId to:", foundId);
          setActiveMeetingId(foundId);
        }
      }
    });

    return () => {
      console.log("[FriendsContext] Cleaning up meeting subscription");
      unsubMeetings();
    };
  }, [currentUserId, activeMeetingId]);

  // 3. Message Subscription
  useEffect(() => {
    if (!activeMeetingId) {
      console.log("[FriendsContext] Skipping message subscription: No activeMeetingId");
      return;
    }

    console.log("[FriendsContext] Subscribing to messages for meeting:", activeMeetingId);
    const unsubMessages = subscribeToMessages(activeMeetingId, (msgs) => {
      console.log(`[FriendsContext] Messages updated for ${activeMeetingId}:`, msgs.length);
      // We overwrite but we should ideally merge if we have local pending messages.
      // For this demo, we'll rely on Firestore's speed and onSnapshot metadata if we had it.
      setMessages(msgs);
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
  };

  const sendMessage = async (content, senderId = auth.currentUser?.uid || 'me', senderName = auth.currentUser?.displayName || '나') => {
    console.log("[FriendsContext] Attempting to send message:", content);
    
    // Optimistic update for immediate feedback
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      status: 'sending'
    };
    
    // Only add to local state if we don't have an active meeting yet
    // because if we do, the Firestore listener will pick it up eventually
    if (!activeMeetingId) {
      console.warn("[FriendsContext] No active meeting, using local state only");
      setMessages(prev => [...prev, optimisticMsg]);
      return;
    }

    try {
      await sendFirebaseMessage(activeMeetingId, {
        senderId,
        senderName,
        content,
        avatar: auth.currentUser?.photoURL || (auth.currentUser?.displayName || '?').charAt(0)
      });
      console.log("[FriendsContext] Message sent to Firebase");
    } catch (err) {
      console.error("[FriendsContext] Failed to send message:", err);
      // Mark optimistic message as failed if possible (future enhancement)
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
      lastSeenId,
      setLastSeenId,
      updateFriendAddress,
      selectedFriendId,
      setSelectedFriendId
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
