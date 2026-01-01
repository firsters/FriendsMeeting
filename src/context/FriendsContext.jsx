import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { subscribeToMeetings } from '../utils/meetingService';

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
          // Extract unique participants from all meetings excluding current user
          const allParticipants = [];
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

  const sendMessage = (content, senderId = 'me', senderName = '나') => {
    const newMessage = {
      id: `m-${Date.now()}`,
      senderId,
      senderName,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
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
