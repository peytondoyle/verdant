import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTasksView } from '../../hooks/useTasksView';
import { TaskList } from '../components/TaskList';

const TasksScreen: React.FC = () => {
  const { tasks, onSelectTask } = useTasksView();

  return (
    <View style={styles.container}>
      <TaskList tasks={tasks} onSelect={onSelectTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default TasksScreen;
