/**
 * Type definitions for the Notes application
 */

/**
 * Represents a task priority level
 */
export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

/**
 * Represents a task status
 */
export enum TaskStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed',
  OnHold = 'on_hold',
  Cancelled = 'cancelled'
}

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Critical: return 'text-red-600 dark:text-red-400';
    case TaskPriority.High: return 'text-yellow-500 dark:text-yellow-400';
    case TaskPriority.Medium: return 'text-green-500 dark:text-green-400';
    case TaskPriority.Low: return 'text-blue-500 dark:text-blue-400';
    default: return 'text-gray-500 dark:text-gray-300';
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Completed: return 'text-green-500 dark:text-green-400';
    case TaskStatus.InProgress: return 'text-blue-500 dark:text-blue-400';
    case TaskStatus.OnHold: return 'text-yellow-500 dark:text-yellow-400';
    case TaskStatus.Cancelled: return 'text-red-500 dark:text-red-400';
    case TaskStatus.NotStarted: return 'text-gray-500 dark:text-gray-300';
    default: return 'text-gray-500 dark:text-gray-300';
  }
};


/**
 * Represents a task within a note
 */
import { NotificationConfig } from './notifications';

export interface Task {
  id: string;
  title: string;           // Title/Label/Name of the task
  description: string;     // Description/Summary/Content of the task
  completed: boolean;      // Legacy field maintained for backward compatibility
  priority: TaskPriority;  // Priority level of the task
  status: TaskStatus;      // Current status of the task
  progress: number;        // Progress percentage (0-100)
  startDate?: Date;        // Optional start date with time
  endDate?: Date;          // Optional end date with time
  fulfils: string[];       // IDs of tasks that this task fulfils
  requires: string[];      // IDs of tasks that this task requires
  text?: string;           // Legacy field maintained for backward compatibility
  notifications: NotificationConfig[];  // Task notifications configuration
}

/**
 * Represents a note in the application
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  backgroundImage?: string; // Add this new property
  tasks: Task[];
  createdAt: Date;
  tags: string[];
  position?: number;
  hideTasksSection?: boolean;
  hideTagsSection?: boolean;
  hideContent?: boolean;
  hideWordCount?: boolean;
  hideReadingTime?: boolean;
  hidePendingTasks?: boolean;
}

/**
 * Settings for task display in collapsed view
 */
export interface TaskDisplaySettings {
  showTitle: boolean;
  showDescription: boolean;
  showPriority: boolean;
  showDates: boolean;
  showStatus: boolean;
  showProgress: boolean;
  showDependencies: boolean;
}

/**
 * Database type options
 */
export enum DatabaseType {
  SQLite = 'sqlite',
  PostgreSQL = 'postgresql',
  MariaDB = 'mariadb'
}

/**
 * Database configuration settings
 */
export interface DatabaseSettings {
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  enabled: boolean;
  connectionString?: string;
}

/**
 * App settings interface
 */
export interface AppSettings {
  darkMode: boolean;
  showTasksInEmbeddedNotes: boolean;
  showTagsInEmbeddedNotes: boolean;
  accentColor: string;
  backgroundImage?: string; // Add this new property
  taskDisplaySettings: TaskDisplaySettings;
}