
export enum ScreenType {
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  CHECK_MAIL = 'CHECK_MAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  PASSWORD_UPDATED = 'PASSWORD_UPDATED',
  PERMISSIONS = 'PERMISSIONS',
  MAP = 'MAP',
  MEETINGS = 'MEETINGS',
  MEETING_DETAILS = 'MEETING_DETAILS',
  CREATE_MEETING = 'CREATE_MEETING',
  FRIENDS = 'FRIENDS',
  FRIEND_REQUESTS = 'FRIEND_REQUESTS',
  SETTINGS = 'SETTINGS',
  NEW_MARKER = 'NEW_MARKER'
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'idle' | 'driving';
  location?: string;
  distance?: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  locationName: string;
  guestsCount: number;
  status: 'upcoming' | 'active' | 'past' | 'remote';
  host: User;
  participants: User[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}
