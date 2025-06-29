import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import your components
import ChatScreen from '@/src/screens/ChatScreen';
import LoginScreen from '@/src/screens/LoginScreen';
import SocketService from '@/src/services/SocketService';
import { CONFIG } from '@/src/shared/config';

export default function Index() {
  console.log = () => {};
  console.info = () => {};
  const [currentScreen, setCurrentScreen] = useState<'login' | 'chat'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    // Monitor socket connection status
    const checkConnection = () => {
      setSocketConnected(SocketService.isConnected());
    };

    const interval = setInterval(checkConnection, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle login with both username and room (matching website)
  const handleLogin = async (loginUsername: string, room: string) => {
    try {
      // Generate userId internally
      const loginUserId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      console.log('Attempting login:', { loginUsername, room, loginUserId });
      
      // Initialize socket service
      await SocketService.initialize(loginUserId, loginUsername);
      
      // Wait for connection before proceeding
      const waitForConnection = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);
        
        const checkConnection = () => {
          if (SocketService.isConnected()) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        
        checkConnection();
      });
      
      await waitForConnection;
      
      // Join the selected room
      SocketService.joinRoom(room, loginUsername);
      
      setUserId(loginUserId);
      setUsername(loginUsername);
      setCurrentRoom(room);
      setIsLoggedIn(true);
      setCurrentScreen('chat');
      
      console.log('Login successful:', { loginUsername, room });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Connection Error', 'Failed to connect to server. Please check your internet connection and try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            console.log('Logging out...');
            SocketService.leaveRoom();
            SocketService.disconnect();
            setIsLoggedIn(false);
            setUserId(null);
            setUsername(null);
            setCurrentRoom(null);
            setCurrentScreen('login');
          }
        }
      ]
    );
  };

  // Render login screen
  if (currentScreen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <LoginScreen onLogin={handleLogin} />
        
        {/* Connection Status Footer */}
        <View style={styles.connectionStatus}>
          <View style={[
            styles.connectionDot,
            { backgroundColor: socketConnected ? CONFIG.COLORS.success : CONFIG.COLORS.error }
          ]} />
          <Text style={styles.connectionText}>
            {socketConnected ? 'Connected to server' : 'Connecting to server...'}
          </Text>
        </View>
        
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // Render chat screen
  if (currentScreen === 'chat') {
    if (!userId || !username || !currentRoom) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Session Error</Text>
            <Text style={styles.errorText}>
              Your session has expired or is invalid.
            </Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setCurrentScreen('login')}
            >
              <Text style={styles.buttonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
          <StatusBar style="auto" />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.chatContainer}>
        <ChatScreen 
          userId={userId}
          username={username}
          room={currentRoom}
          onLogout={handleLogout}
        />
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: CONFIG.COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: CONFIG.COLORS.border,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CONFIG.COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: CONFIG.COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
