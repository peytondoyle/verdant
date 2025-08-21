import React from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { TaskItem } from './TaskItem';
import { ThemedText } from './ThemedText';
import { Task } from '../src/domain/ports';

interface TaskListProps {
  tasks: Task[];
  onAddPress: () => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function TaskList({
  tasks,
  onAddPress,
  onComplete,
  onDelete,
  onSelect,
}: TaskListProps) {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      id={item.id}
      title={item.kind}
      dueOn={item.due_on}
      repeatRule={item.repeat_rule.type !== 'none' ? item.repeat_rule.type : undefined}
      completedOn={item.completed_on}
      onComplete={onComplete}
      onDelete={onDelete}
      onPress={onSelect}
    />
  );

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <ThemedText style={styles.emptyStateText}>No tasks yet.</ThemedText>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingBottom: 80, // To make space for the floating button
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32, // Adjust for better vertical alignment of the plus sign
  },
});
