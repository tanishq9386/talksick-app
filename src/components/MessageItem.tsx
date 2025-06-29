import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../shared/types';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  currentUsername: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date(timestamp));
  };

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      {isOwnMessage ? (
        // Own message - blue bubble on right (matching website)
        <View style={styles.ownMessage}>
          <Text style={styles.ownUsername}>{message.username}</Text>
          <Text style={styles.ownMessageText}>{message.text}</Text>
          <Text style={styles.ownTimestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      ) : (
        // Other's message - left aligned
        <View style={styles.otherMessage}>
          <Text style={styles.otherUsername}>{message.username}</Text>
          <Text style={styles.otherMessageText}>{message.text}</Text>
          <Text style={styles.otherTimestamp}>{formatTime(message.timestamp)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  ownMessage: {
    backgroundColor: '#3B82F6', // Blue matching website
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
    marginLeft: 60,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
    marginRight: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ownUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  ownMessageText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 20,
    marginBottom: 4,
  },
  ownTimestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
  },
  otherUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  otherMessageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  otherTimestamp: {
    fontSize: 11,
    color: '#6B7280',
    alignSelf: 'flex-end',
  },
});

export default MessageItem;
