import { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';

// Component to render the horizontal rule
// Using a DecoratorNode for HR to allow for a React component, which can be styled easily via CSS.
// Alternatively, a simple ElementNode with createDOM could be used if no React component is needed.
function HorizontalRuleComponent() {
  return <hr className="lexical-horizontal-rule" />;
}

export type SerializedHorizontalRuleNode = Spread<
  {
    type: 'horizontalrule';
    version: 1;
  },
  SerializedLexicalNode
>;

export class HorizontalRuleNode extends DecoratorNode<React.JSX.Element> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(serializedNode: SerializedHorizontalRuleNode): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    // Applying a class directly to the div or relying on the component's styling
    // const className = config.theme.hr;
    // if (className) {
    //   div.className = className;
    // }
    return div; // This DOM element is just a container for the React component
  }

  getTextContent(): string {
    return '\n---\n'; // Or an empty string, as it's a non-textual element
  }

  isInline(): boolean {
    return false;
  }

  decorate(): React.JSX.Element {
    return <HorizontalRuleComponent />;
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}