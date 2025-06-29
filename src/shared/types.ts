export interface User {
  id: string;
  username: string;
  room: string;
}

export interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: Date;
  room: string;
}

export interface ServerToClientEvents {
  message: (message: Message) => void;
  userJoined: (user: User) => void;
  userLeft: (user: User) => void;
  roomUsers: (users: User[]) => void;
  roomMessages: (messages: Message[]) => void;
}

export interface ClientToServerEvents {
  sendMessage: (message: { text: string; username: string; room: string }) => void;
  joinRoom: (data: { username: string; room: string }) => void;
  leaveRoom: () => void;
}