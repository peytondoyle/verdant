import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
// Simple notification interface as requested
export interface Notifier {
  scheduleLocal(params: {
    id: string;
    date: Date;
    body: string;
    repeatRule?: string; // Simple string format like "every:3:days" or "weekly:Mon,Thu"
  }): Promise<void>;
  cancel(id: string): Promise<void>;
}

export class NotifierExpo implements Notifier {
  private permissionRequested = false;

  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('garden-tasks', {
        name: 'Garden Tasks',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ade80', // Green color for garden theme
        description: 'Notifications for garden tasks and reminders',
      });
    }

    // Request permissions on first launch
    await this.requestPermissions();
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      this.permissionRequested = true;
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocal(params: {
    id: string;
    date: Date;
    body: string;
    repeatRule?: string;
  }): Promise<void> {
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    try {
      // Cancel existing notification with this ID first
      await this.cancel(params.id);

      if (params.repeatRule) {
        // Handle repeating notifications
        await this.scheduleRepeating(params);
      } else {
        // Schedule single notification
        await Notifications.scheduleNotificationAsync({
          identifier: params.id,
          content: {
            title: '🌱 Garden Reminder',
            body: params.body,
            data: { 
              id: params.id,
              type: 'garden_task'
            },
          },
          trigger: {
            date: params.date,
            channelId: Platform.OS === 'android' ? 'garden-tasks' : undefined,
          },
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  async cancel(id: string): Promise<void> {
    try {
      // Cancel specific notification
      await Notifications.cancelScheduledNotificationAsync(id);
      
      // Also cancel any related recurring notifications
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const relatedNotifications = allNotifications.filter(notification => 
        notification.content.data?.id === id || 
        notification.identifier.startsWith(`${id}_`)
      );

      for (const notification of relatedNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
      // Don't throw here as the notification might already be fired or canceled
    }
  }

  private async ensurePermissions(): Promise<boolean> {
    if (!this.permissionRequested) {
      return await this.requestPermissions();
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  private async scheduleRepeating(params: {
    id: string;
    date: Date;
    body: string;
    repeatRule: string;
  }): Promise<void> {
    const dates = this.parseRepeatRule(params.date, params.repeatRule);
    
    // Schedule multiple notifications for the next 90 days
    for (let i = 0; i < dates.length; i++) {
      const notificationId = i === 0 ? params.id : `${params.id}_${i}`;
      
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: '🌱 Garden Reminder',
          body: params.body,
          data: { 
            id: params.id,
            type: 'recurring_garden_task',
            sequence: i
          },
        },
        trigger: {
          date: dates[i],
          channelId: Platform.OS === 'android' ? 'garden-tasks' : undefined,
        },
      });
    }
  }

  private parseRepeatRule(startDate: Date, repeatRule: string): Date[] {
    const dates: Date[] = [];
    const maxDays = 90; // Generate notifications for next 90 days
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + maxDays);

    if (repeatRule.startsWith('every:')) {
      // Format: "every:N:days"
      const parts = repeatRule.split(':');
      if (parts.length === 3 && parts[2] === 'days') {
        const interval = parseInt(parts[1], 10);
        if (!isNaN(interval) && interval > 0) {
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + interval);
          }
        }
      }
    } else if (repeatRule.startsWith('weekly:')) {
      // Format: "weekly:Mon,Thu" or "weekly:Mon"
      const daysStr = repeatRule.substring(7); // Remove "weekly:"
      const dayNames = daysStr.split(',').map(d => d.trim());
      const dayMapping: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };

      const targetDays = dayNames
        .map(name => dayMapping[name])
        .filter(day => day !== undefined);

      if (targetDays.length > 0) {
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          // Check if current date matches any target day
          if (targetDays.includes(currentDate.getDay())) {
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    return dates;
  }

  // Debug helper
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}
