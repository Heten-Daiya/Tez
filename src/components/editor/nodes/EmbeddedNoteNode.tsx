import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { SquareSquare, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { ButtonIcon } from '../../ButtonIcon';
import { Note } from '../../../types';
import { useEditorProps } from '../EditorPropsContext'; // Context for editor-level props
import LexicalMarkdownEditor from '../../LexicalMarkdownEditor'; // To render the embedded content

// Import WikiLinkComponent to render instead of embed when circular reference is detected
import { WikiLinkComponent } from './WikiLinkNode';

// This component will be rendered by the EmbeddedNoteNode
function EmbeddedNoteComponent({
  nodeKey,
  targetTitle,
  editor
}: {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  targetTitle: string;
}) {
  const { notes, getNoteContent, showTasksInEmbeddedNotes, onNavigateToNote, ancestorChain = [], onWikiLinkClick } = useEditorProps();
  const [alignment, setAlignment] = useState('left');

  // Move all hooks before any conditional returns
  const alignmentClasses = useMemo(() => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  }, [alignment]);

  const handleAlignment = (newAlignment: string) => {
    setAlignment(newAlignment);
    // Update node alignment state here
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const targetNote = notes.find(note => note.title === targetTitle);
  const isCircularReference = ancestorChain.includes(targetTitle);

  // Create a new ancestor chain that includes the current note
  const updatedAncestorChain = useMemo(() => 
    [...ancestorChain, targetTitle],
    [ancestorChain, targetTitle]
  );

  // Handle rendering logic after all hooks
  if (!targetNote) {
    return (
      <div className="editor-input prose dark:prose-invert max-w-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700" data-lexical-embedded-note={targetTitle}>
        <p style={{ color: '#D0021B' }}>Embedded note "{targetTitle}" not found.</p>
      </div>
    );
  }

  if (isCircularReference) {
    return (
      <WikiLinkComponent 
        nodeKey={nodeKey} 
        targetTitle={targetTitle} 
      />
    );
  }

  const noteContent = getNoteContent ? getNoteContent(targetNote.id) : targetNote.content;

  return (
    <div className="relative group editor-input prose dark:prose-invert max-w-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700" data-lexical-embedded-note={targetTitle}>
      <div 
        style={{...titleStyle, cursor: onNavigateToNote ? 'pointer' : 'default'}}
        className="flex items-center gap-1"
        onClick={() => onNavigateToNote && targetNote && onNavigateToNote(targetNote.title)}
        title={onNavigateToNote && targetNote ? `Go to note: ${targetNote.title}` : targetNote?.title}
      >
        <SquareSquare size={16} />
        {targetNote.title}
      </div>
      <div className="embedded-note-content prose dark:prose-invert max-w-none">
        <LexicalMarkdownEditor 
          value={noteContent} 
          onChange={() => {}} 
          notes={notes} 
          className="embedded-editor" 
          showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
          isEmbedded={true}
          onNavigateToNote={onNavigateToNote} 
          ancestorChain={updatedAncestorChain}
          onWikiLinkClick={onWikiLinkClick}
        />
      </div>
      {ancestorChain.length === 1 && (
        <div className="absolute top-3 right-1.5 flex gap-1">
          <ButtonIcon
            icon={Trash2}
            onClick={() => {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if (node) node.remove();
              });
            }}
            ariaLabel="Delete embedded note"
            className="bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900/50"
          />
        </div>
      )}
    </div>
  );
}

export type SerializedEmbeddedNoteNode = Spread<
  {
    targetTitle: string;
    type: 'embedded-note';
    version: 1;
  },
  SerializedLexicalNode
>;

export class EmbeddedNoteNode extends DecoratorNode<React.JSX.Element> {
  setNoteId(id: string): void {
    this.__targetTitle = id;
  }

  getNoteId(): string {
    return this.__targetTitle;
  }
  __targetTitle: string;

  static getType(): string {
    return 'embedded-note';
  }

  static clone(node: EmbeddedNoteNode): EmbeddedNoteNode {
    return new EmbeddedNoteNode(node.__targetTitle, node.__key);
  }

  constructor(targetTitle: string, key?: NodeKey) {
    super(key);
    this.__targetTitle = targetTitle;
  }

  static importJSON(serializedNode: SerializedEmbeddedNoteNode): EmbeddedNoteNode {
    return $createEmbeddedNoteNode(serializedNode.targetTitle);
  }

  exportJSON(): SerializedEmbeddedNoteNode {
    return {
      targetTitle: this.__targetTitle,
      type: 'embedded-note',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-lexical-embedded-note-target', this.__targetTitle);
    return div;
  }

  updateDOM(): boolean {
    return false; // Content changes are handled by React component
  }

  getTextContent(): string {
    return `![[${this.__targetTitle}]]`;
  }
  
  // Embedded notes are typically block elements
  isInline(): boolean {
    return false;
  }

  // In the decorate method of EmbeddedNoteNode class
  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <EmbeddedNoteComponent
        key={`${this.__key}-${this.__targetTitle}`}
        nodeKey={this.__key}
        targetTitle={this.__targetTitle}
        editor={editor}
      />
    );
  }
}

export function $createEmbeddedNoteNode(targetTitle: string): EmbeddedNoteNode {
  return $applyNodeReplacement(new EmbeddedNoteNode(targetTitle));
}

export function $isEmbeddedNoteNode(node: LexicalNode | null | undefined): node is EmbeddedNoteNode {
  return node instanceof EmbeddedNoteNode;
}
