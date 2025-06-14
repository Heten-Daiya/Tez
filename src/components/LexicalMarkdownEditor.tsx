/**
 * LexicalMarkdownEditor component
 * A full-featured markdown editor with GitHub Flavored Markdown support using Lexical
 */
import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TableEdgePlugin } from './editor/TableEdgePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalEditor } from 'lexical';
import { LinkNode, AutoLinkNode } from '@lexical/link'; // Keep AutoLinkNode if used elsewhere or by default transformers
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { Note } from '../types';
import '../styles/lexicalEditor.css';

// Import modular components
import EditorToolbar from './editor/EditorToolbar';
import EditorObserver from './editor/EditorObserver';
import { customTransformers } from './editor/EditorTransformers';
import { insertWikiLink, insertEmbeddedNote } from './editor/EditorLinkUtils';
import { WikiLinkNode } from './editor/nodes/WikiLinkNode';
import { EmbeddedNoteNode } from './editor/nodes/EmbeddedNoteNode';
import { ImageNode } from './editor/nodes/ImageNode';
import { HorizontalRuleNode } from './editor/nodes/HorizontalRuleNode';
import { MathNode } from './editor/nodes/MathNode';
import { HTMLNode } from './editor/nodes/HTMLNode';
import { EditorPropsProvider } from './editor/EditorPropsContext';
import { VideoNode } from './editor/nodes/VideoNode';
import { AudioNode } from './editor/nodes/AudioNode';
import { MediaReferenceNode } from './MediaReferenceNode';
import { MediaRenderer } from './MediaRenderer';

interface LexicalMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  notes: Note[];
  onNavigateToNote?: (noteTitle: string) => void; // For wiki link navigation
  onWikiLinkClick?: (noteTitle: string) => void; // For wiki link navigation within embeds
  isEmbedded?: boolean; // To indicate if the editor is in a read-only embedded context
  note?: Note; // Add note prop to access hideToolbar setting
  // Potentially add a function to get live note content if embeds need it dynamically
  // getLiveNoteContent?: (noteId: string) => string;
  className?: string;
  showTasksInEmbeddedNotes?: boolean;
  isMaximized?: boolean;
  // Track ancestor notes to prevent circular embeds
  ancestorChain?: string[];
}

// Theme for Lexical editor with GFM support
const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    code: 'editor-text-code',
    strikethrough: 'editor-text-strikethrough',
  },
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
    h6: 'editor-heading-h6',
  },
  list: {
    ul: 'editor-list-ul',
    ol: 'editor-list-ol',
    listitem: 'editor-listitem',
    checklist: 'editor-checklist',
    checklistChecked: 'editor-checklist-checked',
  },
  quote: 'editor-quote',
  link: 'editor-link',
  code: 'editor-code',
  table: 'editor-table',
  tableCell: 'editor-table-cell',
  tableRow: 'editor-table-row',
  tableCellHeader: 'editor-table-cell-header',
};

// No longer need markdown conversion imports

