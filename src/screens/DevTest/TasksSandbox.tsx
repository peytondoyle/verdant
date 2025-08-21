import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { TaskKind } from '../../domain/ports';
import { initNotifications, requestNotificationPermissions } from '../../lib/notifications';
import { NotifierExpo } from '../../services/notifications/NotifierExpo';
import { TaskService } from '../../services/tasks/TaskService';
import { useTaskStore } from '../../state/taskStore';

export default function TasksSandbox() {
  const [taskService] = useState(() => new TaskService());
  const [notifier] = useState(() => new NotifierExpo());
  const [customMinutes, setCustomMinutes] = useState('1');
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scheduledCount, setScheduledCount] = useState(0);

  const taskStore = useTaskStore();

  useEffect(() => {
    // Initialize notifications when component mounts
    initNotifications();
    checkPermissionStatus();
    updateScheduledCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- demo sandbox effect; re-run not required in prod flows
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
    } catch {
      setPermissionStatus('error');
    }
  };

  const updateScheduledCount = async () => {
    try {
      const notifications = await taskService.getScheduledNotifications();
      setScheduledCount(notifications.length);
    } catch (_error) {
      console.error('Error getting scheduled notifications:', _error);
    }
  };

  const createTestTask = async (
    kind: TaskKind,
    dueInMinutes: number,
    repeatRule?: string
  ) => {
    try {
      const task = await TaskService.quickCreateTask(kind, dueInMinutes, {
        notes: `Test ${kind} task - scheduled for ${dueInMinutes} minute(s) from now`,
        repeat: repeatRule,
      });

      Alert.alert(
        'Task Created!',
        `Task "${kind}" scheduled for ${new Date(task.due_on).toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );

      await updateScheduledCount();
    } catch (error) {
      Alert.alert('Error', `Failed to create task: ${error}`);
    }
  };

  const testDirectNotification = async () => {
    try {
      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10); // 10 seconds from now

      await notifier.scheduleLocal({
        id: `test-${Date.now()}`,
        date: testDate,
        body: '🧪 This is a test notification from TasksSandbox!',
      });

      Alert.alert('Test Notification Scheduled', 'Check in 10 seconds!');
      await updateScheduledCount();
    } catch (error) {
      Alert.alert('Error', `Failed to schedule test notification: ${error}`);
    }
  };

  const testRepeatingTask = async () => {
    try {
      await createTestTask('water', 0.5, 'every:1:days'); // 30 seconds, repeat daily
      Alert.alert('Repeating Task Created', 'Water task will repeat daily');
    } catch (error) {
      Alert.alert('Error', `Failed to create repeating task: ${error}`);
    }
  };

  const clearAllTasks = async () => {
    Alert.alert(
      'Clear All Tasks',
      'This will delete all tasks and cancel all notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get all tasks and delete them
              const tasks = taskStore.tasks;
              for (const task of tasks) {
                await taskService.deleteTask(task.id);
              }
              
              Alert.alert('Success', 'All tasks cleared');
              await updateScheduledCount();
            } catch (error) {
              Alert.alert('Error', `Failed to clear tasks: ${error}`);
            }
          },
        },
      ]
    );
  };

  const showScheduledNotifications = async () => {
    try {
      const notifications = await taskService.getScheduledNotifications();
      const notificationList = notifications
        .map((n: Notifications.NotificationRequest, i: number) => {
          const when =
            (n.trigger && 'date' in n.trigger && n.trigger.date) ?
              new Date(n.trigger.date).toLocaleString() : '—';
          return `${i + 1}. ${n.content.title} - ${when}`;
        })
        .join('\n');

      Alert.alert(
        'Scheduled Notifications',
        notificationList || 'No notifications scheduled',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to get notifications: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Tasks & Notifications Sandbox</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.statusText}>
          Permissions: {permissionStatus}
        </Text>
        <Text style={styles.statusText}>
          Scheduled Notifications: {scheduledCount}
        </Text>
        <Text style={styles.statusText}>
          Tasks in Store: {taskStore.tasks.length}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Test Tasks (60 seconds)</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.waterButton]}
            onPress={() => createTestTask('water', 1)}
          >
            <Text style={styles.buttonText}>💧 Water</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.fertilizeButton]}
            onPress={() => createTestTask('fertilize', 1)}
          >
            <Text style={styles.buttonText}>🌱 Fertilize</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.harvestButton]}
            onPress={() => createTestTask('harvest', 1)}
          >
            <Text style={styles.buttonText}>🥕 Harvest</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.pruneButton]}
            onPress={() => createTestTask('prune', 1)}
          >
            <Text style={styles.buttonText}>✂️ Prune</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Timing</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={customMinutes}
            onChangeText={setCustomMinutes}
            keyboardType="numeric"
            placeholder="Minutes"
          />
          <TouchableOpacity
            style={[styles.button, styles.customButton]}
            onPress={() => createTestTask('water', parseFloat(customMinutes) || 1)}
          >
            <Text style={styles.buttonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Tests</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testDirectNotification}
        >
          <Text style={styles.buttonText}>🧪 Direct Notification (10s)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.repeatButton]}
          onPress={testRepeatingTask}
        >
          <Text style={styles.buttonText}>🔄 Repeating Task (Daily)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={showScheduledNotifications}
        >
          <Text style={styles.buttonText}>📋 Show Scheduled</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cleanup</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={updateScheduledCount}
        >
          <Text style={styles.buttonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllTasks}
        >
          <Text style={styles.buttonText}>🗑️ Clear All Tasks</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Make sure to allow notifications when prompted{'\n'}
          • Tasks will appear in your notification center at the scheduled time{'\n'}
          • Use &quot;Show Scheduled&quot; to see all pending notifications{'\n'}
          • Test with short durations first (1-2 minutes){'\n'}
          • Clear tasks when done testing to avoid notification spam
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2d3748',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2d3748',
  },
  statusText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '47%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  waterButton: {
    backgroundColor: '#3182ce',
  },
  fertilizeButton: {
    backgroundColor: '#38a169',
  },
  harvestButton: {
    backgroundColor: '#ed8936',
  },
  pruneButton: {
    backgroundColor: '#805ad5',
  },
  customButton: {
    backgroundColor: '#2d3748',
  },
  testButton: {
    backgroundColor: '#e53e3e',
  },
  repeatButton: {
    backgroundColor: '#d69e2e',
  },
  infoButton: {
    backgroundColor: '#319795',
  },
  refreshButton: {
    backgroundColor: '#4299e1',
  },
  dangerButton: {
    backgroundColor: '#e53e3e',
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    flex: 1,
    fontSize: 16,
  },
  instructions: {
    backgroundColor: '#edf2f7',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2d3748',
  },
  instructionsText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
});
