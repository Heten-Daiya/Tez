import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Note } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useNotesContext } from '../contexts/NotesContext';
import Portal from './Portal'; // Import Portal

interface NoteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotes: (notes: Note[]) => void;
  type: 'link' | 'embed'; // To differentiate between link and embed
  initialSearchTerm?: string; // New prop for initial search
}

const NoteSelectionModal: React.FC<NoteSelectionModalProps> = ({ isOpen, onClose, onSelectNotes, type, initialSearchTerm }) => {
  const { accentColor } = useAppContext();
  const { notes, createNote } = useNotesContext(); // Add createNote
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedNoteIds(new Set()); // Reset selection when modal opens
      setSearchTerm(initialSearchTerm || ''); // Set initial search term or empty
    } else {
      setSearchTerm(''); // Reset search term when modal closes
    }
  }, [isOpen, initialSearchTerm]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNoteToggle = (noteId: string) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selected = notes.filter(note => selectedNoteIds.has(note.id));
    onSelectNotes(selected);
    onClose();
  };

  const handleCreateAndSelect = async () => {
    if (searchTerm.trim() === '') return;
    const newNoteId = createNote(searchTerm.trim());
    if (newNoteId) {
      // It might take a moment for the new note to appear in the `notes` list from context.
      // A more robust solution might involve createNote returning the full Note object
      // or having a way to get a note by ID directly after creation.
      // For now, we'll assume it's available quickly or rely on the parent to handle it.
      const newNote = notes.find(n => n.id === newNoteId) || { id: newNoteId, title: searchTerm.trim(), content: '', color: '', createdAt: new Date(), tasks: [], tags: [] }; // Basic fallback
      onSelectNotes([newNote]);
    }
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-3xl flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Note{type === 'link' ? 's to Link' : 's to Embed'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md mb-4">
            {filteredNotes.length === 0 ? (
              searchTerm.trim() === '' ? (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400">Start typing to search for notes.</p>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-3">No notes found matching "{searchTerm}".</p>
                  <button
                    onClick={handleCreateAndSelect}
                    className={`px-3 py-1.5 text-sm ${accentColor} text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-${accentColor.split('-')[1]}-500`}
                  >
                    Create Note: "{searchTerm}"
                  </button>
                </div>
              )
            ) : ( 
              <ul>
                {filteredNotes.map(note => (
                  <li 
                    key={note.id} 
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    onClick={() => handleNoteToggle(note.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNoteIds.has(note.id)}
                      onChange={() => handleNoteToggle(note.id)}
                      className="mr-3"
                    />
                    <span className="text-gray-800 dark:text-gray-200 text-sm truncate">
                      {note.title || 'Untitled Note'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedNoteIds.size === 0}
              className={`px-4 py-2 ${accentColor} text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectedNoteIds.size === 0 ? 'Select Notes' : `Insert ${selectedNoteIds.size} Note${selectedNoteIds.size > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default NoteSelectionModal;
