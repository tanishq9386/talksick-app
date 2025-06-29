import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../shared/config';
import { ClientToServerEvents, Message, ServerToClientEvents, User } from '../shared/types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: SocketType | null = null;
  private currentUserId: string | null = null;
  private currentRoom: string | null = null;
  private currentUsername: string | null = null;
  private connectionInterval: ReturnType<typeof setInterval> | null = null;

  // Event listeners arrays
  private messageListeners: ((message: Message) => void)[] = [];
  private userJoinedListeners: ((user: User) => void)[] = [];
  private userLeftListeners: ((user: User) => void)[] = [];
  private roomUsersListeners: ((users: User[]) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  private log(message: string, ...args: any[]): void {
    if (CONFIG.DEBUG.enabled) {
      console.log(`[SocketService] ${message}`, ...args);
    }
  }

  private logError(message: string, ...args: any[]): void {
    console.error(`[SocketService Error] ${message}`, ...args);
  }

  async initialize(userId: string, username: string): Promise<void> {
    if (this.socket?.connected) {
      this.log('Already connected, skipping initialization');
      return;
    }

    this.currentUserId = userId;
    this.currentUsername = username;
    
    await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.userId, userId);
    await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.username, username);

    this.log('Initializing connection', { username, server: CONFIG.SERVER_URL });

    // Immediately notify connection (for UI responsiveness)
    this.notifyConnectionListeners(true);

    this.socket = io(CONFIG.SERVER_URL, {
      ...CONFIG.SOCKET_OPTIONS,
      transports: ['polling'],
      upgrade: false,
    }) as SocketType;

    this.setupEventListeners();
    this.setupConnectionHandlers();
    this.startConnectionMonitoring();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('message', (message: Message) => {
      this.log('Message received', { from: message.username, room: message.room });
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('userJoined', (user: User) => {
      this.log('User joined', { username: user.username, room: user.room });
      this.userJoinedListeners.forEach(listener => listener(user));
    });

    this.socket.on('userLeft', (user: User) => {
      this.log('User left', { username: user.username, room: user.room });
      this.userLeftListeners.forEach(listener => listener(user));
    });

    this.socket.on('roomUsers', (users: User[]) => {
      this.log('Room users updated', { count: users.length });
      this.roomUsersListeners.forEach(listener => listener(users));
    });

    this.socket.on('roomMessages', (messages: Message[]) => {
      this.log('Room history received', { count: messages.length });
      messages.forEach(message => {
        this.messageListeners.forEach(listener => listener(message));
      });
    });
  }

  private setupConnectionHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.log('Connection established');
      this.notifyConnectionListeners(true);
    });

    // Only log errors in production, don't affect UI state
    this.socket.on('disconnect', (reason) => {
      if (CONFIG.DEBUG.enabled) {
        console.warn(`[SocketService] Disconnect: ${reason}`);
      }
    });

    this.socket.on('connect_error', (error) => {
      if (CONFIG.DEBUG.enabled) {
        console.warn(`[SocketService] Connect error: ${error.message}`);
      }
    });
  }

  private startConnectionMonitoring(): void {
    if (this.connectionInterval) {
      clearInterval(this.connectionInterval);
    }

    this.connectionInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.notifyConnectionListeners(true);
      }
    }, 5000);
  }

  private stopConnectionMonitoring(): void {
    if (this.connectionInterval) {
      clearInterval(this.connectionInterval);
      this.connectionInterval = null;
    }
  }

  // Room methods with UID support
  joinRoom(roomId: string, username?: string, uid?: string): void {
    if (!this.socket?.connected) {
      this.logError('Cannot join room - socket not connected');
      return;
    }

    this.currentRoom = roomId;
    const usernameToUse = username || this.currentUsername;
    const uidToUse = uid || this.currentUserId;
    
    this.log('Joining room', { room: roomId, username: usernameToUse, uid: uidToUse });
    
    this.socket.emit('joinRoom', { 
      username: usernameToUse!, 
      room: roomId,
      uid: uidToUse || undefined // Convert null to undefined
    });
  }

  leaveRoom(): void {
    if (!this.socket?.connected) return;

    if (this.currentRoom) {
      this.log('Leaving room', { room: this.currentRoom });
      this.socket.emit('leaveRoom');
      this.currentRoom = null;
    }
  }

  // Message methods with UID support
  sendMessage(text: string, roomId: string, uid?: string): void {
    if (!this.socket?.connected || !this.currentUsername) {
      this.logError('Cannot send message - socket not connected or no username');
      return;
    }

    const messageData = {
      text,
      username: this.currentUsername,
      room: roomId,
      uid: uid || this.currentUserId || undefined, // Convert null to undefined
    };

    this.log('Sending message', { room: roomId, length: text.length });
    this.socket.emit('sendMessage', messageData);
  }

  // Event listener management methods - THESE WERE MISSING
  onMessage(callback: (message: Message) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  onUserJoined(callback: (user: User) => void): () => void {
    this.userJoinedListeners.push(callback);
    return () => {
      this.userJoinedListeners = this.userJoinedListeners.filter(cb => cb !== callback);
    };
  }

  onUserLeft(callback: (user: User) => void): () => void {
    this.userLeftListeners.push(callback);
    return () => {
      this.userLeftListeners = this.userLeftListeners.filter(cb => cb !== callback);
    };
  }

  onRoomUsers(callback: (users: User[]) => void): () => void {
    this.roomUsersListeners.push(callback);
    return () => {
      this.roomUsersListeners = this.roomUsersListeners.filter(cb => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  getCurrentUsername(): string | null {
    return this.currentUsername;
  }

  disconnect(): void {
    this.log('Disconnecting socket service');
    
    this.stopConnectionMonitoring();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear state
    this.currentRoom = null;
    this.currentUserId = null;
    this.currentUsername = null;
    
    // Clear listeners
    this.messageListeners = [];
    this.userJoinedListeners = [];
    this.userLeftListeners = [];
    this.roomUsersListeners = [];
    this.connectionListeners = [];
  }
}

export default new SocketService();
