/**
 * NoteCard component for displaying and editing individual notes
 */
import React, { useState, useEffect } from 'react';
import { Note, Task } from '../types';
import { Trash2, Settings, Minus, PanelTopOpen } from 'lucide-react';
import LexicalMarkdownEditor from './LexicalMarkdownEditor';
import { ButtonIcon } from './ButtonIcon';
import { TagsSection } from './TagsSection';
import { TasksSection } from './TasksSection';
import { SettingsPanel } from './SettingsPanel';
import { FooterStats } from './FooterStats';
import { useDebounce } from '../hooks/useDebounce';
import { bgToTextColor, bgToRingColor } from '../utils/accentColor';
import { useAppContext } from '../contexts/AppContext';

interface NoteCardProps {
  note: Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  addTask: (noteId: string) => void;
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  allNotes: Note[];
  showTasksInEmbeddedNotes?: boolean;
  dragHandleProps?: {
    [key: string]: any;
  };
  onSelect?: (noteId: string, isSelected: boolean) => void;
  isSelected?: boolean;
  accentColor?: string;
  onNavigateToNote?: (noteTitle: string) => void; // Added for wiki link navigation
}

/**
 * Component for displaying and editing a single note
 */
const NoteCard: React.FC<NoteCardProps> = ({
  note,
  updateNote,
  deleteNote,
  addTask,
  updateTask,
  deleteTask,
  allNotes,
  showTasksInEmbeddedNotes = true,
  dragHandleProps = {},
  onSelect,
  isSelected,
  accentColor,
  onNavigateToNote // Destructure the new prop
}) => {
  const { accentColor: contextAccentColor } = useAppContext();
  const effectiveAccentColor = accentColor || contextAccentColor || 'bg-indigo-600';
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);
  
  // No longer need isPreview state with the live preview editor
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(note.isCollapsed || false);
  
  const debouncedUpdateNote = useDebounce((updates: Partial<Note>) => {
    updateNote(note.id, updates);
  }, 1000);

  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
  }, [note.title, note.content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    debouncedUpdateNote({ title: newTitle });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    debouncedUpdateNote({ content: newContent });
  };

  // Inside your NoteCard component, before the return statement
  const definedIsSelected = isSelected === undefined ? false : isSelected;
  
  // Then in your JSX
  return (
    <div
      id={`note-${note.id}`}
      className={`${note.color} min-w-[288px] rounded-xl shadow-xs backdrop-blur-3xl dark:bg-gray-800/80 pb-1.5 px-1.5 transition-all duration-300 hover:shadow-xl border border-white/40 dark:border-gray-700/40`}
    >
      <div className="flex justify-between items-center flex-nowrap overflow-visible">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing touch-none flex items-center gap-1 bg-gray-100/30 dark:bg-gray-700/30 rounded-md px-1 hover:bg-gray-200/30 dark:hover:bg-gray-600/30 transition-colors duration-200"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-400">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
            <circle cx="8" cy="2" r="1" fill="currentColor" />
            <circle cx="2" cy="8" r="1" fill="currentColor" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Note title"
          value={localTitle}
          onChange={handleTitleChange}
          className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-500 dark:text-gray-300 dark:placeholder-gray-500 flex-1 min-w-0 mr-1 transition-colors duration-200 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 rounded px-1 my-2 h-6"
        />
        <div className="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex gap-2">
          <ButtonIcon
            icon={Settings}
            onClick={() => setShowSettings(!showSettings)}
            ariaLabel="Note settings"
            className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transform transition-transform ${showSettings ? 'rotate-180' : ''}`}
          />
          <ButtonIcon
            icon={isCollapsed ? PanelTopOpen : Minus}
            onClick={() => {
              const newCollapsed = !isCollapsed;
              setIsCollapsed(newCollapsed);
              debouncedUpdateNote({ isCollapsed: newCollapsed });
            }}
            ariaLabel={isCollapsed ? "Expand note" : "Collapse note"}
          />
          <ButtonIcon
            icon={Trash2}
            onClick={() => deleteNote(note.id)}
            ariaLabel="Delete note"
            className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex-shrink-0 active:scale-95 transition-transform duration-100"
          />
        </div>
      </div>

      {/* Collapsible Settings Panel */}
      {showSettings && (
        <div className="mb-1.5 transition-all duration-300 ease-in-out">
          <SettingsPanel
            note={note}
            updateNote={(updates) => updateNote(note.id, updates)}
            onClose={() => setShowSettings(false)}
            accentColor={effectiveAccentColor} // Pass accentColor if SettingsPanel uses it
          />
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'h-auto min-h-fit'}`}>
        {!isCollapsed && (
          <>
            {note.hideContent && (
              <LexicalMarkdownEditor
                value={localContent}
                onChange={(newContent) => {
                  setLocalContent(newContent);
                  debouncedUpdateNote({ content: newContent });
                }}
                note={note}
                className="text-base dark:text-gray-200 mb-4"
                notes={allNotes}
                showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
                onNavigateToNote={onNavigateToNote} // Pass navigation handler
                ancestorChain={[note.id]} // Initialize ancestor chain with the current note's ID
              />
            )}

            {note.hideTasksSection && (
              <TasksSection
                noteId={note.id}
                tasks={note.tasks}
                addTask={() => addTask(note.id)}
                updateTask={updateTask}
                deleteTask={deleteTask}
                accentColor={effectiveAccentColor}
                hideAddTask={note.hideAddTask}
              />
            )}

            {note.hideTagsSection && (
              <TagsSection note={note} updateNote={updateNote} />
            )}
          </>
        )}
      </div>
      <div className="pt-2 flex justify-between items-center text-sm">
        <input
          type="checkbox"
          checked={definedIsSelected}
          onChange={(e) => onSelect?.(note.id, e.target.checked)}
          className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 ${bgToTextColor(effectiveAccentColor)} focus:ring-2 ${bgToRingColor(effectiveAccentColor)} dark:bg-gray-700/50 hover:${bgToTextColor(effectiveAccentColor)} dark:hover:bg-gray-600/50 transition-colors duration-200 mr-2`}
          aria-label={`Select note ${note.title}`}
        />
        <div className="flex items-center">
          <FooterStats
            note={note}
            updateNote={(updates) => updateNote(note.id, updates)}
            onSettingsToggle={() => setShowSettings(!showSettings)}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