const LexicalMarkdownEditor: React.FC<LexicalMarkdownEditorProps> = ({
  value,
  onChange,
  notes,
  className = '',
  showTasksInEmbeddedNotes = true,
  isMaximized = false,
  isEmbedded = false, // Default to not embedded
  ancestorChain = [], // Default to empty array for root notes
  onNavigateToNote: onNavigateToNoteProp,
  onWikiLinkClick: onWikiLinkClickProp,
  note, // Destructure the note prop
}) => {
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ensure value is a valid serialized Lexical state
  useEffect(() => {
    // If value is not valid JSON, initialize with empty state
    if (editor) {
      try {
        // Initialize with empty state if no valid value
        const initialValue = isValidJSON(value) ? value : JSON.stringify(editor.getEditorState().toJSON());
        if (!value || !isValidJSON(value)) {
          onChange(initialValue);
        }
      } catch (e) {
        const emptyState = JSON.stringify(editor.getEditorState().toJSON());
        onChange(emptyState);
      }
    }
  }, [editor, value, onChange]);
  
  // Helper function to check if a string is valid JSON
  const isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isEmbedded);
    }
  }, [editor, isEmbedded]);

  // Link and embed functionality now imported from EditorLinkUtils

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from Source Mode (textarea) to Rich Text Mode (Lexical)
      // The `value` prop (which reflects the textarea's content) is the source of truth.
      // EditorObserver's useEffect hook that depends on [editor, value] will handle
      // parsing the JSON editor state and updating the Lexical editor.
      setIsSourceMode(false);
    } else {
      // Switching from Rich Text Mode (Lexical) to Source Mode (textarea)
      // The `value` prop (which is kept up-to-date by EditorObserver's onChange listener)
      // is the source of truth for the serialized editor state.
      // This `value` will be displayed in the textarea.
      // This works even if the Lexical editor is not yet fully initialized (editor is null),
      // in which case `value` would be the initial serialized state passed to the component.
      setIsSourceMode(true);
    }
  };

  const handleWikiLinkClick = (targetTitle: string) => {
    console.log('WikiLink clicked:', targetTitle);
    if (onNavigateToNoteProp) {
      onNavigateToNoteProp(targetTitle);
    } else {
      // Fallback or default behavior if no handler is provided
      alert(`Navigate to: ${targetTitle} (handler not implemented)`);
    }
  };

  const getNoteContentForEmbed = (noteIdOrTitle: string): string => {
    const note = notes.find(n => n.id === noteIdOrTitle || n.title === noteIdOrTitle);
    if (note) {
      try {
        // Ensure embedded content is valid serialized editor state
        JSON.parse(note.content);
        return note.content;
      } catch {
        console.error('Invalid editor state in embedded note:', noteIdOrTitle);
        return JSON.stringify({ root: { children: [{ children: [], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 } });
      }
    }
    return `Content for "${noteIdOrTitle}" not found.`;
  };

  // Initial Lexical configuration with GFM support
  const initialConfig = {
    namespace: 'NotesMarkdownEditor',
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
      LinkNode,
      AutoLinkNode,
      WikiLinkNode,
      EmbeddedNoteNode,
      MediaReferenceNode,
      ImageNode,
      VideoNode,
      AudioNode,
      HorizontalRuleNode, // Custom --- HR --- 
      MathNode, // LaTeX math expressions
      HTMLNode, // Raw HTML content
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      TableNode,
      TableRowNode,
      TableCellNode
      // Add other GFM nodes if not covered by default transformers or plugins
    ]
  };

  return (
    <div 
      className={`lexical-markdown-editor ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            editor?.dispatchCommand('insertMedia', {
              src: reader.result,
              type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
              fileName: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      }}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-xl border-2 border-dashed border-indigo-500 dark:border-indigo-400 flex items-center justify-center text-indigo-600 dark:text-indigo-300 backdrop-blur-sm">
          Drop to embed media
        </div>
      )}
      {!isEmbedded && note?.hideToolbar && (
        <EditorToolbar 
          editor={editor} 
          insertWikiLink={() => insertWikiLink(editor)} 
          insertEmbeddedNote={() => insertEmbeddedNote(editor)} 
          darkMode={false}
          isSourceMode={isSourceMode}
          onToggleSourceMode={toggleSourceMode} 
        />
      )}
      
      <div className={`lexical-editor-content ${isMaximized ? 'max-h-[calc(100vh-12rem)] overflow-y-auto p-4' : ''}`}>
        <EditorPropsProvider 
          notes={notes} 
          onWikiLinkClick={onWikiLinkClickProp || handleWikiLinkClick} // Use provided or default
          getNoteContent={getNoteContentForEmbed}
          showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
          onNavigateToNote={onNavigateToNoteProp} // Pass down the main navigation handler
          ancestorChain={ancestorChain || []} // Pass ancestor chain for circular embed prevention
        >
          {isSourceMode ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`source-mode-textarea editor-input prose dark:prose-invert max-w-none w-full h-full bg-transparent focus:outline-none resize-none ${isMaximized ? '' : 'min-h-[200px]'}`}
              placeholder="Editor State (JSON)..."
              disabled={isEmbedded}
            />
          ) : (
            <LexicalComposer initialConfig={initialConfig}>
              <div className="editor-container">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="editor-input prose dark:prose-invert max-w-none" 
                  aria-label="Note content editor"
                />
              }
              placeholder={isEmbedded ? null : <div className="editor-placeholder" aria-label="Start writing note content">Start writing...</div>}
              ErrorBoundary={LexicalErrorBoundary}
              decorators={[
                (node) => {
                  if ($isMediaReferenceNode(node)) {
                    return {
                      component: MediaRenderer,
                      props: {
                        mediaId: node.__id
                      }
                    };
                  }
                  return null;
                },
              ]}
            />
            {!isEmbedded && <HistoryPlugin />}
            {!isEmbedded && <AutoFocusPlugin />}
            <LinkPlugin /> {/* Essential for link functionality, even in read-only views */}
            <ListPlugin /> {/* Needed for rendering lists */}
            <CheckListPlugin /> {/* Needed for rendering checklists */}
            <TablePlugin /> {/* Needed for rendering tables */}
            {!isEmbedded && <TableEdgePlugin />} {/* Adds interactive hotspots on table edges */}
            {!isEmbedded && <MarkdownShortcutPlugin transformers={customTransformers} />}
            
            {/* Custom plugin to handle editor initialization and content changes */}
            <EditorObserver
              value={value}
              onChange={isEmbedded ? () => {} : onChange} // No onChange in embedded mode
              setEditor={setEditor}
            />
              </div>
            </LexicalComposer>
          )}
        </EditorPropsProvider>
      </div>
    </div>
  );
};

// EditorObserver is now imported from './editor/EditorObserver'

export default LexicalMarkdownEditor;
