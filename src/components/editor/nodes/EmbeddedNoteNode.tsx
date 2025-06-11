import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { SquareSquare, Trash2, Link } from 'lucide-react'; // Import Link icon
import { ButtonIcon } from '../../ButtonIcon';
import { Note } from '../../../types';
import { useEditorProps } from '../EditorPropsContext'; // Context for editor-level props
import LexicalMarkdownEditor from '../../LexicalMarkdownEditor'; // To render the embedded content

// Import WikiLinkComponent to render instead of embed when circular reference is detected
import { WikiLinkComponent, $createWikiLinkNode } from './WikiLinkNode'; // Import $createWikiLinkNode for conversion

// This component will be rendered by the EmbeddedNoteNode
function EmbeddedNoteComponent({
  nodeKey,
  targetId, // Changed from targetTitle to targetId
  editor
}: {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  targetId: string; // Changed from targetTitle to targetId
}) {
  const { notes, getNoteContent, showTasksInEmbeddedNotes, onNavigateToNote, ancestorChain = [], onWikiLinkClick, onConvertEmbedToLink } = useEditorProps();
  const [alignment, setAlignment] = useState('left'); // Keep alignment state if needed for future features

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

  // Find the note by its ID
  const targetNote = notes.find(note => note.id === targetId);
  // Check for circular reference using note IDs
  const isCircularReference = ancestorChain.includes(targetId);

  // Create a new ancestor chain that includes the current note's ID
  const updatedAncestorChain = useMemo(() => 
    [...ancestorChain, targetId],
    [ancestorChain, targetId]
  );

  const handleConvertToLink = () => {
    if (onConvertEmbedToLink) {
      onConvertEmbedToLink(nodeKey, targetId);
    }
  };

  // Handle rendering logic after all hooks
  if (!targetNote) {
    return (
      <div className="editor-input prose dark:prose-invert max-w-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700" data-lexical-embedded-note={targetId}>
        <p style={{ color: '#D0021B' }}>Embedded note "{targetId}" not found.</p>
      </div>
    );
  }

  if (isCircularReference) {
    return (
      <WikiLinkComponent 
        nodeKey={nodeKey} 
        targetId={targetId} // Pass targetId to WikiLinkComponent
      />
    );
  }

  // Get content using the note's ID
  const noteContent = getNoteContent ? getNoteContent(targetNote.id) : targetNote.content;

  return (
    <div className="relative group editor-input prose dark:prose-invert max-w-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700" data-lexical-embedded-note={targetId}>
      <div 
        style={{...titleStyle, cursor: onNavigateToNote ? 'pointer' : 'default'}}
        className="flex items-center gap-1"
        // Pass the note's title to the navigation handler
        onClick={() => onNavigateToNote && targetNote && onNavigateToNote(targetNote.title)}
        title={onNavigateToNote && targetNote ? `Go to note: ${targetNote.title}` : targetNote?.title}
      >
        <SquareSquare size={16} />
        {targetNote.title} {/* Display the note's title */}
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
          ancestorChain={updatedAncestorChain} // Pass updated ancestor chain (with IDs)
          onWikiLinkClick={onWikiLinkClick}
        />
      </div>
      {/* Only show delete and convert buttons if it's a first-level embed */}
      {ancestorChain.length === 1 && (
        <div className="absolute top-3 right-1.5 flex gap-1">
          <ButtonIcon
            icon={Link} // Icon for converting to link
            onClick={handleConvertToLink}
            ariaLabel="Convert to wiki link"
            className="bg-white/80 dark:bg-gray-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/50"
          />
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
    targetId: string; // Changed from targetTitle to targetId
    type: 'embedded-note';
    version: 1;
  },
  SerializedLexicalNode
>;

export class EmbeddedNoteNode extends DecoratorNode<React.JSX.Element> {
  setNoteId(id: string): void {
    this.__targetId = id;
  }

  getNoteId(): string {
    return this.__targetId;
  }
  __targetId: string;
  static getType(): string {
    return 'embedded-note';
  }

  static clone(node: EmbeddedNoteNode): EmbeddedNoteNode {
    return new EmbeddedNoteNode(node.__targetId, node.__key); // Use __targetId
  }

  constructor(targetId: string, key?: NodeKey) { // Use targetId
    super(key);
    this.__targetId = targetId;
  }

  static importJSON(serializedNode: SerializedEmbeddedNoteNode): EmbeddedNoteNode {
    return $createEmbeddedNoteNode(serializedNode.targetId); // Use targetId
  }

  exportJSON(): SerializedEmbeddedNoteNode {
    return {
      targetId: this.__targetId, // Use targetId
      type: 'embedded-note',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-lexical-embedded-note-target', this.__targetId); // Use targetId for data attribute
    return div;
  }

  updateDOM(): boolean {
    return false; // Content changes are handled by React component
  }

  getTextContent(): string {
    // For plain text representation, show the ID
    return `![[${this.__targetId}]]`; 
  }
  
  isInline(): boolean {
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <EmbeddedNoteComponent
        key={`${this.__key}-${this.__targetId}`}
        nodeKey={this.__key}
        targetId={this.__targetId} // Pass targetId to the component
        editor={editor}
      />
    );
  }

  // Conversion method
  convertToWikiLink(): WikiLinkNode {
    const wikiLinkNode = $createWikiLinkNode(this.__targetId);
    return wikiLinkNode;
  }
}

export function $createEmbeddedNoteNode(targetId: string): EmbeddedNoteNode { // Use targetId
  return $applyNodeReplacement(new EmbeddedNoteNode(targetId));
}

export function $isEmbeddedNoteNode(node: LexicalNode | null | undefined): node is EmbeddedNoteNode {
  return node instanceof EmbeddedNoteNode;
}
