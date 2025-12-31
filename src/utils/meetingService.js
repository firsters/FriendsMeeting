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

export const subscribeToMeetingDetails = (meetingId, callback) => {
  return onSnapshot(doc(db, 'meetings', meetingId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};
