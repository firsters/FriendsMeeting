import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { subscribeToMeetings, sendMessage as sendFirebaseMessage, subscribeToMessages, joinMeetingByCode } from '../utils/meetingService';
import { useModal } from './ModalContext';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const { showAlert } = useModal();
  const [userLocation, setUserLocation] = useState({ x: 50, y: 50 });
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [guestMeetings, setGuestMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [lastSeenMap, setLastSeenMap] = useState({}); // { meetingId: lastSeenId }
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
      
      setGuestMeetings(prev => {
        const remoteIds = new Set(meetings.map(m => m.id));
        const localOnly = prev.filter(m => m.id.startsWith('guest-') && !remoteIds.has(m.id));
        const merged = [...meetings, ...localOnly];
        console.log(`[FriendsContext] Merged meetings: remote=${meetings.length}, localGuest=${localOnly.length}`);
        return merged;
      });
      
      // Auto-set active meeting if none is selected OR if currently on a guest placeholder
      const isPlaceholder = !activeMeetingId || activeMeetingId.toString().startsWith('guest-');
      if (meetings.length > 0 && isPlaceholder) {
        console.log("[FriendsContext] Auto-selecting real meeting over placeholder:", meetings[0].id);
        setActiveMeetingId(meetings[0].id);
      }
    });

    return () => {
      console.log("[FriendsContext] Cleaning up meeting subscription");
      unsubMeetings();
    };
  }, [currentUserId]); // Removed activeMeetingId from dependencies to avoid loop

  // 3. Message Subscription
  useEffect(() => {
    if (!activeMeetingId) {
      console.log("[FriendsContext] Skipping message subscription: No activeMeetingId");
      setMessages([]);
      return;
    }

    console.log("[FriendsContext] Subscribing to messages for meeting:", activeMeetingId);
    const unsubMessages = subscribeToMessages(activeMeetingId, (remoteMsgs) => {
      console.log(`[FriendsContext] Remote messages received for ${activeMeetingId}:`, remoteMsgs.length);
      
      setMessages(prev => {
        // Keep local messages that are still "sending" or "error" and not yet in the remote list
        const localPending = prev.filter(m => m.status === 'sending' || m.status === 'error');
        
        const remoteClientIds = new Set(remoteMsgs.map(m => m.clientMsgId).filter(Boolean));
        
        // A pending message is removed if its clientMsgId is now present in the remote (persisted) list
        const filteredPending = localPending.filter(m => !remoteClientIds.has(m.id));
        
        const finalMessages = [...remoteMsgs, ...filteredPending].sort((a, b) => 
          (a.timestamp?.getTime?.() || 0) - (b.timestamp?.getTime?.() || 0)
        );
        
        console.log(`[FriendsContext] Merged message count: ${finalMessages.length} (Remote: ${remoteMsgs.length}, Pending: ${filteredPending.length})`);
        return finalMessages;
      });
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
    setActiveMeetingId(newMeeting.id); // Switch to the new guest meeting immediately
  };

  const setLastSeenId = (meetingId, messageId) => {
    setLastSeenMap(prev => ({ ...prev, [meetingId]: messageId }));
  };

  const sendMessage = async (content, senderId = auth.currentUser?.uid || 'me', senderName = auth.currentUser?.displayName || '나') => {
    console.log("[FriendsContext] sendMessage triggered:", content);
    
    const effectiveSenderId = auth.currentUser?.uid || senderId;
    const effectiveSenderName = auth.currentUser?.displayName || senderName;

    // Always create an optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderId: effectiveSenderId,
      senderName: effectiveSenderName,
      content,
      timestamp: new Date(),
      status: 'sending'
    };
    
    // Add to local state immediately
    setMessages(prev => [...prev, optimisticMsg]);
    console.log(`[FriendsContext] Optimistic message added (tempId: ${tempId}) to meeting: ${activeMeetingId}`);

    let targetMeetingId = activeMeetingId;
    
    // Rescue: If we are on a guest ID but have real meetings, try to find a match or use a real one
    if (targetMeetingId.toString().startsWith('guest-')) {
      const realMeeting = guestMeetings.find(m => !m.id.startsWith('guest-'));
      if (realMeeting) {
        console.log(`[FriendsContext] Rescue: Redirecting message from ${targetMeetingId} to real meeting ${realMeeting.id}`);
        targetMeetingId = realMeeting.id;
      }
    }

    console.log(`[FriendsContext] Finalizing send to meeting ID: ${targetMeetingId} (Type: ${targetMeetingId.toString().startsWith('guest-') ? 'GUEST/MOCK' : 'REAL/FIRESTORE'})`);

    try {
      await sendFirebaseMessage(targetMeetingId, {
        senderId: effectiveSenderId,
        senderName: effectiveSenderName,
        content,
        clientMsgId: tempId,
        avatar: auth.currentUser?.photoURL || (effectiveSenderName || '?').charAt(0)
      });
      console.log(`[FriendsContext] Message SUCCESS for ${targetMeetingId} (tempId: ${tempId})`);
    } catch (err) {
      console.error(`[FriendsContext] Message FAILURE for ${targetMeetingId}:`, err.message || err);
      
      // Diagnostic Sanity Check: Is the user actually on the participantIds list?
      try {
        const mDoc = await getDoc(doc(db, 'meetings', targetMeetingId));
        if (mDoc.exists()) {
          const mData = mDoc.data();
          const pIds = mData.participantIds || [];
          const hostId = mData.hostId || 'unknown';
          console.log(`[FriendsContext] Participation Check: Registered? ${isRegistered}. HostID: ${hostId}. List:`, pIds);
          
          if (!isRegistered) {
            console.log("[FriendsContext] Self-Join Rescue initiated...");
            try {
              const groupCode = mData.groupCode;
              if (groupCode) {
                await joinMeetingByCode(groupCode, effectiveSenderId, { nickname: effectiveSenderName });
                showAlert(`참여 정보 복구 완료! 다시 한번 메시지를 전송해 주세요.`, "권한 자동 복구");
              } else {
                showAlert(`권한 오류: 참가자 명단 미등록 및 복구 코드 부재.\nMeeting ID: ${targetMeetingId}\nYour UID: ${effectiveSenderId}`, "전송 권한 없음");
              }
            } catch (joinErr) {
              showAlert(`권한 오류: 복구 시도 중 에러: ${joinErr.message}`, "복구 실패");
            }
          } else {
            // THE PROBE: Can we write to the meeting document itself?
            let probeResult = "Checking...";
            try {
              await updateDoc(doc(db, 'meetings', targetMeetingId), { 
                lastDiagnosticAt: serverTimestamp(),
                diagnosticUser: effectiveSenderId 
              });
              probeResult = "SUCCESS (Meeting doc is writable)";
            } catch (probeErr) {
              probeResult = `FAILED (${probeErr.message})`;
            }

            showAlert(
              `보안 정책 오류 진단 결과:\n\n` +
              `1. 하위 컬렉션(Chat) 쓰기: 실패\n` +
              `2. 상위 문서(Meeting) 쓰기: ${probeResult}\n` +
              `3. 참가자 명단 포함 여부: YES\n` +
              `4. 방장(Host) ID: ${hostId}\n` +
              `5. 내 UID: ${effectiveSenderId}\n\n` +
              `*위 내용을 저에게 알려주시면 오류를 즉시 해결하겠습니다.*`, 
              "보안 규칙 상세 분석"
            );
          }
        } else {
          showAlert(`존재하지 않는 모임입니다.\nMeeting ID: ${targetMeetingId}`, "데이터 오류");
        }
      } catch (diagErr) {
        console.error("[FriendsContext] Diagnostic fetch failed:", diagErr);
        showAlert(`메시지 전송 실패: ${err.message || 'Unknown error'}\nMeeting ID: ${targetMeetingId}\nYour UID: ${effectiveSenderId}`, "전송 오류 발생");
      }
      
      // Update the optimistic message to reflect failure
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
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
      updateFriendAddress,
      selectedFriendId,
      setSelectedFriendId,
      activeMeetingId,
      setActiveMeetingId,
      lastSeenMap,
      setLastSeenId,
      currentUserId
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
