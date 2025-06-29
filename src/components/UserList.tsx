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
  currentUserId: string;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return a.username.localeCompare(b.username);
    });
  }, [users, currentUserId]);

  const renderUser = ({ item }: { item: User }) => {
    const isCurrentUser = item.id === currentUserId;
    
    return (
      <View style={styles.userItem}>
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
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.usersList}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  username: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  currentUsername: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  youLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default UserList;
