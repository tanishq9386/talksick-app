import { Platform } from 'react-native';

// Environment detection
const isDevelopment = __DEV__;

export const CONFIG = {
  // Server Configuration
  SERVER_URL: 'https://chatting-app-mj2n.onrender.com',
  
  // Socket.IO Configuration
  SOCKET_OPTIONS: {
    path: '/api/socket',        
    addTrailingSlash: false,      
    transports: ['polling'], // Stable for React Native
    upgrade: false, // Disable WebSocket upgrade (prevents connection issues)
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
    withCredentials: true,
    randomizationFactor: 0.5,
  },
  
  // App Colors (iOS Design System)
  COLORS: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    accent: '#FF2D92',
    info: '#5AC8FA',
    // Chat-specific colors
    ownMessageBackground: '#007AFF',
    otherMessageBackground: '#E5E5EA',
    inputBackground: '#F2F2F7',
    headerBackground: '#F8F9FA',
  },
  
  // App Constants
  APP: {
    name: 'Talksick',
    version: '1.0.0',
    bundleId: Platform.OS === 'ios' ? 'com.talksick.app' : 'com.talksick.app',
  },
  
  // Chat Configuration
  CHAT: {
    maxMessageLength: 1000,
    maxUsernameLength: 20,
    maxRoomNameLength: 30,
    messageHistoryLimit: 100,
    typingTimeout: 2000,
    defaultRooms: ['general', 'random', 'help', 'tech'],
    rateLimitDelay: 500,
  },
  
  // UI Configuration
  UI: {
    animationDuration: 300,
    blurIntensity: 80,
    headerHeight: Platform.OS === 'ios' ? 90 : 70,
    inputHeight: 45,
    messageItemMargin: 8,
    borderRadius: {
      small: 8,
      medium: 12,
      large: 18,
      pill: 24,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      title: 24,
      header: 32,
    },
    fontWeight: {
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
    },
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    userId: 'user_id',
    username: 'username',
    lastRoom: 'last_room',
    settings: 'app_settings',
    messageHistory: 'message_history',
  },
  
  // Network Configuration
  NETWORK: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Development/Debug Configuration
  DEBUG: {
    enabled: isDevelopment,
    logLevel: isDevelopment ? 'debug' : 'error',
    showConnectionStatus: isDevelopment,
    enablePerformanceMetrics: isDevelopment,
    socketLogging: isDevelopment, // Add this for socket-specific logging
  },
  
  // Feature Flags
  FEATURES: {
    enableTypingIndicators: true,
    enableMessageReactions: false,
    enableFileSharing: false,
    enableVoiceMessages: false,
    enablePushNotifications: true,
    enableDarkMode: false,
  },
  
  // Validation Rules
  VALIDATION: {
    username: {
      minLength: 2,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]+$/,
      errorMessage: 'Username can only contain letters, numbers, underscores, and hyphens',
    },
    roomName: {
      minLength: 1,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_\-\s]+$/,
      errorMessage: 'Room name can only contain letters, numbers, spaces, underscores, and hyphens',
    },
    message: {
      minLength: 1,
      maxLength: 1000,
      errorMessage: 'Message cannot be empty and must be less than 1000 characters',
    },
  },
  
  // Error Messages
  ERRORS: {
    network: 'Network connection failed. Please check your internet connection.',
    serverUnavailable: 'Chat server is currently unavailable. Please try again later.',
    invalidCredentials: 'Invalid username or room name. Please check your input.',
    rateLimited: 'Please wait before sending another message.',
    messageEmpty: 'Message cannot be empty.',
    usernameTaken: 'Username is already taken. Please choose another.',
    roomFull: 'Room is full. Please try another room.',
    connectionLost: 'Connection lost. Attempting to reconnect...',
    reconnectFailed: 'Failed to reconnect. Please restart the app.',
  },
  
  // Success Messages
  SUCCESS: {
    connected: 'Connected to chat server',
    messageSent: 'Message sent successfully',
    joinedRoom: 'Joined room successfully',
    leftRoom: 'Left room successfully',
  },
  
  // Platform-specific Configuration
  PLATFORM: {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
    tabBarHeight: Platform.OS === 'ios' ? 83 : 56,
    keyboardBehavior: Platform.OS === 'ios' ? 'padding' : 'height',
  },
} as const;

// Type exports for better TypeScript support
export type ConfigColors = typeof CONFIG.COLORS;
export type ConfigUI = typeof CONFIG.UI;
export type ConfigValidation = typeof CONFIG.VALIDATION;

// Helper functions
export const getColor = (colorName: keyof ConfigColors): string => {
  return CONFIG.COLORS[colorName];
};

export const getSpacing = (size: keyof typeof CONFIG.UI.spacing): number => {
  return CONFIG.UI.spacing[size];
};

export const getFontSize = (size: keyof typeof CONFIG.UI.fontSize): number => {
  return CONFIG.UI.fontSize[size];
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const { minLength, maxLength, pattern, errorMessage } = CONFIG.VALIDATION.username;
  
  if (!username || username.length < minLength || username.length > maxLength) {
    return { isValid: false, error: `Username must be ${minLength}-${maxLength} characters long` };
  }
  
  if (!pattern.test(username)) {
    return { isValid: false, error: errorMessage };
  }
  
  return { isValid: true };
};

export const validateRoomName = (roomName: string): { isValid: boolean; error?: string } => {
  const { minLength, maxLength, pattern, errorMessage } = CONFIG.VALIDATION.roomName;
  
  if (!roomName || roomName.length < minLength || roomName.length > maxLength) {
    return { isValid: false, error: `Room name must be ${minLength}-${maxLength} characters long` };
  }
  
  if (!pattern.test(roomName)) {
    return { isValid: false, error: errorMessage };
  }
  
  return { isValid: true };
};

export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  const { minLength, maxLength, errorMessage } = CONFIG.VALIDATION.message;
  
  if (!message || message.trim().length < minLength) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > maxLength) {
    return { isValid: false, error: `Message must be less than ${maxLength} characters` };
  }
  
  return { isValid: true };
};

// Logging utility
export const log = {
  debug: (message: string, ...args: any[]) => {
    if (CONFIG.DEBUG.enabled) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (CONFIG.DEBUG.enabled) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

export default CONFIG;
