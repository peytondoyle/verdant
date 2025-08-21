import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Initialize Expo notifications for the Verdant app
 * This should be called early in the app lifecycle (e.g., in App.tsx or _layout.tsx)
 */
export async function initNotifications(): Promise<void> {
  // Set the notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Set up notification channels for Android
  if (Platform.OS === 'android') {
    await setupAndroidChannels();
  }

  // Set up notification categories for iOS (if needed in the future)
  if (Platform.OS === 'ios') {
    await setupIOSCategories();
  }
}

/**
 * Set up Android notification channels
 */
async function setupAndroidChannels(): Promise<void> {
  try {
    // Main garden tasks channel
    await Notifications.setNotificationChannelAsync('garden-tasks', {
      name: 'Garden Tasks',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4ade80', // Green color for garden theme
      description: 'Notifications for garden tasks and reminders',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    // High priority channel for urgent tasks
    await Notifications.setNotificationChannelAsync('garden-urgent', {
      name: 'Urgent Garden Tasks',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 125, 250],
      lightColor: '#ef4444', // Red color for urgent tasks
      description: 'Urgent garden tasks that need immediate attention',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });

    // Low priority channel for optional reminders
    await Notifications.setNotificationChannelAsync('garden-reminders', {
      name: 'Garden Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#3b82f6', // Blue color for reminders
      description: 'Optional garden reminders and tips',
      sound: 'default',
      enableVibrate: true,
      enableLights: false,
    });

    console.log('Android notification channels set up successfully');
  } catch (error) {
    console.error('Error setting up Android notification channels:', error);
  }
}

/**
 * Set up iOS notification categories (for future use with action buttons)
 */
async function setupIOSCategories(): Promise<void> {
  try {
    // Garden task category with completion actions
    await Notifications.setNotificationCategoryAsync('garden-task', [
      {
        identifier: 'complete',
        buttonTitle: 'Mark Complete',
        options: {
          opensApp: false,
        },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Remind Later',
        options: {
          opensApp: false,
        },
      },
    ], {
      intentIdentifiers: [],
      hiddenPreviewsBodyPlaceholder: 'Garden task reminder',
    });

    // Urgent task category
    await Notifications.setNotificationCategoryAsync('garden-urgent', [
      {
        identifier: 'complete',
        buttonTitle: 'Mark Complete',
        options: {
          opensApp: false,
        },
      },
      {
        identifier: 'view',
        buttonTitle: 'View Details',
        options: {
          opensApp: true,
          foreground: true,
        },
      },
    ], {
      intentIdentifiers: [],
      hiddenPreviewsBodyPlaceholder: 'Urgent garden task',
    });

    console.log('iOS notification categories set up successfully');
  } catch (error) {
    console.error('Error setting up iOS notification categories:', error);
  }
}

/**
 * Request notification permissions
 * Returns true if permissions are granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
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

/**
 * Get the current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    return 'undetermined';
  }
}

/**
 * Helper function to determine which channel to use based on task priority
 */
export function getChannelForTask(taskKind: string, isUrgent?: boolean): string | undefined {
  if (Platform.OS !== 'android') {
    return undefined;
  }

  if (isUrgent) {
    return 'garden-urgent';
  }

  // High priority tasks
  const highPriorityTasks = ['water', 'harvest'];
  if (highPriorityTasks.includes(taskKind)) {
    return 'garden-tasks';
  }

  // Default to reminders for other tasks
  return 'garden-reminders';
}

/**
 * Helper function to determine which category to use for iOS
 */
export function getCategoryForTask(taskKind: string, isUrgent?: boolean): string | undefined {
  if (Platform.OS !== 'ios') {
    return undefined;
  }

  if (isUrgent) {
    return 'garden-urgent';
  }

  return 'garden-task';
}
