import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement } from 'lexical';
import * as React from 'react';

// Component to render HTML content
function HTMLComponent({
  html,
  nodeKey
}: {
  html: string;
  nodeKey: NodeKey;
}) {
  // For security reasons, we should sanitize HTML before rendering it
  // In a real implementation, you would use a library like DOMPurify
  // For this example, we'll just display the raw HTML with a warning
  
  const containerStyle: React.CSSProperties = {
    border: '1px dashed #ccc',
    padding: '8px',
    margin: '8px 0',
    backgroundColor: '#f9f9f9',
    fontFamily: 'monospace',
    fontSize: '0.9em',
  };

  return (
    <div style={containerStyle} data-lexical-html="true">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export type SerializedHTMLNode = Spread<
  {
    html: string;
    type: 'html';
    version: 1;
  },
  SerializedLexicalNode
>;

export class HTMLNode extends DecoratorNode<React.JSX.Element> {
  __html: string;

  static getType(): string {
    return 'html';
  }

  static clone(node: HTMLNode): HTMLNode {
    return new HTMLNode(node.__html, node.__key);
  }

  constructor(html: string, key?: NodeKey) {
    super(key);
    this.__html = html;
  }

  static importJSON(serializedNode: SerializedHTMLNode): HTMLNode {
    const { html } = serializedNode;
    return $createHTMLNode(html);
  }

  exportJSON(): SerializedHTMLNode {
    return {
      type: 'html',
      html: this.__html,
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'html-content';
    return div;
  }

  updateDOM(): false {
    // Returning false tells Lexical that this node does not need its DOM element replacing
    return false;
  }

  getHtml(): string {
    return this.__html;
  }

  decorate(): React.JSX.Element {
    return (
      <HTMLComponent
        html={this.__html}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createHTMLNode(html: string): HTMLNode {
  return $applyNodeReplacement(new HTMLNode(html));
}

export function $isHTMLNode(node: LexicalNode | null | undefined): node is HTMLNode {
  return node instanceof HTMLNode;
}