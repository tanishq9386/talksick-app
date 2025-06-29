import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MessageItem from '../components/MessageItem';
import UserList from '../components/UserList';
import SocketService from '../services/SocketService';
import { CONFIG } from '../shared/config';
import { Message, User } from '../shared/types';

interface ChatScreenProps {
  userId: string; 
  username: string;
  room: string;
  onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ userId, username, room, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keyboard listeners for fine-tuned control
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    console.log('ChatScreen mounted with UID:', userId, 'Username:', username, 'Room:', room);
    
    // Join room with UID - SocketService should be updated to handle UID
    SocketService.joinRoom(room, username, userId);

    const unsubscribeMessage = SocketService.onMessage((message) => {
      setMessages(prev => {
        const messageExists = prev.some(m => m.id === message.id);
        if (messageExists) return prev;
        return [...prev, message];
      });
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const unsubscribeUserJoined = SocketService.onUserJoined((user) => {
      setUsers(prev => {
        const filteredUsers = prev.filter(u => u.id !== user.id);
        return [...filteredUsers, user];
      });
    });

    const unsubscribeUserLeft = SocketService.onUserLeft((user) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    });

    const unsubscribeRoomUsers = SocketService.onRoomUsers((roomUsers) => {
      setUsers(roomUsers);
    });

    const unsubscribeConnection = SocketService.onConnection((connected) => {
      setIsConnected(connected);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeRoomUsers();
      unsubscribeConnection();
    };
  }, [room, username, userId]);

  const toggleUserList = () => {
    const toValue = isUserListVisible ? 0 : 1;
    setIsUserListVisible(!isUserListVisible);
    
    Animated.timing(slideAnimation, {
      toValue,
      duration: CONFIG.UI.animationDuration,
      useNativeDriver: false,
    }).start();
  };

  const handleSendMessage = (): void => {
    if (!inputText.trim()) {
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', CONFIG.ERRORS.connectionLost);
      return;
    }

    // Send message with UID for proper ownership tracking
    SocketService.sendMessage(inputText.trim(), room, userId);
    setInputText('');
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            SocketService.leaveRoom();
            SocketService.disconnect();
            onLogout();
          }
        }
      ]
    );
  };

  // Updated to use UID for message ownership
  const renderMessage = ({ item }: { item: Message }) => {
    // Use UID if available, fallback to username for backward compatibility
    const isOwnMessage = item.uid ? item.uid === userId : item.username === username;
    
    return (
      <MessageItem
        message={item}
        isOwnMessage={isOwnMessage}
        currentUsername={username}
      />
    );
  };

  const userListWidth = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  return (
    <View style={styles.container}>
      {/* Blur Header */}
      <BlurView intensity={CONFIG.UI.blurIntensity} tint="light" style={styles.blurHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.roomTitle}>Room: {room}</Text>
          <View style={styles.headerRight}>
            <View style={styles.onlineUsers}>
              <Text style={styles.onlineUsersIcon}>👥</Text>
              <Text style={styles.onlineUsersText}>
                {users.length}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.hamburgerButton}
              onPress={toggleUserList}
            >
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Main Content Area */}
      <View style={[styles.mainContent, { marginBottom: keyboardHeight > 0 ? 0 : 80 }]}>
        {/* Chat Area */}
        <View style={styles.chatArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContainer,
              { paddingBottom: keyboardHeight > 0 ? 20 : 100 }
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isConnected 
                    ? `Welcome to room ${room}! Start a conversation...` 
                    : 'Connecting to chat...'
                  }
                </Text>
              </View>
            }
          />
        </View>

        {/* Sliding User List - Updated to pass UID */}
        <Animated.View style={[styles.userListContainer, { width: userListWidth }]}>
          <BlurView intensity={60} tint="light" style={styles.userListBlur}>
            <View style={styles.userListHeader}>
              <Text style={styles.userListTitle}>
                Online Users ({users.length})
              </Text>
              <TouchableOpacity onPress={toggleUserList} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Pass UID instead of socket ID */}
            <UserList users={users} currentUserId={userId} />
          </BlurView>
        </Animated.View>
      </View>

      {/* Input Area - Fixed at bottom with keyboard handling */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <BlurView 
          intensity={90} 
          tint="dark" 
          style={[
            styles.inputBlur,
            {
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 0 : keyboardHeight - 10,
              left: 0,
              right: 0,
            }
          ]}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                !isConnected && styles.textInputDisabled
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              maxLength={CONFIG.CHAT.maxMessageLength}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
              editable={isConnected}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || !isConnected}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>

      {/* Overlay for when user list is open */}
      {isUserListVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={toggleUserList}
          activeOpacity={1}
        />
      )}

      {/* Connection Status Indicator */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Text style={styles.connectionBannerText}>
            Reconnecting to chat...
          </Text>
        </View>
      )}
    </View>
  );
};

// Keep your existing styles...
const styles = StyleSheet.create({
  // ... all your existing styles remain the same
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  blurHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  onlineUsersIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  onlineUsersText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  hamburgerButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: '#374151',
    marginVertical: 2,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  userListContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  userListBlur: {
    flex: 1,
  },
  userListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  inputBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textInputDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  sendButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  sendIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 250,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 5,
  },
  connectionBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 70,
    left: 20,
    right: 20,
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 15,
  },
  connectionBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ChatScreen;
