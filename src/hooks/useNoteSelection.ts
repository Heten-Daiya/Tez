import { useState, useCallback } from 'react';
import { Note } from '../types';

interface UseNoteSelectionProps {
  items: string[];
  deleteNote: (noteId: string, skipConfirmation?: boolean) => boolean;
  initialSelectedNotes?: string[];
}

export const useNoteSelection = ({
  items,
  deleteNote,
  initialSelectedNotes = [],
}: UseNoteSelectionProps) => {
  const [selectedNotes, setSelectedNotes] = useState<string[]>(initialSelectedNotes);

  const handleNoteSelect = useCallback((noteId: string, isSelected: boolean) => {
    setSelectedNotes(prev =>
      isSelected ? [...prev, noteId] : prev.filter(id => id !== noteId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedNotes(items);
  }, [items]);

  const handleSelectNone = useCallback(() => {
    setSelectedNotes([]);
  }, []);

  const handleInvertSelection = useCallback(() => {
    setSelectedNotes(prev =>
      items.filter(id => !prev.includes(id))
    );
  }, [items]);

  const handleSelectAfter = useCallback(() => {
    if (selectedNotes.length !== 1) return;

    const selectedIndex = items.findIndex(id => id === selectedNotes[0]);
    if (selectedIndex === -1 || selectedIndex === items.length - 1) return;

    const notesToSelect = items.slice(selectedIndex + 1);
    setSelectedNotes(notesToSelect);
  }, [items, selectedNotes]);

  const handleSelectBefore = useCallback(() => {
    if (selectedNotes.length !== 1) return;

    const selectedIndex = items.findIndex(id => id === selectedNotes[0]);
    if (selectedIndex <= 0) return;

    const notesToSelect = items.slice(0, selectedIndex);
    setSelectedNotes(notesToSelect);
  }, [items, selectedNotes]);

  const handleSelectVisible = useCallback(() => {
    setSelectedNotes([...items]);
  }, [items]);

  const handleBatchDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} note${selectedNotes.length !== 1 ? 's' : ''}?`)) {
      selectedNotes.forEach(noteId => deleteNote(noteId, true));
      setSelectedNotes([]);
    }
  }, [selectedNotes, deleteNote]);

  const handleSelectBetween = useCallback(() => {
    if (selectedNotes.length !== 2) return; // Expects exactly two notes to be selected

    const firstIndex = items.findIndex(id => id === selectedNotes[0]);
    const secondIndex = items.findIndex(id => id === selectedNotes[1]);

    if (firstIndex === -1 || secondIndex === -1) return; // Should not happen if selectedNotes are from items

    const startIndex = Math.min(firstIndex, secondIndex);
    const endIndex = Math.max(firstIndex, secondIndex);

    const notesToSelect = items.slice(startIndex, endIndex + 1);
    setSelectedNotes(notesToSelect);
  }, [items, selectedNotes]);

  return {
    selectedNotes,
    setSelectedNotes, // Exporting setSelectedNotes in case direct manipulation is needed
    handleNoteSelect,
    handleSelectAll,
    handleSelectNone,
    handleInvertSelection,
    handleSelectAfter,
    handleSelectBefore,
    handleSelectVisible,
    handleBatchDelete,
    handleSelectBetween, // Add the new handler
  };
};