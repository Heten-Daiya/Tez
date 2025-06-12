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
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { TableEdgePlugin } from './editor/TableEdgePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalEditor, $getSelection, $isRangeSelection, NodeKey, $getNodeByKey } from 'lexical'; // Import $getSelection, NodeKey, $getNodeByKey
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
import { WikiLinkNode, $isWikiLinkNode } from './editor/nodes/WikiLinkNode'; // Import $isWikiLinkNode
import { EmbeddedNoteNode, $isEmbeddedNoteNode } from './editor/nodes/EmbeddedNoteNode'; // Import $isEmbeddedNoteNode
import { ImageNode } from './editor/nodes/ImageNode';
import { HorizontalRuleNode } from './editor/nodes/HorizontalRuleNode';
import { MathNode } from './editor/nodes/MathNode';
import { HTMLNode } from './editor/nodes/HTMLNode';
import { EditorPropsProvider } from './editor/EditorPropsContext';
import { VideoNode } from './editor/nodes/VideoNode';
import { AudioNode } from './editor/nodes/AudioNode';
import { MediaReferenceNode, $isMediaReferenceNode } from './MediaReferenceNode'; // Import $isMediaReferenceNode
import { MediaRenderer } from './MediaRenderer';
import NoteSelectionModal from './NoteSelectionModal'; // Import the new modal
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext
import { TableDeletePlugin } from './editor/TableDeletePlugin'; // NEW: Import TableDeletePlugin

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
  ancestorChain?: string[]; // Now stores note IDs
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
  const { accentColor } = useAppContext(); // Get accentColor from context
  const [editor, setEditor] = useState<LexicalEditor | null>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isNoteSelectionModalOpen, setIsNoteSelectionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'link' | 'embed' | null>(null);
  const [initialSearchTerm, setInitialSearchTerm] = useState<string | undefined>(undefined); // New state for initial search term
  
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

  // Changed parameter to noteId
  const getNoteContentForEmbed = (noteId: string): string => {
    const note = notes.find(n => n.id === noteId); // Find by ID
    if (note) {
      try {
        // Ensure embedded content is valid serialized editor state
        JSON.parse(note.content);
        return note.content;
      } catch {
        console.error('Invalid editor state in embedded note:', noteId);
        return JSON.stringify({ root: { children: [{ children: [], direction: null, format: '', indent: 0, type: 'paragraph', version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 } });
      }
    }
    return `Content for "${noteId}" not found.`;
  };

  const handleOpenNoteSelectionModal = (type: 'link' | 'embed', search?: string) => {
    setModalType(type);
    setInitialSearchTerm(search); // Set the initial search term
    setIsNoteSelectionModalOpen(true);
  };

  const handleNotesSelectedFromModal = (selectedNotes: Note[]) => {
    if (!editor || !modalType) return;

    if (modalType === 'link') {
      insertWikiLink(editor, selectedNotes);
    } else if (modalType === 'embed') {
      insertEmbeddedNote(editor, selectedNotes);
    }
    setIsNoteSelectionModalOpen(false);
    setModalType(null);
    setInitialSearchTerm(undefined); // Clear search term after selection
  };

  const handleInsertWikiLink = () => {
    if (!editor) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        const selectedText = selection.getTextContent();
        const matchingNotes = notes.filter(note => 
          note.title.toLowerCase() === selectedText.toLowerCase()
        );

        if (matchingNotes.length === 1) {
          insertWikiLink(editor, [matchingNotes[0]]);
        } else if (matchingNotes.length > 1) {
          handleOpenNoteSelectionModal('link', selectedText);
        } else {
          // No exact match, open modal with search term
          handleOpenNoteSelectionModal('link', selectedText);
        }
      } else {
        // No text selected, open modal without initial search
        handleOpenNoteSelectionModal('link');
      }
    });
  };

  const handleInsertEmbeddedNote = () => {
    if (!editor) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        const selectedText = selection.getTextContent();
        const matchingNotes = notes.filter(note => 
          note.title.toLowerCase() === selectedText.toLowerCase()
        );

        if (matchingNotes.length === 1) {
          insertEmbeddedNote(editor, [matchingNotes[0]]);
        } else if (matchingNotes.length > 1) {
          handleOpenNoteSelectionModal('embed', selectedText);
        } else {
          // No exact match, open modal with search term
          handleOpenNoteSelectionModal('embed', selectedText);
        }
      } else {
        // No text selected, open modal without initial search
        handleOpenNoteSelectionModal('embed');
      }
    });
  };

  const handleConvertLinkToEmbed = (nodeKey: NodeKey, targetId: string) => {
    editor?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isWikiLinkNode(node)) {
        const embeddedNoteNode = node.convertToEmbeddedNote();
        node.replace(embeddedNoteNode);
      }
    });
  };

  const handleConvertEmbedToLink = (nodeKey: NodeKey, targetId: string) => {
    editor?.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isEmbeddedNoteNode(node)) {
        const wikiLinkNode = node.convertToWikiLink();
        node.replace(wikiLinkNode);
      }
    });
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
      {!isEmbedded && note?.hideToolbar && ( // Flipped condition to show toolbar
        <EditorToolbar 
          editor={editor} 
          insertWikiLink={handleInsertWikiLink} 
          insertEmbeddedNote={handleInsertEmbeddedNote} 
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
          ancestorChain={ancestorChain || []} // Pass ancestor chain (with IDs) for circular embed prevention
          onConvertLinkToEmbed={handleConvertLinkToEmbed} // Pass conversion handler
          onConvertEmbedToLink={handleConvertEmbedToLink} // Pass conversion handler
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
            <LinkPlugin />
      <AutoLinkPlugin
        matchers={[
          (text) => {
            const match = /((https?:\/\/(?:www\.)?|www\.)[^\s.]+[^\s]+)/.exec(text);
            if (match) {
              return {
                index: match.index,
                length: match[0].length,
                text: match[0],
                url: match[1].startsWith('http') ? match[1] : `https://${match[1]}`, // Ensure URL has a protocol
              };
            }
            return null;
          },
        ]}
      /> {/* Essential for link functionality, even in read-only views */}
            <ListPlugin /> {/* Needed for rendering lists */}
            <CheckListPlugin /> {/* Needed for rendering checklists */}
            <TablePlugin /> {/* Needed for rendering tables */}
            {!isEmbedded && <TableEdgePlugin />} {/* Adds interactive hotspots on table edges */}
            {!isEmbedded && <TableDeletePlugin />} {/* NEW: Adds delete button for tables */}
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
      <NoteSelectionModal
        isOpen={isNoteSelectionModalOpen}
        onClose={() => setIsNoteSelectionModalOpen(false)}
        onSelectNotes={handleNotesSelectedFromModal}
        type={modalType || 'link'} // Default to 'link' if null
        initialSearchTerm={initialSearchTerm} // Pass the initial search term
      />
    </div>
  );
};

// EditorObserver is now imported from './editor/EditorObserver'

export default LexicalMarkdownEditor;
