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

  // Firebase Subscription for real friends (participants)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const unsubMeetings = subscribeToMeetings(user.uid, (meetings) => {
          const participantMap = new Map();

          meetings.forEach(meeting => {
            if (meeting.participants) {
              meeting.participants.forEach(p => {
                if (p.id !== user.uid && !participantMap.has(p.id)) {
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
        });
        return () => unsubMeetings();
      } else {
        setFriends([]);
        setGuestMeetings([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Message Subscription for the first/active meeting
  useEffect(() => {
    if (guestMeetings.length > 0) {
      const activeMeeting = guestMeetings[0];
      const unsubMessages = subscribeToMessages(activeMeeting.id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubMessages();
    }
  }, [guestMeetings]);

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
    if (guestMeetings.length === 0) {
      // Fallback for local-only/unauthenticated state
      const newMessage = {
        id: `m-${Date.now()}`,
        senderId,
        senderName,
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      return;
    }

    const activeMeeting = guestMeetings[0];
    try {
      await sendFirebaseMessage(activeMeeting.id, {
        senderId,
        senderName,
        content,
        avatar: auth.currentUser?.photoURL || (auth.currentUser?.displayName || '?').charAt(0)
      });
    } catch (err) {
      console.error("Failed to send message:", err);
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
