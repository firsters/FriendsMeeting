import React, { createContext, useContext, useState, useEffect } from 'react';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState({ x: 50, y: 50 });
  const [lastSeenId, setLastSeenId] = useState(null);
  const [friends, setFriends] = useState([
    { id: '1', name: '김지아', nickname: 'Alex', lat: 37.5665, lng: 126.9780, avatar: 'A', color: 'accent-pink', image: 'https://picsum.photos/seed/friend1/100/100', status: 'nearby', address: '' },
    { id: '2', name: '이현우', nickname: 'Sam', lat: 37.5650, lng: 126.9800, avatar: 'S', color: 'accent-purple', image: 'https://picsum.photos/seed/friend2/100/100', status: 'driving', address: '' },
    { id: '3', name: '박서준', nickname: 'Jordan', lat: 37.5670, lng: 126.9760, avatar: 'J', color: 'primary-400', image: 'https://picsum.photos/seed/friend3/100/100', status: 'idle', address: '' },
    { id: '4', name: 'Casey', nickname: 'Casey', lat: 37.5680, lng: 126.9820, avatar: 'C', color: 'accent-blue', image: 'https://picsum.photos/seed/friend4/100/100', status: 'nearby', address: '' },
    { id: '5', name: 'Riley', nickname: 'Riley', lat: 37.5640, lng: 126.9740, avatar: 'R', color: 'accent-pink', image: 'https://picsum.photos/seed/friend5/100/100', status: 'online', address: '' },
  ]);
  const [guestMeetings, setGuestMeetings] = useState([]);
  const [messages, setMessages] = useState([
    { id: 'm1', senderId: '1', senderName: '김지아', content: '오늘 5시에 보는 거 맞지?', timestamp: new Date(Date.now() - 3600000) },
    { id: 'm2', senderId: '2', senderName: '이현우', content: '응응! 나 지금 가는 중이야', timestamp: new Date(Date.now() - 1800000) },
  ]);

  // Function to update a friend's address (called from components with map access)
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

  // Simulate real-time movement and status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFriends(prev => prev.map(f => {
        // More purposeful movement
        const moveLat = (Math.random() - 0.5) * 0.0005;
        const moveLng = (Math.random() - 0.5) * 0.0005;
        
        return {
          ...f,
          lat: f.lat + moveLat,
          lng: f.lng + moveLng,
          status: Math.random() > 0.1 ? f.status : (Math.random() > 0.5 ? 'nearby' : 'driving')
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      updateFriendAddress
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
