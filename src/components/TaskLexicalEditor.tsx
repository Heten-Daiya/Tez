/**
 * TaskLexicalEditor component
 * A specialized version of LexicalMarkdownEditor for task descriptions
 */
import React, { useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $createParagraphNode, $createTextNode, LexicalEditor } from 'lexical';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { Note } from '../types';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorObserver from './editor/EditorObserver';
import { TableEdgePlugin } from './editor/TableEdgePlugin';
import '../styles/lexicalEditor.css';
import '../styles/taskLexicalEditor.css';

interface TaskLexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  notes: Note[];
  className?: string;
}

// Theme for Lexical editor - aligned with LexicalMarkdownEditor for consistent styling
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

// Import custom transformers from shared module
import { customTransformers } from './editor/EditorTransformers';


/**
 * A specialized version of LexicalMarkdownEditor for task descriptions
 * with simplified toolbar and styling appropriate for task context
 */
const TaskLexicalEditor: React.FC<TaskLexicalEditorProps> = ({
  value,
  onChange,
  notes,
  className = '',
}) => {
  const [editor, setEditor] = useState<LexicalEditor | null>(null);

  // Helper function to create link nodes
  const $createLinkNode = (url: string) => {
    const linkNode = new LinkNode(url);
    return linkNode;
  };

  // Function to insert wiki-style link
  const insertWikiLink = () => {
    if (editor) {
      editor.update(() => {
        const selection = window.getSelection();
        const text = selection?.toString() || 'Link Title';
        
        // Create a link node with wiki: prefix to distinguish it
        const linkNode = $createLinkNode(`wiki:${text}`);
        linkNode.append($createTextNode(text));
        
        // Insert at current selection
        selection?.getRangeAt(0).deleteContents();
        selection?.getRangeAt(0).insertNode(document.createTextNode(`[[${text}]]`));
      });
    }
  };

  // Initial Lexical configuration
  const initialConfig = {
    namespace: 'TaskDescriptionEditor',
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
    CodeNode,
    TableNode,
    TableRowNode,
    TableCellNode
  ]
  };

  return (
    <div className={`task-lexical-editor ${className}`}>
      <div className="task-editor-toolbar flex gap-1 mb-1 p-1 border-b border-gray-200 dark:border-gray-700">
        <button 
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={() => editor?.dispatchCommand('formatText', 'bold')}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button 
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={() => editor?.dispatchCommand('formatText', 'italic')}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <span className="border-r border-gray-200 dark:border-gray-700 mx-1"></span>
        <button 
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={() => editor?.dispatchCommand('insertUnorderedList', undefined)}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button 
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={() => editor?.dispatchCommand('insertOrderedList', undefined)}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </button>
        <span className="border-r border-gray-200 dark:border-gray-700 mx-1"></span>
        <button 
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={insertWikiLink}
          title="Insert Wiki Link"
        >
          <LinkIcon size={14} />
        </button>
      </div>
      
      <div className="task-editor-content">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="editor-input prose dark:prose-invert max-w-none min-h-[60px] max-h-[200px] overflow-y-auto text-sm" 
                />
              }
              placeholder={<div className="editor-placeholder text-sm">Add description...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin />
            <ListPlugin />
            <TableEdgePlugin />
            <MarkdownShortcutPlugin transformers={customTransformers} />
            
            {/* Custom plugin to handle editor initialization and content changes */}
            <EditorObserver
              value={value}
              onChange={onChange}
              setEditor={setEditor}
            />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};


export default TaskLexicalEditor;