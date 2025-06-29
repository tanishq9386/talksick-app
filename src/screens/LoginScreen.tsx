import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CONFIG } from '../shared/config';

interface LoginScreenProps {
  // Updated to match website - expects username AND room
  onLogin: (username: string, room: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!room.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert('Error', 'Username must be at least 2 characters long');
      return;
    }

    if (username.trim().length > 20) {
      Alert.alert('Error', 'Username must be 20 characters or less');
      return;
    }

    if (room.trim().length < 1) {
      Alert.alert('Error', 'Room name cannot be empty');
      return;
    }

    if (room.trim().length > 30) {
      Alert.alert('Error', 'Room name must be 30 characters or less');
      return;
    }

    // Check for invalid characters in username
    const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validUsernameRegex.test(username.trim())) {
      Alert.alert('Error', 'Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    // Check for invalid characters in room name (allow spaces and more characters)
    const validRoomRegex = /^[a-zA-Z0-9_\-\s]+$/;
    if (!validRoomRegex.test(room.trim())) {
      Alert.alert('Error', 'Room name can only contain letters, numbers, spaces, underscores, and hyphens');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username.trim(), room.trim().toLowerCase());
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to chat server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Join Chat Room</Text>
            <Text style={styles.subtitle}>
              Enter your details to start chatting
            </Text>
          </View>

          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled
                ]}
                placeholder="Enter your username"
                placeholderTextColor={CONFIG.COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                maxLength={20}
                returnKeyType="next"
                editable={!isLoading}
                selectTextOnFocus
                onSubmitEditing={() => {
                  // Focus room input when username is submitted
                }}
              />
            </View>

            {/* Room Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room</Text>
              <TextInput
                style={[
                  styles.input,
                  isLoading && styles.inputDisabled
                ]}
                placeholder="Enter room name"
                placeholderTextColor={CONFIG.COLORS.textSecondary}
                value={room}
                onChangeText={setRoom}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                returnKeyType="done"
                editable={!isLoading}
                selectTextOnFocus
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Joining Room...' : 'Join Room'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🌐 Chat with users on web and mobile
            </Text>
            <Text style={styles.footerSubtext}>
              Create a new room or join an existing one
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CONFIG.COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CONFIG.COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: CONFIG.COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    color: CONFIG.COLORS.text,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: CONFIG.COLORS.border,
  },
  button: {
    backgroundColor: CONFIG.COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: CONFIG.COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: CONFIG.COLORS.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  suggestionsContainer: {
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 12,
    color: CONFIG.COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: CONFIG.COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CONFIG.COLORS.border,
    margin: 2,
  },
  suggestionText: {
    fontSize: 12,
    color: CONFIG.COLORS.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
