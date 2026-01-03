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
  serverTimestamp,
  setDoc,
  deleteDoc,
  limit
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
  }, (err) => {
    console.error("Meeting subscription error:", err);
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
  }, (err) => {
    console.error("Meeting details subscription error:", err);
  });
};

export const sendMessage = async (meetingId, messageData) => {
  console.log(`[meetingService] Sending message to meetings/${meetingId}/messages:`, messageData.clientMsgId || 'no-client-id');
  const messagesRef = collection(db, 'meetings', meetingId, 'messages');
  try {
    await addDoc(messagesRef, {
      ...messageData,
      meetingId,             // Redundant for rules
      authorId: messageData.senderId, // Some rules look for authorId
      userId: messageData.senderId,   // Generic userId
      user_id: messageData.senderId,  // Snake case variant
      uid: messageData.senderId,      // Direct UID
      createdAt: serverTimestamp(),  // Some rules preferred createdAt
      updatedAt: serverTimestamp(),
      type: 'text',                  // Standard message type
      timestamp: serverTimestamp()
    });
    console.log("[meetingService] Message successfully added to Firestore");
  } catch (err) {
    console.error("[meetingService] Failed to add message to Firestore:", err);
    throw err;
  }
};

export const subscribeToMessages = (meetingId, callback) => {
  if (!meetingId) {
    console.warn("[meetingService] subscribeToMessages called without meetingId");
    return () => {};
  }
  
  console.log(`[meetingService] Establishing subscription to: meetings/${meetingId}/messages`);
  const messagesRef = collection(db, 'meetings', meetingId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    console.log(`[Firebase] New messages received for ${meetingId}: count=${snapshot.docs.length}, fromCache=${snapshot.metadata.fromCache}`);
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      let timestamp = new Date();
      if (data.timestamp) {
        if (typeof data.timestamp.toDate === 'function') {
          timestamp = data.timestamp.toDate();
        } else if (data.timestamp instanceof Date) {
          timestamp = data.timestamp;
        } else if (typeof data.timestamp === 'number') {
          timestamp = new Date(data.timestamp);
        } else if (data.timestamp.seconds) { // Handle partial timestamp objects
          timestamp = new Date(data.timestamp.seconds * 1000);
        }
      }
      return {
        id: doc.id,
        ...data,
        timestamp
      };
    });
    callback(messages);
  }, (err) => {
    console.error(`[Firebase] Chat subscription error for ${meetingId}:`, err);
  });
};

export const updateLastReadMessage = async (meetingId, userId, messageId) => {
  if (!meetingId || !userId) return;
  const readRef = doc(db, 'meetings', meetingId, 'reads', userId);
  await setDoc(readRef, {
    lastReadMessageId: messageId,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const subscribeToReadStatus = (meetingId, userId, callback) => {
  if (!meetingId || !userId) return () => {};
  const readRef = doc(db, 'meetings', meetingId, 'reads', userId);
  return onSnapshot(readRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().lastReadMessageId);
    } else {
      callback(null);
    }
  });
};

export const getUserActiveMeeting = async (userId) => {
  const q = query(
    collection(db, 'meetings'),
    where('participantIds', 'array-contains', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  return null;
};

export const deleteMeeting = async (meetingId) => {
  if (!meetingId) return;
  // Note: Subcollections (messages) are not automatically deleted.
  // For this implementation, we rely on the client ignoring orphaned data.
  // In a real app, use a Cloud Function to recursive delete.
  await deleteDoc(doc(db, 'meetings', meetingId));
};

export const leaveMeeting = async (meetingId, userId) => {
  if (!meetingId || !userId) return;

  const meetingRef = doc(db, 'meetings', meetingId);
  const snapshot = await getDocs(query(collection(db, 'meetings'), where('__name__', '==', meetingId)));

  if (snapshot.empty) return;

  const meetingData = snapshot.docs[0].data();
  const updatedParticipants = meetingData.participants.filter(p => p.id !== userId);
  const updatedParticipantIds = meetingData.participantIds.filter(id => id !== userId);

  await updateDoc(meetingRef, {
    participants: updatedParticipants,
    participantIds: updatedParticipantIds
  });
};
