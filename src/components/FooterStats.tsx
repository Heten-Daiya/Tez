import React from 'react';
import { Note, Task, TaskStatus } from '../types';
import { AlarmClockMinus,
  AlarmClock,
  AlarmClockCheck,
  Hourglass,
  AlarmClockOff } from 'lucide-react';
import { extractTextFromLexical } from '../utils/lexicalUtils';

export const FooterStats = ({
  note,
  updateNote,
  onSettingsToggle
}: {
  note: Note;
  updateNote: (updates: Partial<Note>) => void;
  onSettingsToggle: () => void;
}) => {
  const contentText = extractTextFromLexical(note.content);
  const contentWords = contentText.trim().split(/\s+/).filter(Boolean).length;
  const taskWords = note.tasks.reduce((acc, task) => {
    const taskTitle = (task.title || task.text || '').trim().split(/\s+/).filter(Boolean).length;
    const taskDesc = (task.description || '').trim().split(/\s+/).filter(Boolean).length;
    return acc + taskTitle + taskDesc;
  }, 0);
  const totalWords = contentWords + taskWords;
  const ytsTasks = note.tasks.filter(task => task.status === TaskStatus.NotStarted).length;
  const wipTasks = note.tasks.filter(task => task.status === TaskStatus.InProgress).length;
  const heldTasks = note.tasks.filter(task => task.status === TaskStatus.OnHold).length;
  const dropTasks = note.tasks.filter(task => task.status === TaskStatus.Cancelled).length;
  const doneTasks = note.tasks.filter(task => task.completed).length;
  return (
    <div className="flex items-center text-gray-500 dark:text-gray-400 h-4">
      {note.hideWordCount && `${totalWords} words`}
      {note.hideWordCount && note.hideReadingTime && ' • '}
      {note.hideReadingTime && `${Math.ceil(totalWords / 200)} min read`}
      {note.tasks.length > 0 && note.hidePendingTasks && (
        <>
          {(note.hideWordCount || note.hideReadingTime) && ' • '}
          {doneTasks} done of {note.tasks.length} {note.tasks.length === 1 ? 'task' : 'tasks'}
        </>
      )}
    </div>
  );
};
