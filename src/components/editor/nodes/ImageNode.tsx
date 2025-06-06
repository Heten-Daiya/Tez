import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useRef, useState, useMemo } from 'react';
import { ButtonIcon } from '../../ButtonIcon';
import { Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditorProps } from '../EditorPropsContext';
import { useAppContext } from '../../../contexts/AppContext';

// Component to render the image
const alignmentOptions = ['left', 'center', 'right'];

function ImageComponent({
  src,
  altText,
  width,
  height,
  title,
  nodeKey,
  editor
}: {
  src: string;
  editor: LexicalEditor;
  altText: string;
  width: 'inherit' | number;
  height: 'inherit' | number;
  title?: string;
  nodeKey: NodeKey;
}) {
  const { ancestorChain = [] } = useEditorProps();
  const { accentColor: contextAccentColor } = useAppContext();
  const effectiveAccentColor = contextAccentColor || 'indigo-500';
  const [alignment, setAlignment] = useState('left');

  const handleAlignment = (newAlignment: string) => {
    setAlignment(newAlignment);
    // Update node alignment state here
  };
  const isTopLevel = ancestorChain.length === 0;
  const imgRef = useRef<HTMLImageElement>(null);

  const imgStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: height === 'inherit' ? 'auto' : height,
    width: width === 'inherit' ? 'auto' : width,
  };
  
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

  return (
    <div className={`relative group flex ${alignmentClasses}`}>
      <img 
        ref={imgRef}
        src={src} 
        alt={altText} 
        title={title}
        style={imgStyle} 
        data-lexical-image={src} 
        className={`rounded-md bg-${effectiveAccentColor}/10 dark:bg-${effectiveAccentColor}/20 p-1 border border-${effectiveAccentColor}/30 dark:border-${effectiveAccentColor}/30`}
      />
      <div className="absolute top-1 left-1 flex gap-1">
        <ButtonIcon
          icon={AlignLeft}
          onClick={() => handleAlignment('left')}
          ariaLabel="Align left"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        />
        <ButtonIcon
          icon={AlignCenter}
          onClick={() => handleAlignment('center')}
          ariaLabel="Align center"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        />
        <ButtonIcon
          icon={AlignRight}
          onClick={() => handleAlignment('right')}
          ariaLabel="Align right"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        />
      </div>
      <div className="absolute top-1 right-1 flex gap-1">
        <ButtonIcon
          icon={Trash2}
          onClick={() => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if (node) node.remove();
            });
          }}
          ariaLabel="Delete image"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900/50"
        />
      </div>
    </div>
  ); 
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: 'inherit' | number;
    height: 'inherit' | number;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __title: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__title,
      node.__key
    );
  }

  constructor(src: string, altText: string, width: 'inherit' | number = 'inherit', height: 'inherit' | number = 'inherit', title: string = '', key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__title = title;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      title: serializedNode.title || ''
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span'); // Outer element for Lexical
    // const theme = config.theme;
    // const className = theme.image;
    // if (className !== undefined) {
    //   span.className = className;
    // }
    return span;
  }

  updateDOM(): boolean {
    // Returning false tells Lexical that this node does not need its
    // DOM element replacing with a new copy from createDOM.
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getTitle(): string {
    return this.__title;
  }
  
  // Images are typically block elements in Markdown, but can be inline in some contexts.
  // For simplicity, let's treat them as potentially inline for now, though block might be more common for GFM.
  isInline(): boolean {
    return false; // Markdown images are usually rendered as block elements or can break flow
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        title={this.__title}
        nodeKey={this.getKey()}
        editor={editor}
      />
    );
  }
}

export interface ImagePayload {
  src: string;
  altText: string;
  width?: 'inherit' | number;
  height?: 'inherit' | number;
  title?: string;
  key?: NodeKey;
}

export function $createImageNode({ src, altText, width, height, title = '', key }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, title, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}