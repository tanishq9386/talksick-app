import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { User } from '../shared/types';

interface UserListProps {
  users: User[];
  currentUserId: string; // This is actually the UID now
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      // Use UID for comparison instead of socket ID
      if (a.uid === currentUserId) return -1;
      if (b.uid === currentUserId) return 1;
      return a.username.localeCompare(b.username);
    });
  }, [users, currentUserId]);

  const renderUser = ({ item }: { item: User }) => {
    // Check current user by UID instead of socket ID
    const isCurrentUser = item.uid === currentUserId;
    
    return (
      <View style={[
        styles.userItem,
        isCurrentUser && styles.currentUserItem // Blue background for current user
      ]}>
        <View style={styles.userInfo}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUsername
          ]}>
            {item.username}
          </Text>
          {isCurrentUser && (
            <Text style={styles.youLabel}>You</Text>
          )}
        </View>
        
        {/* Status indicator */}
        <View style={[
          styles.statusIndicator,
          isCurrentUser ? styles.currentUserIndicator : styles.otherUserIndicator
        ]} />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No users online</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid || item.id} // Use UID as key, fallback to ID
        showsVerticalScrollIndicator={false}
        style={styles.usersList}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  currentUserItem: {
    backgroundColor: '#3B82F6', // Blue background for current user
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  currentUsername: {
    color: '#FFFFFF', // White text on blue background
    fontWeight: '600',
  },
  youLabel: {
    fontSize: 12,
    color: '#FFFFFF', // White text for "You" label
    marginTop: 2,
    opacity: 0.9,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  currentUserIndicator: {
    backgroundColor: '#FFFFFF', // White dot for current user
  },
  otherUserIndicator: {
    backgroundColor: '#10B981', // Green dot for other users (online)
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default UserList;
