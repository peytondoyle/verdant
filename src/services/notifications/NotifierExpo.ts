import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
// Simple notification interface as requested
export interface Notifier {
  scheduleLocal(params: {
    id?: string; // Optional for initial scheduling, Expo will generate one
    date: Date | number;
    body: string;
    title?: string;
    repeat?: {
      kind: 'everyNDays' | 'weekly';
      n?: number; // For everyNDays
      days?: string[]; // For weekly, e.g., ['Mon', 'Thu']
    };
  }): Promise<string>; // Returns the notification identifier
  cancel(id: string): Promise<void>;
  cancelAll(): Promise<void>;
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
        shouldShowBanner: true,
        shouldShowList: true,
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
    if (!Device.isDevice) {
      console.log('Simulator: skipping push token fetch');
      return true;
    }

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

      // For real push notifications on a device, ensure you have a projectId configured in app.json
      // Example: "extra": { "eas": { "projectId": "your-project-id" } }
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', token.data);
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocal(params: {
    id?: string;
    date: Date | number;
    body: string;
    title?: string;
    repeat?: {
      kind: 'everyNDays' | 'weekly';
      n?: number;
      days?: string[];
    };
  }): Promise<string> {
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    try {
      const identifier = params.id || Date.now().toString();
      
      // Cancel existing notification with this ID first if provided
      if (params.id) {
        await this.cancel(params.id);
      }

      // TODO: For weekly repeats, fallback to scheduling a single Date trigger 
      // and rely on TaskService to reschedule next occurrence
      let trigger: Notifications.DateTriggerInput;

      if (params.repeat) {
        console.warn('Weekly/recurring logic temporarily simplified - TaskService should handle rescheduling');
      }

      // Always use simple date trigger for now
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: params.date instanceof Date ? params.date : new Date(params.date),
        channelId: Platform.OS === 'android' ? 'garden-tasks' : undefined,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
          title: params.title || '🌱 Garden Reminder',
          body: params.body,
          data: {
            id: identifier,
            type: 'garden_task',
          },
        },
        trigger: trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new Error('Failed to schedule notification');
    }
  }

  async cancel(id: string): Promise<void> {
    try {
      // Cancel specific notification
      await Notifications.cancelScheduledNotificationAsync(id);
      
      // Also cancel any related recurring notifications that might have been scheduled with a sequence suffix
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const relatedNotifications = allNotifications.filter(notification => 
        notification.identifier.startsWith(`${id}_`)
      );

      for (const notification of relatedNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
      // Don't re-throw here as the notification might already be fired or canceled
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  private async ensurePermissions(): Promise<boolean> {
    if (!this.permissionRequested) {
      return await this.requestPermissions();
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }
}
