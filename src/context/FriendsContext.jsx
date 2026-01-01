import React, { createContext, useContext, useState, useEffect } from 'react';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState({ x: 50, y: 50 });
  const [friends, setFriends] = useState([
    { id: '1', nickname: 'Alex', x: 30, y: 40, avatar: 'A', color: 'accent-pink' },
    { id: '2', nickname: 'Sam', x: 70, y: 60, avatar: 'S', color: 'accent-purple' },
    { id: '3', nickname: 'Jordan', x: 85, y: 20, avatar: 'J', color: 'primary-400' },
    { id: '4', nickname: 'Casey', x: 120, y: 150, avatar: 'C', color: 'accent-blue' }, // Off-screen
    { id: '5', nickname: 'Riley', x: -20, y: 80, avatar: 'R', color: 'accent-pink' }, // Off-screen
  ]);
  const [guestMeetings, setGuestMeetings] = useState([]);
  const [messages, setMessages] = useState([
    { id: 'm1', senderId: '1', senderName: 'Alex', content: '오늘 5시에 보는 거 맞지?', timestamp: new Date(Date.now() - 3600000) },
    { id: 'm2', senderId: '2', senderName: 'Sam', content: '응응! 나 지금 가는 중이야', timestamp: new Date(Date.now() - 1800000) },
  ]);

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
        const moveX = (Math.random() - 0.5) * 0.5;
        const moveY = (Math.random() - 0.5) * 0.5;
        
        // Keep within reasonable bounds simulation
        let newX = f.x + moveX;
        let newY = f.y + moveY;
        
        if (Math.abs(newX) > 150) newX = f.x - moveX * 5;
        if (Math.abs(newY) > 150) newY = f.y - moveY * 5;

        return {
          ...f,
          x: newX,
          y: newY,
          status: Math.random() > 0.1 ? 'online' : 'away'
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FriendsContext.Provider value={{ friends, userLocation, setUserLocation, guestMeetings, joinGuestMeeting, messages, sendMessage }}>
      {children}
    </FriendsContext.Provider>
  );
};
