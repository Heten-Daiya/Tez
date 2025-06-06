import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Task } from '../types';
import { useNotes } from '../hooks/useNotes';
import { useNoteIO } from '../hooks/useNoteIO';
import { getCachedNotes, cacheNotes } from '../utils/cacheUtils';
import { filterNotes } from '../utils/noteUtils';

type NotesContextType = {
  notes: Note[];
  filteredNotes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createNote: () => string | null;
  updateNote: (noteId: string, updates: Partial<Note>) => boolean;
  deleteNote: (noteId: string, skipConfirmation?: boolean) => boolean;
  addTask: (noteId: string) => void;
  updateTask: (noteId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  exportNotes: () => Promise<void>;
  importNotes: () => Promise<void>;
  importNotesFromFiles: (files: FileList | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  // State for notes management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize notes state directly in the component
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        return parsedNotes.map((note: Note) => ({
          ...note,
          id: note.id || Date.now().toString(),
          title: note.title || '',
          content: note.content || '',
          color: note.color || 'bg-slate-100/90 dark:bg-slate-900/80',
          tasks: Array.isArray(note.tasks) ? note.tasks.map(task => ({
            ...task,
            id: task.id || Date.now().toString(),
            text: task.text || '',
            completed: Boolean(task.completed)
          })) : [],
          createdAt: new Date(note.createdAt || Date.now()),
          tags: Array.isArray(note.tags) ? note.tags : [],
          isMaximized: Boolean(note.isMaximized),
          isCollapsed: Boolean(note.isCollapsed),
          position: typeof note.position === 'number' ? note.position : 0
        }));
      }
    } catch (error) {
      // Handle error silently
    }
    return [];
  });
  
  // Import note operations from useNotes hook
  const { 
    createNote, 
    updateNote, 
    deleteNote, 
    addTask, 
    updateTask, 
    deleteTask 
  } = useNotes(notes, setNotes);
  
  // Get filtered notes based on search query
  const filteredNotes = filterNotes(notes, searchQuery);
  
  // Use custom hook for import/export functionality
  const {
    exportNotesToMarkdown,
    importNotesFromMarkdown,
    importNotesFromFiles
  } = useNoteIO(notes, setNotes);
  
  // Load cached data on initial render
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Load cached notes
        const cachedNotes = await getCachedNotes();
        if (cachedNotes && cachedNotes.length > 0) {
          setNotes(cachedNotes);
        }
      } catch (error) {
        // Handle error silently
      } finally {
        // Set loading to false after a minimum display time to avoid flickering
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    
    loadCachedData();
  }, [setNotes]);
  
  // Cache notes whenever they change
  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      cacheNotes(notes);
    }
  }, [notes, isLoading]);

  return (
    <NotesContext.Provider value={{
      notes,
      filteredNotes,
      searchQuery,
      setSearchQuery,
      createNote,
      updateNote,
      deleteNote,
      addTask,
      updateTask,
      deleteTask,
      exportNotes: exportNotesToMarkdown,
      importNotes: importNotesFromMarkdown,
      importNotesFromFiles,
      isLoading,
      setIsLoading
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};