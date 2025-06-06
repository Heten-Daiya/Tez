import { type LexicalEditor, DecoratorNode, $applyNodeReplacement } from 'lexical';

export class MediaReferenceNode extends DecoratorNode<void> {
  __id: string;

  static getType(): string {
    return 'media-reference';
  }

  static clone(node: MediaReferenceNode): MediaReferenceNode {
    return new MediaReferenceNode(node.__id);
  }

  static importJSON(serializedNode: SerializedMediaReferenceNode): MediaReferenceNode {
    return $createMediaReferenceNode(serializedNode.id);
  }

  constructor(id: string) {
    super();
    this.__id = id;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(editor: LexicalEditor): HTMLElement {
    const element = document.createElement('media-reference');
    element.setAttribute('data-media-id', this.__id);
    return element;
  }

  exportJSON(): SerializedMediaReferenceNode {
    return {
      type: 'media-reference',
      version: 1,
      id: this.__id,
    };
  }
}

export function $createMediaReferenceNode(id: string): MediaReferenceNode {
  return $applyNodeReplacement(new MediaReferenceNode(id));
}

export function $isMediaReferenceNode(node: any): node is MediaReferenceNode {
  return node instanceof MediaReferenceNode;
}

export type SerializedMediaReferenceNode = {
  type: 'media-reference';
  version: 1;
  id: string;
};