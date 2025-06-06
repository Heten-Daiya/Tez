/**
 * Types for task notifications
 */

export enum NotificationTriggerType {
  BeforeStart = 'before_start',  // Days before start date
  BeforeEnd = 'before_end',      // Days before end date
  AfterStart = 'after_start',    // Days after start date
}

export interface NotificationConfig {
  id: string;
  taskId: string;
  triggerType: NotificationTriggerType;
  daysOffset: number;          // Number of days before/after the reference date
  timeOfDay: string;          // Time of day in 24h format (HH:mm)
  snoozeIntervalMinutes: number;  // Minutes between snooze reminders
  maxSnoozeCount: number;     // Maximum number of times to snooze
  currentSnoozeCount: number; // Current number of snoozes used
  enabled: boolean;           // Whether the notification is active
  lastTriggered?: Date;      // Last time this notification was triggered
  nextTrigger?: Date;        // Next scheduled trigger time
}