import { auth, db } from '../firebase';
import { signInAnonymously, updateProfile } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  arrayUnion, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// Helper to generate a random 6-character group code
const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const signInAsGuest = async (nickname) => {
  const userCredential = await signInAnonymously(auth);
  const user = userCredential.user;
  await updateProfile(user, {
    displayName: nickname
  });
  return user;
};

export const createMeeting = async (meetingData, userId, userProfile) => {
  const groupCode = generateGroupCode();
  const meetingRecord = {
    ...meetingData,
    groupCode,
    hostId: userId,
    createdAt: serverTimestamp(),
    participantIds: [userId],
    participants: [{
      id: userId,
      nickname: userProfile.nickname || 'Unknown',
      avatar: userProfile.avatar || userProfile.nickname?.charAt(0) || '?',
      role: 'host',
      joinedAt: new Date().toISOString()
    }]
  };
  
  const docRef = await addDoc(collection(db, 'meetings'), meetingRecord);
  return { id: docRef.id, ...meetingRecord };
};

export const joinMeetingByCode = async (groupCode, userId, userProfile) => {
  const q = query(collection(db, 'meetings'), where('groupCode', '==', groupCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Invalid group code');
  }
  
  const meetingDoc = querySnapshot.docs[0];
  const meetingData = meetingDoc.data();
  
  // Check if already in participants
  if (meetingData.participants.some(p => p.id === userId)) {
    return { id: meetingDoc.id, ...meetingData };
  }
  
  const newParticipant = {
    id: userId,
    nickname: userProfile.nickname || 'Unknown',
    avatar: userProfile.avatar || userProfile.nickname?.charAt(0) || '?',
    role: 'member',
    joinedAt: new Date().toISOString()
  };
  
  await updateDoc(doc(db, 'meetings', meetingDoc.id), {
    participantIds: arrayUnion(userId),
    participants: arrayUnion(newParticipant)
  });
  
  return { id: meetingDoc.id, ...meetingData, participants: [...meetingData.participants, newParticipant] };
};

export const updateMeetingLocation = async (meetingId, locationData) => {
  const meetingRef = doc(db, 'meetings', meetingId);
  await updateDoc(meetingRef, {
    meetingLocation: locationData,
    updatedAt: serverTimestamp()
  });
};

export const subscribeToMeetings = (userId, callback) => {
  // Listen for meetings where the user is a participant using the dedicated IDs array
  const q = query(collection(db, 'meetings'), where('participantIds', 'array-contains', userId));
  
  return onSnapshot(q, (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(meetings);
  });
};

export const updateParticipantLocation = async (meetingId, userId, locationData) => {
  const meetingRef = doc(db, 'meetings', meetingId);
  // In a real production app, we would use a cloud function or a more granular update
  // For this PWA demo, we'll fetch then update the array
  const snapshot = await getDocs(query(collection(db, 'meetings'), where('__name__', '==', meetingId)));
  if (snapshot.empty) return;
  
  const meetingData = snapshot.docs[0].data();
  const updatedParticipants = meetingData.participants.map(p => {
    if (p.id === userId) {
      return { 
        ...p, 
        lat: locationData.lat, 
        lng: locationData.lng,
        status: locationData.status || p.status || 'nearby',
        updatedAt: new Date().toISOString()
      };
    }
    return p;
  });

  await updateDoc(meetingRef, {
    participants: updatedParticipants
  });
};

export const subscribeToMeetingDetails = (meetingId, callback) => {
  return onSnapshot(doc(db, 'meetings', meetingId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export const sendMessage = async (meetingId, messageData) => {
  const messagesRef = collection(db, 'meetings', meetingId, 'messages');
  await addDoc(messagesRef, {
    ...messageData,
    timestamp: serverTimestamp()
  });
};

export const subscribeToMessages = (meetingId, callback) => {
  const messagesRef = collection(db, 'meetings', meetingId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Fallback for timestamp if it's still being written (locally)
        timestamp: data.timestamp?.toDate() || new Date()
      };
    });
    callback(messages);
  });
};
