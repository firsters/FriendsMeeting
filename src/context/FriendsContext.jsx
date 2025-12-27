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
    <FriendsContext.Provider value={{ friends, userLocation, setUserLocation }}>
      {children}
    </FriendsContext.Provider>
  );
};
