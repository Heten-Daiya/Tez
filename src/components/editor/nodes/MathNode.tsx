import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement } from 'lexical';
import * as React from 'react';

// Component to render LaTeX math expressions
function MathComponent({
  equation,
  format,
  nodeKey
}: {
  equation: string;
  format: 'inline' | 'block';
  nodeKey: NodeKey;
}) {
  // In a real implementation, you would use a LaTeX renderer like KaTeX or MathJax
  // For this example, we'll just display the raw LaTeX with styling
  const style: React.CSSProperties = {
    fontFamily: 'monospace',
    backgroundColor: format === 'inline' ? 'transparent' : '#f5f5f5',
    padding: format === 'inline' ? '0 4px' : '8px',
    margin: format === 'inline' ? '0' : '16px 0',
    display: format === 'inline' ? 'inline-block' : 'block',
    borderRadius: '4px',
  };

  return (
    <div 
      style={style} 
      data-lexical-math={format}
      data-lexical-equation={equation}
    >
      {format === 'inline' ? '$' : '$$'}
      {equation}
      {format === 'inline' ? '$' : '$$'}
    </div>
  );
}

export type SerializedMathNode = Spread<
  {
    equation: string;
    format: 'inline' | 'block';
    type: 'math';
    version: 1;
  },
  SerializedLexicalNode
>;

export class MathNode extends DecoratorNode<React.JSX.Element> {
  __equation: string;
  __format: 'inline' | 'block';

  static getType(): string {
    return 'math';
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(node.__equation, node.__format, node.__key);
  }

  constructor(equation: string, format: 'inline' | 'block', key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__format = format;
  }

  static importJSON(serializedNode: SerializedMathNode): MathNode {
    const { equation, format } = serializedNode;
    return $createMathNode(equation, format);
  }

  exportJSON(): SerializedMathNode {
    return {
      type: 'math',
      format: this.__format,
      equation: this.__equation,
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const className = this.__format === 'inline' ? 'math-inline' : 'math-block';
    div.className = className;
    return div;
  }

  updateDOM(): false {
    // Returning false tells Lexical that this node does not need its DOM element replacing
    return false;
  }

  getEquation(): string {
    return this.__equation;
  }

  getFormat(): 'inline' | 'block' {
    return this.__format;
  }

  decorate(): React.JSX.Element {
    return (
      <MathComponent
        equation={this.__equation}
        format={this.__format}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createMathNode(equation: string, format: 'inline' | 'block'): MathNode {
  return $applyNodeReplacement(new MathNode(equation, format));
}

export function $isMathNode(node: LexicalNode | null | undefined): node is MathNode {
  return node instanceof MathNode;
}