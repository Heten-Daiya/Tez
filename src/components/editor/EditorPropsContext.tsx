import React, { createContext, useContext } from 'react';
import { Note } from '../../types';
import { NodeKey } from 'lexical';

interface EditorProps {
  notes: Note[];
  onWikiLinkClick: (noteTitle: string) => void;
  getNoteContent: (noteId: string) => string;
  showTasksInEmbeddedNotes: boolean;
  onNavigateToNote?: (noteTitle: string) => void;
  ancestorChain?: string[]; // Array of note IDs to detect circular embeds
  onConvertLinkToEmbed?: (nodeKey: NodeKey, targetId: string) => void; // New prop for conversion
  onConvertEmbedToLink?: (nodeKey: NodeKey, targetId: string) => void; // New prop for conversion
}

const EditorPropsContext = createContext<EditorProps | undefined>(undefined);

export const EditorPropsProvider: React.FC<React.PropsWithChildren<EditorProps>> = ({
  children,
  notes,
  onWikiLinkClick,
  getNoteContent,
  showTasksInEmbeddedNotes,
  onNavigateToNote,
  ancestorChain,
  onConvertLinkToEmbed,
  onConvertEmbedToLink,
}) => {
  return (
    <EditorPropsContext.Provider
      value={{
        notes,
        onWikiLinkClick,
        getNoteContent,
        showTasksInEmbeddedNotes,
        onNavigateToNote,
        ancestorChain,
        onConvertLinkToEmbed,
        onConvertEmbedToLink,
      }}
    >
      {children}
    </EditorPropsContext.Provider>
  );
};

export const useEditorProps = () => {
  const context = useContext(EditorPropsContext);
  if (context === undefined) {
    throw new Error('useEditorProps must be used within an EditorPropsProvider');
  }
  return context;
};
