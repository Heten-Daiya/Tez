import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { Note } from '../../../types';
import { useEditorProps } from '../EditorPropsContext'; // Context for editor-level props
import { ButtonIcon } from '../../ButtonIcon';
import { SquareSquare } from 'lucide-react';
import { $createEmbeddedNoteNode } from './EmbeddedNoteNode'; // Import for conversion

// This component will be rendered by the WikiLinkNode
export function WikiLinkComponent({ nodeKey, targetId }: { // Changed from targetTitle to targetId
  nodeKey: NodeKey;
  targetId: string; // Changed from targetTitle to targetId
}) {
  const { notes, onWikiLinkClick, onConvertLinkToEmbed, ancestorChain = [] } = useEditorProps(); // Get ancestorChain
  // Find the note by its ID
  const targetNote = Array.isArray(notes) && notes.find(note => note.id === targetId);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onWikiLinkClick && targetNote) { // Pass the note's title to the click handler
      onWikiLinkClick(targetNote.title);
    }
  };

  const handleConvertToEmbed = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent link click from firing
    if (onConvertLinkToEmbed) {
      onConvertLinkToEmbed(nodeKey, targetId);
    }
  };
  
  const noteExists = !!targetNote;
  // Check for circular reference if this link were to be converted to an embed
  const wouldCauseCircularEmbed = ancestorChain.includes(targetId);

  const style = {
    color: noteExists ? '#4A90E2' : '#D0021B', // Blue for existing, Red for non-existing
    textDecoration: 'underline',
    cursor: 'pointer',
  };
  return (
    <span className="relative group inline-flex items-center">
      <a 
        href={`wiki://${targetId}`} // Keep ID in href for internal consistency
        style={style} 
        onClick={handleClick} 
        data-lexical-wikilink={targetId} // Use ID for data attribute
        title={noteExists ? `Go to note: ${targetNote.title}` : `Note not found: ${targetId}`}
        className="pr-2"
      >
        {noteExists ? targetNote.title : targetId} {/* Display title if exists, else ID */}
      </a>
      {noteExists && !wouldCauseCircularEmbed && ( // Only show button if note exists AND it won't cause a circular embed
        <ButtonIcon
          icon={SquareSquare}
          onClick={handleConvertToEmbed}
          ariaLabel="Convert to embedded note"
          className="absolute -right-1 top-1/2 -translate-y-2/5 opacity-100 text-grey-100 hover:text-blue-500 transition-color duration-200 "
          iconClassName="h-3 w-3 mr-1"
        />
      )}
    </span>
  );
}

export type SerializedWikiLinkNode = Spread<
  {
    targetId: string; // Changed from targetTitle to targetId
    type: 'wikilink';
    version: 1;
  },
  SerializedLexicalNode
>;

export class WikiLinkNode extends DecoratorNode<React.JSX.Element> {
  // Renamed methods to reflect ID usage
  setNoteId(id: string): void {
    this.__targetId = id;
  }

  getNoteId(): string {
    return this.__targetId;
  }

  __targetId: string; // Changed from __targetTitle to __targetId

  static getType(): string {
    return 'wikilink';
  }

  static clone(node: WikiLinkNode): WikiLinkNode {
    return new WikiLinkNode(node.__targetId, node.__key); // Use __targetId
  }

  constructor(targetId: string, key?: NodeKey) { // Use targetId
    super(key);
    this.__targetId = targetId;
  }

  static importJSON(serializedNode: SerializedWikiLinkNode): WikiLinkNode {
    return $createWikiLinkNode(serializedNode.targetId); // Use targetId
  }

  exportJSON(): SerializedWikiLinkNode {
    return {
      targetId: this.__targetId, // Use targetId
      type: 'wikilink',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span'); // Outer element for Lexical
    span.setAttribute('data-lexical-wikilink-target', this.__targetId); // Use ID for data attribute
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  getTextContent(): string {
    // For plain text representation, show the ID
    return `[[${this.__targetId}]]`;
  }
  
  isInline(): boolean {
    return true;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <WikiLinkComponent
        nodeKey={this.__key}
        targetId={this.__targetId} // Pass targetId to the component
      />
    );
  }

  // Conversion method
  convertToEmbeddedNote(): EmbeddedNoteNode {
    const embeddedNoteNode = $createEmbeddedNoteNode(this.__targetId);
    return embeddedNoteNode;
  }
}

export function $createWikiLinkNode(targetId: string): WikiLinkNode { // Use targetId
  return $applyNodeReplacement(new WikiLinkNode(targetId));
}

export function $isWikiLinkNode(node: LexicalNode | null | undefined): node is WikiLinkNode {
  return node instanceof WikiLinkNode;
}
