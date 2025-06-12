/**
 * TaskItem component for displaying and editing individual tasks
 */
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, TaskStatus, getPriorityColor, getStatusColor } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  BellPlus,
  Bell,
  BellRing,
  AlarmClockMinus,
  AlarmClock,
  AlarmClockCheck,
  Hourglass,
  AlarmClockOff
} from 'lucide-react';
import { PriorityIcon } from './ui/PriorityIcon';
import Accordion from './Accordion';
import NotificationDialog from './NotificationDialog';
import { notificationService } from '../services/notificationService';
import { isValidJSON } from '../utils/jsonUtils';
import TaskLexicalEditor from './TaskLexicalEditor';

interface TaskItemProps {
  task: Task;
  noteId: string;
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  isNew?: boolean; // To identify newly added tasks for auto-focus
  displaySettings?: {
    showTitle: boolean;
    showDescription: boolean;
    showPriority: boolean;
    showDates: boolean;
    showStatus: boolean;
    showProgress: boolean;
    showDependencies: boolean;
  };
  dragHandleProps?: { [key:string]: any }; // Added for drag handle
}

// Default display settings if none provided
const defaultDisplaySettings = {
  showTitle: true,
  showDescription: false,
  showPriority: true,
  showDates: false,
  showStatus: true,
  showProgress: false,
  showDependencies: false,
};

/**
 * Component for displaying and editing a single task
 */
