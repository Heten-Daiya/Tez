import React, { createContext, useContext } from 'react';
import { Note } from '../../types';

export interface EditorProps {
  notes: Note[];
  onWikiLinkClick?: (targetTitle: string) => void;
  onNavigateToNote?: (targetTitle: string) => void;
  getNoteContent?: (noteId: string) => string;
  showTasksInEmbeddedNotes?: boolean;
  // Track ancestor notes to prevent circular embeds
  ancestorChain?: string[];
}

const EditorPropsContext = createContext<EditorProps | undefined>(undefined);

export const EditorPropsProvider: React.FC<EditorProps & { children: React.ReactNode }> = ({ children, ...props }) => {
  return (
    <EditorPropsContext.Provider value={props}>
      {children}
    </EditorPropsContext.Provider>
  );
};

export const useEditorProps = (): EditorProps => {
  const context = useContext(EditorPropsContext);
  if (!context) {
    // Provide default values or throw an error if the context is essential
    // For now, let's provide defaults to prevent crashes if used outside a provider,
    // though in practice, it should always be within a provider in the editor.
    console.warn('useEditorProps must be used within an EditorPropsProvider. Using default empty values.');
    return {
        notes: [],
        showTasksInEmbeddedNotes: true,
        onWikiLinkClick: (title) => console.warn(`onWikiLinkClick not provided, attempted for: ${title}`),
        onNavigateToNote: (title) => console.warn(`onNavigateToNote not provided, attempted for: ${title}`),
        getNoteContent: (id) => {
            console.warn(`getNoteContent not provided, attempted for ID: ${id}`);
            return '';
        }
    };
  }
  return context;
};