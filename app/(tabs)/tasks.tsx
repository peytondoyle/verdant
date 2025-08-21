
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskList } from '../../src/components/TaskList';
import { ThemedText } from '../../src/components/ThemedText';
import { ThemedView } from '../../src/components/ThemedView';
import { RepeatRule, Task, TaskKind } from '../../src/domain/ports';
import { useTasks } from '../../src/hooks/useTasks';
import { useTaskStore } from '../../src/state/taskStore';

export default function TasksScreen() {
  const { tasks, isPending, isError, invalidateTasks } = useTasks();
  const taskStore = useTaskStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeatRule, setRepeatRule] = useState<'none' | 'daily' | 'weekly'>('none');

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty.');
      return;
    }

    try {
      const newTask = await taskStore.createTask({
        kind: title as TaskKind, // Assuming title can be mapped to TaskKind or handled otherwise
        due_on: dueDate,
        repeat_rule: {
          type: repeatRule,
          ...(repeatRule === 'daily' && { interval: 1 }), // Example: daily = every 1 day
          ...(repeatRule === 'weekly' && { day: dueDate.getDay() }), // Example: weekly = on the due date's day of week
        } as RepeatRule,
      });

      // TODO: Schedule task reminder - align in Prompt 2
      invalidateTasks();
      setModalVisible(false);
      setTitle('');
      setDueDate(new Date());
      setRepeatRule('none');
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task.');
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await taskStore.completeTask(id);
      invalidateTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskStore.deleteTask(id);
      invalidateTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      Alert.alert('Error', 'Failed to delete task.');
    }
  };

  if (isPending) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading tasks...</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error loading tasks.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Your Tasks</ThemedText>
      <TaskList
        tasks={(tasks as Task[]) || []}
        onAddPress={() => setModalVisible(true)}
        onComplete={handleCompleteTask}
        onDelete={handleDeleteTask}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Add New Task</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
            />

            <Pressable onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <ThemedText>Due Date: {dueDate.toLocaleDateString()}</ThemedText>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selectedDate) => {
                  const currentDate = selectedDate || dueDate;
                  setShowDatePicker(Platform.OS === 'ios');
                  setDueDate(currentDate);
                }}
              />
            )}

            <ThemedText style={styles.pickerLabel}>Repeat:</ThemedText>
            <Picker
              selectedValue={repeatRule}
              onValueChange={(itemValue: 'none' | 'daily' | 'weekly') => setRepeatRule(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="None" value="none" />
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
            </Picker>

            <Pressable style={styles.button} onPress={handleAddTask}>
              <ThemedText style={styles.buttonText}>Add Task</ThemedText>
            </Pressable>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  datePickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  pickerLabel: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 16,
  },
  picker: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
