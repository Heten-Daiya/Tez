import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement } from 'lexical';
import * as React from 'react';
import { Note } from '../../../types';
import { useEditorProps } from '../EditorPropsContext'; // Context for editor-level props

// This component will be rendered by the WikiLinkNode
export function WikiLinkComponent({ nodeKey, targetTitle }: {
  nodeKey: NodeKey;
  targetTitle: string;
}) {
  const { notes, onWikiLinkClick } = useEditorProps();
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onWikiLinkClick) {
      onWikiLinkClick(targetTitle);
    }
  };
  const noteExists = Array.isArray(notes) && notes.some(note => note.title === targetTitle);
  const style = {
    color: noteExists ? '#4A90E2' : '#D0021B', // Blue for existing, Red for non-existing
    textDecoration: 'underline',
    cursor: 'pointer',
  };
  return (
    <a href={`wiki://${targetTitle}`} style={style} onClick={handleClick} data-lexical-wikilink={targetTitle} title={noteExists ? `Go to note: ${targetTitle}` : `Note not found: ${targetTitle}`}>
      {targetTitle}
    </a>
  );
}

export type SerializedWikiLinkNode = Spread<
  {
    targetTitle: string;
    type: 'wikilink';
    version: 1;
  },
  SerializedLexicalNode
>;

export class WikiLinkNode extends DecoratorNode<React.JSX.Element> {
  setNoteTitle(title: string): void {
    this.__targetTitle = title;
  }

  getNoteTitle(): string {
    return this.__targetTitle;
  }
  __targetTitle: string;

  static getType(): string {
    return 'wikilink';
  }

  static clone(node: WikiLinkNode): WikiLinkNode {
    return new WikiLinkNode(node.__targetTitle, node.__key);
  }

  constructor(targetTitle: string, key?: NodeKey) {
    super(key);
    this.__targetTitle = targetTitle;
  }

  static importJSON(serializedNode: SerializedWikiLinkNode): WikiLinkNode {
    return $createWikiLinkNode(serializedNode.targetTitle);
  }

  exportJSON(): SerializedWikiLinkNode {
    return {
      targetTitle: this.__targetTitle,
      type: 'wikilink',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span'); // Outer element for Lexical
    span.setAttribute('data-lexical-wikilink-target', this.__targetTitle);
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  getTextContent(): string {
    return `[[${this.__targetTitle}]]`;
  }
  
  isInline(): boolean {
    return true;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <WikiLinkComponent
        nodeKey={this.__key}
        targetTitle={this.__targetTitle}
      />
    );
  }
}

export function $createWikiLinkNode(targetTitle: string): WikiLinkNode {
  return $applyNodeReplacement(new WikiLinkNode(targetTitle));
}

export function $isWikiLinkNode(node: LexicalNode | null | undefined): node is WikiLinkNode {
  return node instanceof WikiLinkNode;
}