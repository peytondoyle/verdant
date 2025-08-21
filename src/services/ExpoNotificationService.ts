import { NotificationService } from '../domain/ports';
import { NotifierExpo } from './notifications/NotifierExpo';

/**
 * ExpoNotificationService - Adapter to the new NotifierExpo
 * This maintains backward compatibility while delegating to the new implementation
 * @deprecated Use NotifierExpo directly for new code
 */
export class ExpoNotificationService implements NotificationService {
  private notifier: NotifierExpo;

  constructor() {
    this.notifier = new NotifierExpo();
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
    return this.notifier.scheduleLocal(params);
  }

  async cancel(id: string): Promise<void> {
    return this.notifier.cancel(id);
  }

  async cancelAll(): Promise<void> {
    return this.notifier.cancelAll();
  }
}
