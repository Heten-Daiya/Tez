/**
 * Custom hook for managing notes state and operations
 */
import { useState, useEffect } from 'react';
import { Note, Task } from '../types';
import { generateDefaultTitle, generateSequentialTitle } from '../utils/noteUtils';
import { updateLexicalLinks } from '../utils/lexicalLinkUtils';
import { scrollToNote } from '../utils/scrollUtils';
/**
 * Hook that provides notes state and operations
 * @returns Object containing notes state and methods to manipulate notes
 */
export const useNotes = (notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>) => {
  // Save notes to localStorage with debouncing to prevent excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        // Handle error silently
      }
    }, 1000);
    
    // Add event listener for bfcache restoration using utility function
    let cleanup = () => {};
    
    // Dynamically import to avoid circular dependencies
    import('../utils/bfcacheUtils').then(({ registerBFCacheHandlers }) => {
      cleanup = registerBFCacheHandlers(
        // onRestore handler - called when page is restored from bfcache
        () => {
          // Refresh localStorage data to ensure we have the latest state
          try {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
              const parsedNotes = JSON.parse(savedNotes);
              setNotes(parsedNotes);
            }
          } catch (error) {
            // Handle error silently
          }
        }
      );
    });
    
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [notes, setNotes]);


    // Available note colors using Tailwind CSS classes
  const NOTE_COLORS = [
    'bg-slate-100/90 dark:bg-slate-900/80',
    'bg-gray-100/90 dark:bg-gray-900/80',
    'bg-zinc-100/90 dark:bg-zinc-900/80',
    'bg-neutral-100/90 dark:bg-neutral-900/80',
    'bg-stone-100/90 dark:bg-stone-900/80',
    'bg-red-100/90 dark:bg-red-900/70',
    'bg-orange-100/90 dark:bg-orange-900/70',
    'bg-amber-100/90 dark:bg-amber-900/70',
    'bg-yellow-100/90 dark:bg-yellow-900/70',
    'bg-lime-100/90 dark:bg-lime-900/70',
    'bg-green-100/90 dark:bg-green-900/70',
    'bg-emerald-100/90 dark:bg-emerald-900/70',
    'bg-teal-100/90 dark:bg-teal-900/70',
    'bg-cyan-100/90 dark:bg-cyan-900/70',
    'bg-sky-100/90 dark:bg-sky-900/70',
    'bg-blue-100/90 dark:bg-blue-900/70',
    'bg-indigo-100/90 dark:bg-indigo-900/70',
    'bg-violet-100/90 dark:bg-violet-900/70',
    'bg-purple-100/90 dark:bg-purple-900/70',
    'bg-fuchsia-100/90 dark:bg-fuchsia-900/70',
    'bg-pink-100/90 dark:bg-pink-900/70',
    'bg-rose-100/90 dark:bg-rose-900/70'
  ];

  /**
   * Creates a new note with random background color and proper state initialization
   */
  const createNote = () => {
    try {
      const randomColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
      const newNote: Note = {
        id: Date.now().toString(),
        title: generateSequentialTitle(notes),
        content: JSON.stringify({ root: { children: [{ children: [], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 } }),
        color: randomColor,
        tasks: [],
        createdAt: new Date(),
        tags: [new Date().toISOString().split('T')[0]],
        isMaximized: false,
        isCollapsed: false,
        hideContent: true,
        hideTasksSection: true,
        hideTagsSection: true,
	position: notes.length
      };
      setNotes(prevNotes => [newNote, ...prevNotes]);
      // Scroll to the new note after a short delay to allow rendering
      setTimeout(() => scrollToNote(newNote.id, 'start'), 100);
      return newNote.id;
    } catch (error) {
      console.error('Error creating new note:', error);
      return null;
    }
  };

  /**
   * Updates a note with partial data and validates the updates
   * @param noteId - ID of the note to update
   * @param updates - Partial note data to apply
   * @returns Boolean indicating if update was successful
   */
const updateNote = (noteId: string, updates: Partial<Note>): boolean => {
    try {
      setNotes(prevNotes => {
        const noteIndex = prevNotes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return prevNotes;

        const originalNote = prevNotes[noteIndex];
        const oldTitle = originalNote.title;
        const oldIsMaximized = originalNote.isMaximized;
        let notesToUpdate = [...prevNotes];

        // If title is changing, update links in other notes
        if (updates.title !== undefined && updates.title !== oldTitle) {
          notesToUpdate = notesToUpdate.map(noteToScan => {
            if (noteToScan.id !== noteId && typeof noteToScan.content === 'string' && noteToScan.content.includes(oldTitle)) {
              try {
                const updatedContent = updateLexicalLinks(noteToScan.content, oldTitle, updates.title!);
                if (updatedContent !== noteToScan.content) {
                  // Also update this note in the database/hybrid storage if it was changed
                  // This part depends on how direct updates to other notes are handled by the persistence layer
                  // For now, we assume the main persistence update happens for the primary note being edited
                  // and this hook primarily manages the in-memory state.
                  return { ...noteToScan, content: updatedContent };
                }
              } catch (e) {
                console.error(`Error updating links in note ${noteToScan.id} for title change from "${oldTitle}" to "${updates.title}":`, e);
              }
            }
            return noteToScan;
          });
        }
        
        // Find the index of the note being updated *again* in case notesToUpdate array was modified
        const targetNoteIndex = notesToUpdate.findIndex(note => note.id === noteId);
        if (targetNoteIndex === -1) return notesToUpdate; // Should not happen if noteIndex was valid

        const currentNote = notesToUpdate[targetNoteIndex];
        const updatedNotes = [...notesToUpdate];

        // Validate and sanitize updates
        const validatedUpdates = {
          ...updates,
          title: updates.title !== undefined ? updates.title : currentNote.title,
          content: updates.content !== undefined ? updates.content : currentNote.content,
          color: updates.color && NOTE_COLORS.includes(updates.color) ? updates.color : currentNote.color,
          tasks: Array.isArray(updates.tasks) ? updates.tasks.map(task => ({
            ...task,
            id: task.id || Date.now().toString(),
            text: task.text || '',
            completed: Boolean(task.completed)
          })) : currentNote.tasks,
          tags: Array.isArray(updates.tags) ? updates.tags.map(tag => tag.trim()).filter((tag, index, self) => self.findIndex(t => t.toLowerCase() === tag.toLowerCase()) === index) : currentNote.tags,
          isMaximized: updates.isMaximized !== undefined ? Boolean(updates.isMaximized) : currentNote.isMaximized, // Ensure isMaximized is handled
          isCollapsed: updates.isCollapsed !== undefined ? Boolean(updates.isCollapsed) : currentNote.isCollapsed,
          position: typeof updates.position === 'number' ? updates.position : currentNote.position
        };

        // Scroll to note if it's being restored from maximized state
        if (oldIsMaximized && validatedUpdates.isMaximized === false) {
          setTimeout(() => scrollToNote(noteId, 'center'), 100);
        }

        updatedNotes[targetNoteIndex] = { ...currentNote, ...validatedUpdates };
        return updatedNotes;
      });
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  /**
   * Deletes a note after confirmation and updates positions
   * @param noteId - ID of the note to delete
   * @param skipConfirmation - Whether to skip the confirmation dialog
   * @returns Boolean indicating if deletion was successful
   */
  const deleteNote = (noteId: string, skipConfirmation: boolean = false): boolean => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return false;
  
      if (skipConfirmation || window.confirm(`Are you sure you want to delete the note titled "${note.title || 'Untitled'}"`)) {
        setNotes(prevNotes => {
          const noteToDelete = prevNotes.find(n => n.id === noteId);
          if (!noteToDelete) return prevNotes; // Should not happen if note was found earlier

          const deletedPosition = noteToDelete.position;
          const updatedNotes = prevNotes
            .filter(note => note.id !== noteId)
            .map(note => ({
              ...note,
              position: note.position > deletedPosition ? note.position - 1 : note.position
            }));
          
          // Also update IndexedDB immediately
          import('../utils/cacheUtils').then(({ cacheNotes }) => {
            cacheNotes(updatedNotes);
          });
          
          return updatedNotes;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  /**
   * Adds a new empty task to a note with proper validation
   * @param noteId - ID of the note to add task to
   * @returns The ID of the new task if successful, null otherwise
   */
  const addTask = (noteId: string): string | null => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return null;

      const newTask: Task = {
        id: Date.now().toString(),
        text: '',
        completed: false
      };

      const updatedTasks = [...note.tasks, newTask];
      const success = updateNote(noteId, { tasks: updatedTasks });
      return success ? newTask.id : null;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  };

  /**
   * Updates a task within a note with validation
   * @param noteId - ID of the note containing the task
   * @param taskId - ID of the task to update
   * @param updates - Partial task data to apply
   * @returns Boolean indicating if update was successful
   */
  const updateTask = (noteId: string, taskId: string, updates: Partial<Task>): boolean => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return false;

      const updatedTasks = note.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );

      return updateNote(noteId, { tasks: updatedTasks });
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  };

  /**
   * Deletes a task from a note
   * @param noteId - ID of the note containing the task
   * @param taskId - ID of the task to delete
   * @returns Boolean indicating if deletion was successful
   */
  const deleteTask = (noteId: string, taskId: string): boolean => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return false;

      const updatedTasks = note.tasks.filter(task => task.id !== taskId);
      return updateNote(noteId, { tasks: updatedTasks });
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

  return {
    notes,
    setNotes,
    createNote,
    updateNote,
    deleteNote,
    addTask,
    updateTask,
    deleteTask
  };
};
