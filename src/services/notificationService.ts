/**
 * Service for managing task notifications and service worker
 */

import { NotificationConfig, NotificationTriggerType } from '../types/notifications';
import { Task } from '../types';

class NotificationService {
  private worker: ServiceWorker | null = null;
  
  /**
   * Initialize the notification service and register service worker
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    //  console.warn('Notifications are not supported in this browser');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/notification-worker.js');
      this.worker = registration.active;
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
    //    console.warn('Notification permission was not granted');
      }
    } catch (error) {
    //  console.error('Failed to register service worker:', error);
    }
  }
  
  /**
   * Create a new notification configuration for a task
   */
  createNotification(task: Task, config: Omit<NotificationConfig, 'id' | 'taskId'>): NotificationConfig {
    const notification: NotificationConfig = {
      id: crypto.randomUUID(),
      taskId: task.id,
      ...config,
      currentSnoozeCount: 0,
      enabled: true
    };
    
    // Calculate initial next trigger time
    notification.nextTrigger = this.calculateNextTrigger(task, notification);
    
    return notification;
  }
  
  /**
   * Calculate the next trigger time for a notification
   */
  private calculateNextTrigger(task: Task, config: NotificationConfig): Date | undefined {
    if (!task.startDate && !task.endDate) return undefined;
    
    const now = new Date();
    let baseDate: Date;
    
    switch (config.triggerType) {
      case NotificationTriggerType.BeforeStart:
        if (!task.startDate) return undefined;
        baseDate = new Date(task.startDate);
        baseDate.setDate(baseDate.getDate() - config.daysOffset);
        break;
        
      case NotificationTriggerType.BeforeEnd:
        if (!task.endDate) return undefined;
        baseDate = new Date(task.endDate);
        baseDate.setDate(baseDate.getDate() - config.daysOffset);
        break;
        
      case NotificationTriggerType.AfterStart:
        if (!task.startDate) return undefined;
        baseDate = new Date(task.startDate);
        baseDate.setDate(baseDate.getDate() + config.daysOffset);
        break;
        
      default:
        return undefined;
    }
    
    // Set time of day
    const [hours, minutes] = config.timeOfDay.split(':').map(Number);
    baseDate.setHours(hours, minutes, 0, 0);
    
    // Validate date after time adjustment
    if (isNaN(baseDate.getTime())) return undefined;
    
    // If the calculated time is in the past, return undefined
    return baseDate > now ? baseDate : undefined;
  }
  
  /**
   * Update notification configurations in the service worker
   */
  updateNotifications(tasks: Task[]): void {
    if (!this.worker) return;
    
    // Collect all active notifications
    const notifications = tasks.flatMap(task => 
      task.notifications
        .filter(n => n.enabled)
        .map(n => ({
          ...n,
          taskTitle: task.title || task.text || 'Untitled Task'
        }))
    );
    
    // Send to service worker
    this.worker.postMessage({
      type: 'UPDATE_NOTIFICATIONS',
      data: notifications
    });
  }
  
  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    if (!this.worker) return;
    
    this.worker.postMessage({
      type: 'CLEAR_NOTIFICATIONS',
      data: null
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();