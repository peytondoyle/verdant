import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationService, Task } from '../domain/ports';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class ExpoNotificationService implements NotificationService {
  constructor() {
    this.requestPermissions();
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return false;
    }
    
    return true;
  }

  async scheduleTaskReminder(task: Task): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Garden Task Reminder',
        body: this.generateNotificationBody(task),
        data: { taskId: task.id, type: 'task_reminder' },
      },
      trigger: {
        date: task.due_on,
      },
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      // Don't throw here as the notification might already be fired or canceled
    }
  }

  async scheduleRepeatingTask(task: Task): Promise<string[]> {
    const notificationIds: string[] = [];
    
    if (task.repeat_rule.type === 'none') {
      const id = await this.scheduleTaskReminder(task);
      return [id];
    }

    // Generate recurring notifications for the next 3 months
    const dates = this.generateRecurringDates(task.due_on, task.repeat_rule, 90); // 90 days ahead
    
    for (const date of dates) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Recurring Garden Task',
            body: this.generateNotificationBody(task),
            data: { taskId: task.id, type: 'recurring_task_reminder' },
          },
          trigger: {
            date: date,
          },
        });
        notificationIds.push(notificationId);
      } catch (error) {
        console.error('Error scheduling recurring notification:', error);
      }
    }

    return notificationIds;
  }

  private generateNotificationBody(task: Task): string {
    const taskTypeMap = {
      water: '💧 Time to water',
      fertilize: '🌱 Time to fertilize',
      prune: '✂️ Time to prune',
      harvest: '🥕 Ready to harvest',
      transplant: '🌿 Time to transplant',
      mulch: '🍂 Time to mulch',
      custom: '📝 Garden task',
    };

    const action = taskTypeMap[task.kind] || '📝 Garden task';
    
    if (task.plant_id) {
      return `${action} your plant`;
    } else if (task.bed_id) {
      return `${action} your garden bed`;
    } else {
      return `${action}`;
    }
  }

  private generateRecurringDates(startDate: Date, repeatRule: Task['repeat_rule'], daysAhead: number): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysAhead);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));

      switch (repeatRule.type) {
        case 'days':
          currentDate.setDate(currentDate.getDate() + repeatRule.interval);
          break;
        case 'weekly':
          // Move to the next occurrence of the specified day
          const daysDifference = (repeatRule.day + 7 - currentDate.getDay()) % 7;
          if (daysDifference === 0) {
            currentDate.setDate(currentDate.getDate() + 7); // Same day next week
          } else {
            currentDate.setDate(currentDate.getDate() + daysDifference);
          }
          break;
        default:
          // For 'none' type, we only want one notification
          return [startDate];
      }
    }

    return dates;
  }

  // Helper method to get all scheduled notifications (for debugging)
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Helper method to cancel all notifications for a specific task
  async cancelAllTaskNotifications(taskId: string): Promise<void> {
    const allNotifications = await this.getAllScheduledNotifications();
    const taskNotifications = allNotifications.filter(
      notification => notification.content.data?.taskId === taskId
    );

    for (const notification of taskNotifications) {
      await this.cancelNotification(notification.identifier);
    }
  }
}
