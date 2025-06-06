/**
 * Dialog component for managing task notifications
 */
import React, { useState } from 'react';
import { NotificationConfig, NotificationTriggerType } from '../types/notifications';
import { Task } from '../types';
import { notificationService } from '../services/notificationService';
import { Bell, Plus, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getAccentButtonClasses } from '../utils/accentColor';

interface NotificationDialogProps {
  task: Task;
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  noteId: string;
  onClose: () => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  task,
  updateTask,
  noteId,
  onClose
}) => {
  const { accentColor } = useAppContext();
  const [newNotification, setNewNotification] = useState<Partial<NotificationConfig>>({
    triggerType: NotificationTriggerType.BeforeStart,
    daysOffset: 1,
    timeOfDay: '09:00',
    snoozeIntervalMinutes: 15,
    maxSnoozeCount: 3
  });

  const handleAddNotification = () => {
    const notification = notificationService.createNotification(task, newNotification as Omit<NotificationConfig, 'id' | 'taskId'>);
    const updatedNotifications = [...(task.notifications || []), notification];
    updateTask(noteId, task.id, { notifications: updatedNotifications });
    notificationService.updateNotifications([{ ...task, notifications: updatedNotifications }]);
  };

  const handleToggleNotification = (notificationId: string, enabled: boolean) => {
    const updatedNotifications = task.notifications.map(n =>
      n.id === notificationId ? { ...n, enabled } : n
    );
    updateTask(noteId, task.id, { notifications: updatedNotifications });
    notificationService.updateNotifications([{ ...task, notifications: updatedNotifications }]);
  };

  const handleDeleteNotification = (notificationId: string) => {
    const updatedNotifications = task.notifications.filter(n => n.id !== notificationId);
    updateTask(noteId, task.id, { notifications: updatedNotifications });
    notificationService.updateNotifications([{ ...task, notifications: updatedNotifications }]);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Task Notifications
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close notifications"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Existing Notifications */}
        <div className="space-y-3 mb-6">
          {task.notifications?.map(notification => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {notification.triggerType === NotificationTriggerType.BeforeStart && `${notification.daysOffset} days before start`}
                  {notification.triggerType === NotificationTriggerType.BeforeEnd && `${notification.daysOffset} days before end`}
                  {notification.triggerType === NotificationTriggerType.AfterStart && `${notification.daysOffset} days after start`}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  At {notification.timeOfDay} • Snooze {notification.maxSnoozeCount}x every {notification.snoozeIntervalMinutes}min
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleNotification(notification.id, !notification.enabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                    notification.enabled ? accentColor : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`${
                      notification.enabled ? 'translate-x-5' : 'translate-x-1'
                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                  />
                </button>
                
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Delete notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Notification */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Add New Notification</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Trigger Type</label>
              <select
                value={newNotification.triggerType}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  triggerType: e.target.value as NotificationTriggerType
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value={NotificationTriggerType.BeforeStart}>Before Start</option>
                <option value={NotificationTriggerType.BeforeEnd}>Before End</option>
                <option value={NotificationTriggerType.AfterStart}>After Start</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Days Offset</label>
              <input
                type="number"
                min="0"
                value={newNotification.daysOffset}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  daysOffset: parseInt(e.target.value)
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time of Day</label>
              <input
                type="time"
                value={newNotification.timeOfDay}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  timeOfDay: e.target.value
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Snooze Interval (min)</label>
              <input
                type="number"
                min="1"
                value={newNotification.snoozeIntervalMinutes}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  snoozeIntervalMinutes: parseInt(e.target.value)
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Snooze Count</label>
              <input
                type="number"
                min="0"
                value={newNotification.maxSnoozeCount}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  maxSnoozeCount: parseInt(e.target.value)
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <button
            onClick={handleAddNotification}
            className={`w-full mt-4 flex items-center justify-center space-x-2 ${getAccentButtonClasses(accentColor).base} ${getAccentButtonClasses(accentColor).hover} rounded-md px-4 py-2 text-sm font-medium`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;