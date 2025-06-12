import React, { useMemo, useState, useCallback } from 'react';
import { Task, TaskPriority, TaskStatus, TaskDisplaySettings, TaskSortOption, Note } from '../types';
import TaskItem from './TaskItem';
import { PlusCircle, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { getAccentButtonClasses } from '../utils/accentColor';
import { useAppContext } from '../contexts/AppContext';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { MenuItem } from './MenuItem';

interface TasksSectionProps {
  noteId: string;
  tasks: Task[];
  addTask: (isNewTask?: boolean) => void;
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  taskDisplaySettings?: TaskDisplaySettings;
  accentColor?: string;
  hideAddTask?: boolean;
  taskSortOption: TaskSortOption;
  taskSortDirection: 'asc' | 'desc';
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  darkMode: boolean;
}

// SortableTaskItem wrapper
const SortableTaskItem: React.FC<Omit<React.ComponentProps<typeof TaskItem>, 'dragHandleProps'> & { id: string }> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  return <div ref={setNodeRef} style={style} {...attributes} data-task-id={props.id}><TaskItem {...props} dragHandleProps={{ ...listeners }} /></div>;
};

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
  hideAddTask,
  taskSortOption,
  taskSortDirection,
  updateNote,
  darkMode,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const taskSortOptionLabels: Record<TaskSortOption, string> = {
    title: 'Title',
    priority: 'Priority',
    status: 'Status',
    startDate: 'Start Date',
    endDate: 'End Date',
    progress: 'Progress',
    position: 'Manual Order',
  };

  const handleSetTaskSortOption = (option: TaskSortOption) => {
    if (option === taskSortOption) {
      const newDirection = taskSortDirection === 'asc' ? 'desc' : 'asc';
      updateNote(noteId, { taskSortDirection: newDirection });
    } else {
      updateNote(noteId, { taskSortOption: option, taskSortDirection: 'asc' });
    }
    setSortMenuOpen(false);
  };

  const sortedTasks = useMemo(() => {
    const tasksToSort = [...tasks];
    tasksToSort.forEach((task, index) => { if (task.position === undefined) task.position = index; });

    const sortFn = (a: Task, b: Task): number => {
      let result = 0;
      switch (taskSortOption) {
        case 'title': result = (a.title || a.text || '').localeCompare(b.title || b.text || ''); break;
        case 'priority': const pOrder: Record<TaskPriority, number> = { [TaskPriority.Critical]: 4, [TaskPriority.High]: 3, [TaskPriority.Medium]: 2, [TaskPriority.Low]: 1 }; result = (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0); break;
        case 'status': const sOrder: Record<TaskStatus, number> = { [TaskStatus.Completed]: 5, [TaskStatus.InProgress]: 4, [TaskStatus.NotStarted]: 3, [TaskStatus.OnHold]: 2, [TaskStatus.Cancelled]: 1 }; result = (sOrder[a.status] || 0) - (sOrder[b.status] || 0); break;
        case 'startDate': result = (a.startDate ? new Date(a.startDate).getTime() : 0) - (b.startDate ? new Date(b.startDate).getTime() : 0); break;
        case 'endDate': result = (a.endDate ? new Date(a.endDate).getTime() : 0) - (b.endDate ? new Date(b.endDate).getTime() : 0); break;
        case 'progress': result = (a.progress || 0) - (b.progress || 0); break;
        case 'position': default: result = (a.position ?? 0) - (b.position ?? 0); break;
      }
      return taskSortDirection === 'desc' ? -result : result;
    };
    return tasksToSort.sort(sortFn);
  }, [tasks, taskSortOption, taskSortDirection]);

  const taskItems = useMemo(() => sortedTasks.map(task => task.id), [sortedTasks]);

  // Function to handle task updates and maintain bidirectional dependencies
  /* const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
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
  }; */
  
  // Function to handle adding a new task with default values
  const handleAddTask = () => {
    // Pass true to indicate this is a new task, for auto-focus purposes
    addTask(true); 
  };

  const buttonClasses = getAccentButtonClasses(accentColor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = taskItems.indexOf(active.id as string);
      const newIndex = taskItems.indexOf(over.id as string);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrderedTaskIds = arrayMove(taskItems, oldIndex, newIndex);
      const reorderedTasks = newOrderedTaskIds.map((id, index) => {
        const task = tasks.find(t => t.id === id);
        return { ...task!, position: index };
      });
      updateNote(noteId, { tasks: reorderedTasks, taskSortOption: 'position', taskSortDirection: 'asc' });
    }
  }, [taskItems, tasks, updateNote, noteId]);

  return (
    <>
      <div className="flex justify-between items-center mb-2 ml-1.5">
        {hideAddTask && (
          <button
            onClick={handleAddTask}
            className={`${buttonClasses.base} ${buttonClasses.hover} ${buttonClasses.active} ${buttonClasses.focus} transition-transform duration-100 rounded-md border border-white/20 px-3 py-1 flex items-center active:scale-95`}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Task
          </button>
        )}
        {tasks.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                className={`flex items-center p-1 rounded-md transition-colors duration-200 text-xs ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                aria-label="Sort tasks" title="Sort tasks"
              >
                {taskSortDirection === 'asc' ? <SortAsc className="h-3 w-3 mr-1" /> : <SortDesc className="h-3 w-3 mr-1" />}
                <span>{taskSortOptionLabels[taskSortOption]}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg backdrop-blur-md z-20 border border-gray-200 dark:border-gray-700" onMouseDown={(e) => e.preventDefault()}>
                  {Object.entries(taskSortOptionLabels).map(([value, label]) => (
                    <MenuItem key={value} action={() => handleSetTaskSortOption(value as TaskSortOption)} text={label} darkMode={darkMode} isActive={taskSortOption === value} onClose={() => setSortMenuOpen(false)} />
                  ))}
                </div>
              )}
            </div>
        )}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={taskItems} strategy={rectSwappingStrategy}>
          <ul className="space-y-2 mt-2 mb-2">
            {sortedTasks.map(task => (
              <SortableTaskItem
                key={task.id}
                id={task.id}
                task={task}
                noteId={noteId}
                updateTask={updateTask}
                deleteTask={deleteTask}
                displaySettings={taskDisplaySettings}
                isNew={false}
              />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>
          {activeId ? <TaskItem task={tasks.find(task => task.id === activeId)!} noteId={noteId} updateTask={updateTask} deleteTask={deleteTask} displaySettings={taskDisplaySettings} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};
