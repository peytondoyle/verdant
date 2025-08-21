import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { ColorTheme, useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';

interface TaskItemProps {
  id: string;
  title: string;
  dueOn?: Date;
  repeatRule?: string;
  completedOn?: Date;
  bedName?: string;
  plantName?: string;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (id: string) => void;
}

export function TaskItem({
  id,
  title,
  dueOn,
  repeatRule,
  completedOn,
  bedName,
  plantName,
  onComplete,
  onDelete,
  onPress,
}: TaskItemProps) {
  const tintColor = useThemeColor({}, 'tint');
  const isOverdue = dueOn && dueOn < new Date() && !completedOn;
  const isCompleted = !!completedOn;

  const renderRightActions = () => (
    <View style={styles.completeAction}>
      <Text style={styles.actionText}>Complete</Text>
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.deleteAction}>
      <Text style={styles.actionText}>Delete</Text>
    </View>
  );

  return (
    <GestureHandlerRootView>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => onComplete(id)}
        renderLeftActions={renderLeftActions}
        onSwipeableWillOpen={() => onDelete(id)}
      >
        <View style={[styles.container, isCompleted && styles.completedContainer]}>
          <ThemedText
            style={[
              styles.title,
              isCompleted && styles.completedText,
              isOverdue && styles.overdueText,
            ]}
            onPress={() => onPress && onPress(id)}
          >
            {title}
          </ThemedText>
          {(dueOn || bedName || plantName) && (
            <ThemedText style={[styles.subtitle, isCompleted && styles.completedText]}>
              {dueOn && `Due: ${dueOn.toLocaleDateString()}`}
              {bedName && ` - ${bedName}`}
              {plantName && ` - ${plantName}`}
              {repeatRule && ` (${repeatRule})`}
            </ThemedText>
          )}
          {isOverdue && <Text style={styles.overdueBadge}>Overdue</Text>}
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  completedContainer: {
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  overdueText: {
    color: 'red',
  },
  overdueBadge: {
    color: 'white',
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 12,
  },
  completeAction: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    padding: 20,
  },
  deleteAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    padding: 20,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
