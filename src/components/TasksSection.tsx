import React from 'react';
import { Task, TaskPriority, TaskStatus, TaskDisplaySettings } from '../types';
import TaskItem from './TaskItem';
import { PlusCircle } from 'lucide-react';
// import { ACCENT_COLORS } from '../utils/constants'; 
import { bgToTextColor, getAccentButtonClasses } from '../utils/accentColor';
import { useAppContext } from '../contexts/AppContext';

interface TasksSectionProps {
  noteId: string;
  tasks: Task[];
  addTask: (isNewTask?: boolean) => void; // Modified to accept an optional boolean
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  taskDisplaySettings?: TaskDisplaySettings;
  accentColor?: string; // Add accentColor prop
  hideAddTask?: boolean;
}

/**
 * Creates a new task with default values
 */
const createDefaultTask = (): Partial<Task> => ({
  title: '',
  description: '',
  completed: false,
  priority: TaskPriority.Medium,
  status: TaskStatus.NotStarted,
  progress: 0,
  fulfils: [],
  requires: []
});

export const TasksSection: React.FC<TasksSectionProps> = ({
  noteId,
  tasks,
  addTask,
  updateTask,
  deleteTask,
  taskDisplaySettings,
  accentColor = 'bg-indigo-600', // Default to indigo if not provided
  hideAddTask
}) => {
  // Function to handle task updates and maintain bidirectional dependencies
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // Get the task being updated
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Handle bidirectional dependencies
    if (updates.fulfils) {
      // For each task that this task fulfils, ensure it requires this task
      updates.fulfils.forEach(fulfilledTaskId => {
        const fulfilledTask = tasks.find(t => t.id === fulfilledTaskId);
        if (fulfilledTask && !fulfilledTask.requires?.includes(taskId)) {
          const newRequires = [...(fulfilledTask.requires || []), taskId];
          updateTask(noteId, fulfilledTaskId, { requires: newRequires });
        }
      });
      
      // For tasks that were previously fulfilled but now aren't, remove this task from their requires
      const removedFulfils = (task.fulfils || []).filter(id => !updates.fulfils?.includes(id));
      removedFulfils.forEach(removedId => {
        const removedTask = tasks.find(t => t.id === removedId);
        if (removedTask && removedTask.requires?.includes(taskId)) {
          const newRequires = removedTask.requires.filter(id => id !== taskId);
          updateTask(noteId, removedId, { requires: newRequires });
        }
      });
    }
    
    // Handle the reverse direction: requires
    if (updates.requires) {
      // For each task that this task requires, ensure it fulfils this task
      updates.requires.forEach(requiredTaskId => {
        const requiredTask = tasks.find(t => t.id === requiredTaskId);
        if (requiredTask && !requiredTask.fulfils?.includes(taskId)) {
          const newFulfils = [...(requiredTask.fulfils || []), taskId];
          updateTask(noteId, requiredTaskId, { fulfils: newFulfils });
        }
      });
      
      // For tasks that were previously required but now aren't, remove this task from their fulfils
      const removedRequires = (task.requires || []).filter(id => !updates.requires?.includes(id));
      removedRequires.forEach(removedId => {
        const removedTask = tasks.find(t => t.id === removedId);
        if (removedTask && removedTask.fulfils?.includes(taskId)) {
          const newFulfils = removedTask.fulfils.filter(id => id !== taskId);
          updateTask(noteId, removedId, { fulfils: newFulfils });
        }
      });
    }
    
    // Apply the updates to the task
    updateTask(noteId, taskId, updates);
  };
  
  // Function to handle adding a new task with default values
  const handleAddTask = () => {
    // Pass true to indicate this is a new task, for auto-focus purposes
    addTask(true); 
  };

  // Identify the newest task to pass the isNew prop
  // This assumes tasks are ordered by creation or that the last task in the array is the newest one after adding.
  // A more robust solution might involve tracking the ID of the newly added task.
  const newestTaskId = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
  
  // Use the utility function to get button classes
  const buttonClasses = getAccentButtonClasses(accentColor);
  
  return (
    <>
      {hideAddTask && (
        <button
          onClick={handleAddTask}
          className={`${buttonClasses.base} ${buttonClasses.hover} ${buttonClasses.active} ${buttonClasses.focus} transition-transform duration-100 rounded-md border border-white/20 px-3 py-1 flex items-center active:scale-95 ml-1.5`}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Task
        </button>
      )}
      <ul className="space-y-2 mt-2 mb-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-md border border-gray-200/20"
            task={task}
            noteId={noteId}
            updateTask={updateTask}
            deleteTask={deleteTask}
            displaySettings={taskDisplaySettings}
          />
        ))}  
      </ul>
    </>
  );
};
