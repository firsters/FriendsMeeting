import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
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

export const createMeeting = async (meetingData, userId, userProfile) => {
  const groupCode = generateGroupCode();
  const meetingRecord = {
    ...meetingData,
    groupCode,
    hostId: userId,
    createdAt: serverTimestamp(),
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
    participants: arrayUnion(newParticipant)
  });
  
  return { id: meetingDoc.id, ...meetingData, participants: [...meetingData.participants, newParticipant] };
};

export const subscribeToMeetings = (userId, callback) => {
  // Listen for meetings where the user is a participant
  const q = query(collection(db, 'meetings'), where('participants', 'array-contains-any', [{ id: userId }]));
  // Note: array-contains-any with objects is tricky in Firestore. 
  // Simplified for this demo: query all meetings and filter on client side if needed, 
  // or structure data differently (e.g., participantsIds array).
  
  // Better approach for Firestore:
  const qBetter = query(collection(db, 'meetings')); // Actually, let's just use IDs for filtering if possible
  
  return onSnapshot(collection(db, 'meetings'), (snapshot) => {
    const meetings = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(m => m.participants.some(p => p.id === userId));
    callback(meetings);
  });
};

export const subscribeToMeetingDetails = (meetingId, callback) => {
  return onSnapshot(doc(db, 'meetings', meetingId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};