const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  noteId, 
  updateTask, 
  deleteTask,
  isNew = false, // Default isNew to false
  displaySettings = defaultDisplaySettings,
  dragHandleProps = {} // Destructure dragHandleProps
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(isNew);
  const [editableTitle, setEditableTitle] = useState(task.title || task.text || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize();
  }, []);

  useEffect(() => {
    if (isNew && titleInputRef.current) {
      titleInputRef.current.focus();
      // Select the text if it's 'Untitled Task' or empty for better UX
      if (editableTitle === 'Untitled Task' || !editableTitle) {
        titleInputRef.current.select();
      }
    }
  }, [isNew, editableTitle]);

  // Update editableTitle when task.title changes externally
  useEffect(() => {
    setEditableTitle(task.title || task.text || '');
  }, [task.title, task.text]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (editableTitle.trim() === '') {
        updateTask(noteId, task.id, { title: 'Untitled Task', text: 'Untitled Task' });
        setEditableTitle('Untitled Task'); // Reset local state if it was empty
    } else {
        updateTask(noteId, task.id, { title: editableTitle, text: editableTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.stopPropagation(); // Prevent spacebar from triggering accordion or other parent actions
    }
    if (e.key === 'Enter') {
      handleTitleBlur(); // Save and exit edit mode
    }
    if (e.key === 'Escape') {
      setEditableTitle(task.title || task.text || ''); // Revert changes
      setIsEditingTitle(false);
    }
  };
  // Convert UTC date to local date string for display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    const localDate = new Date(date);
    return localDate.toLocaleString();
  };

  // Convert local datetime-local input value to UTC date
  const localToUTC = (dateStr: string): Date => {
    return new Date(dateStr);
  };

  // Convert UTC date to local datetime-local input value
  const UTCToLocal = (date: Date): string => {
    const localDate = new Date(date);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
  };

  // Get priority color
  

  // Get status color
  

  // Accordion title content (collapsed view)
  const accordionTitle = (
    <div className="flex items-center space-x-2 w-full">
      {/* Drag Handle */}
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing touch-none p-1">
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-400">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
          <circle cx="8" cy="2" r="1" fill="currentColor" />
          <circle cx="2" cy="8" r="1" fill="currentColor" />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
        </svg>
      </div>
      {/* Task completion toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          updateTask(noteId, task.id, { 
            completed: !task.completed,
            status: !task.completed ? TaskStatus.Completed : TaskStatus.InProgress
          });
        }}
        className="flex-shrink-0"
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      {/* Task title - Editable */}
      {displaySettings.showTitle && (
        isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editableTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
            className={`flex-shrink font-medium prose dark:prose-invert max-w-none bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 h-6 flex-grow min-w-0 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}
            placeholder="Task title"
          />
        ) : (
          <span 
            onClick={(e) => {
              e.stopPropagation(); // Prevent accordion toggle if we are just clicking the title to edit
              setIsEditingTitle(true);
              // Ensure titleInputRef is focused after state update
              setTimeout(() => titleInputRef.current?.focus(), 0);
            }}
            className={`cursor-pointer flex-grow font-medium prose dark:prose-invert max-w-none ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {editableTitle || 'Untitled Task'}
          </span>
        )
      )}
      <div className="flex items-center gap-2 shrink-0">
      {/* Priority indicator */}
      {displaySettings.showPriority && task.priority && (
        <PriorityIcon priority={task.priority} />
      )}

      {/* Status indicator */}
      {displaySettings.showStatus && task.status && (
          <span className={`text-xs rounded-md ${getStatusColor(task.status)}`}>
          {task.status === TaskStatus.NotStarted && <AlarmClockMinus className="h-4 w-4 text-gray-400" />}
          {task.status === TaskStatus.InProgress && <AlarmClock className="h-4 w-4 text-indigo-500" />}
          {task.status === TaskStatus.Completed && <AlarmClockCheck className="h-4 w-4 text-green-500" />}
          {task.status === TaskStatus.OnHold && <Hourglass className="h-4 w-4 text-yellow-500" />}
          {task.status === TaskStatus.Cancelled && <AlarmClockOff className="h-4 w-4 text-red-500" />}
        </span>
      )}

      {/* Progress indicator */}
      {displaySettings.showProgress && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{task.progress}%</span>
      )}

      {/* Date indicators */}
      {displaySettings.showDates && (task.startDate || task.endDate) && (
        <span className="text-xs text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {task.startDate && formatDate(task.startDate)}
          {task.startDate && task.endDate && ' - '}
          {task.endDate && formatDate(task.endDate)}
        </span>
      )}

        {/* Notification button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowNotifications(true);
          }}
          className="text-gray-400 hover:text-indigo-500"
        >
          {task.notifications?.length > 0 ? (
            task.notifications.some(n => n.active) ? 
              <BellRing className="h-4 w-4 text-indigo-500" /> : 
              <Bell className="h-4 w-4 text-gray-400" />
          ) : (
            <BellPlus className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Delete task button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(noteId, task.id);
          }}
          className="text-gray-400 hover:text-red-500"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );

  return (
    <li className="group">
      <Accordion 
        title={accordionTitle}
        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-md border border-gray-200/20"
        titleClassName={`py-2 px-3 ${task.completed ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}
      >
        <div className="space-y-3 pt-2">
          {/* Title input - REMOVED as it's now in the accordion title */}

          {/* Description input with Lexical Editor */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>
            <TaskLexicalEditor
              value={task.description || ''}
              onChange={(value) => {
  if (isValidJSON(value)) {
    updateTask(noteId, task.id, { description: value });
  } else {
    console.error('Invalid editor state:', value);
  }
}}
notes={[{ id: noteId, tasks: [], title: '', content: '', color: '', createdAt: new Date(), tags: [] }]}
              className="border border-gray-300 dark:border-gray-700 rounded p-1 text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={task.startDate ? UTCToLocal(new Date(task.startDate)) : ''}
                onChange={(e) => {
                  const date = e.target.value ? localToUTC(e.target.value) : undefined;
                  updateTask(noteId, task.id, { startDate: date });
                }}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={task.endDate ? UTCToLocal(new Date(task.endDate)) : ''}
                onChange={(e) => {
                  const date = e.target.value ? localToUTC(e.target.value) : undefined;
                  updateTask(noteId, task.id, { endDate: date });
                }}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select
                value={task.priority || TaskPriority.Medium}
                onChange={(e) => updateTask(noteId, task.id, { 
                  priority: e.target.value as TaskPriority 
                })}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={task.status || TaskStatus.NotStarted}
                onChange={(e) => {
                  const newStatus = e.target.value as TaskStatus;
                  updateTask(noteId, task.id, { 
                    status: newStatus,
                    // Update completed flag based on status
                    completed: newStatus === TaskStatus.Completed
                  });
                }}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-1 text-sm text-gray-900 dark:text-gray-100"
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>
                    {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Progress ({task.progress || 0}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={task.progress || 0}
              onChange={(e) => updateTask(noteId, task.id, { progress: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 dark:accent-indigo-400"
            />
          </div>



          {/* Dependencies section - placeholder for future implementation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Dependencies</h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Dependencies functionality will be implemented in a future update.
            </div>
          </div>
        </div>
      </Accordion>
      {showNotifications && (
        <NotificationDialog
          task={task}
          noteId={noteId}
          updateTask={updateTask}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </li>
  );
};


export default TaskItem;
