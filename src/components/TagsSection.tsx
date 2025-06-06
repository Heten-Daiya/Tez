import React, { useState } from 'react';
import { Note } from '../types';

interface TagsSectionProps {
  note: Note;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
}

export const TagsSection: React.FC<TagsSectionProps> = ({ note, updateNote }) => {
  const [newTag, setNewTag] = useState('');

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700">
  <div className="flex flex-wrap gap-1">
      {note.tags.map((tag, index) => (
        <span key={index} className={`px-2 py-0.5 ${note.color} rounded-md text-sm flex items-center text-gray-900 dark:text-gray-100 border border-white/20 shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/90 transition-colors duration-200`}>
          {tag}
          <button
            onClick={() => updateNote(note.id, { tags: note.tags.filter((_, i) => i !== index) })}
            className="ml-2 text-indigo-600 hover:text-indigo-800 active:scale-95 active:text-indigo-900 transition-transform duration-100"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder="Add tag"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value.replace(/,/g, ''))}
        onKeyDown={(e) => {
          if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const tagToAdd = newTag.trim();
            if (tagToAdd) {
              updateNote(note.id, { tags: [...note.tags, tagToAdd] });
              setNewTag('');
            }
          }
        }}
        className="px-1 py-0.5 text-sm bg-indigo-100 text-indigo-800 rounded-md flex items-center dark:bg-indigo-900/80 dark:text-indigo-100 border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-24 hover:bg-indigo-200 dark:hover:bg-indigo-800/90 transition-colors duration-200"
      />
      </div>
</div>
  );
};