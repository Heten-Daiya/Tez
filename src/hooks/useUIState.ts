/**
 * Custom hook for managing UI state in the application
 */
import { useState, useEffect } from 'react';
import { cacheSettings } from '../utils/cacheUtils';
import { useNotesContext } from '../contexts/NotesContext';

/**
 * Hook that provides UI state and operations
 * @returns Object containing UI state and methods to manipulate UI
 */
export const useUIState = () => {
  // UI state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  
  // Get createNote from NotesContext
  const { createNote } = useNotesContext();

  // Add event listener for opening settings modal and color picker
  useEffect(() => {
    const handleOpenSettingsModal = () => setSettingsModalOpen(true);
    const handleOpenColorPicker = (e: CustomEvent) => {
      setEditingNoteId(e.detail);
      setShowNewNoteForm(true);
    };
    
    window.addEventListener('openSettingsModal', handleOpenSettingsModal);
    window.addEventListener('openColorPicker', (e: Event) => {
      handleOpenColorPicker(e as CustomEvent);
    });
    
    return () => {
      window.removeEventListener('openSettingsModal', handleOpenSettingsModal);
      window.removeEventListener('openColorPicker', handleOpenColorPicker);
    };
  }, []);

  /**
   * Creates a new note and closes the new note form
   */
  const handleShowNewNoteForm = () => {
    createNote();
    setShowNewNoteForm(false);
  };
  
  /**
   * Handles color selection for a note
   * @param color - The selected color
   */
  const handleColorSelect = (color: string) => {
    if (editingNoteId) {
      // This will be handled by the component that uses this hook
      setEditingNoteId(null);
    }
    setShowNewNoteForm(false);
  };

  /**
   * Updates the background image and caches it
   * @param imagePath - The path to the background image
   */
  const handleSetBackgroundImage = (imagePath: string) => {
    setBackgroundImage(imagePath);
    cacheSettings('backgroundImage', imagePath);
  };

  return {
    // State
    editingNoteId,
    showNewNoteForm,
    settingsModalOpen,
    backgroundImage,
    
    // Setters
    setEditingNoteId,
    setShowNewNoteForm,
    setSettingsModalOpen,
    
    // Handlers
    handleShowNewNoteForm,
    handleColorSelect,
    handleSetBackgroundImage
  };
};