import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useEffect, useRef, useMemo, useState } from 'react';
import { ButtonIcon } from '../../ButtonIcon';
import { Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';


type VideoPayload = {
  src: string;
  altText?: string;
  width?: 'inherit' | number;
  height?: 'inherit' | number;
  controls?: boolean;
};

function VideoComponent({
  src,
  altText,
  width,
  height,
  controls = true,
  nodeKey,
  editor
}: VideoPayload & { nodeKey: NodeKey; editor: LexicalEditor }) {
  const { accentColor: contextAccentColor } = useAppContext();
  const effectiveAccentColor = contextAccentColor || 'indigo-500';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [alignment, setAlignment] = useState('left');

  const handleAlignment = (newAlignment: string) => {
    setAlignment(newAlignment);
    // Update node alignment state here
  };
  
  const videoStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: height === 'inherit' ? 'auto' : height,
    width: width === 'inherit' ? 'auto' : width,
  };

  useEffect(() => {
    // Initialize video controls if needed
    const registerVideoPlayer = () => {
      videoRef.current?.load();
    };
    
    return () => {
      // Cleanup video element
      videoRef.current?.pause();
      videoRef.current?.removeAttribute('src');
      videoRef.current?.load();
    };
  }, []);

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
    <div className={`relative flex ${alignmentClasses}`}>
      <video
        ref={videoRef}
        src={src}
        style={videoStyle}
        controls={controls}
        aria-label={altText}
        className={`rounded-md ${effectiveAccentColor}/10 dark:${effectiveAccentColor}/20 p-1 border ${effectiveAccentColor}/30 dark:${effectiveAccentColor}/30`}
        onPlay={() => videoRef.current?.play()}
        onPause={() => videoRef.current?.pause()}
        
        
        
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
          ariaLabel="Delete video"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900/50"
        />
      </div>
    </div>
  );
}

export type SerializedVideoNode = Spread<
  {
    src: string;
    altText?: string;
    width?: 'inherit' | number;
    height?: 'inherit' | number;
    controls?: boolean;
    type: 'video';
    version: 1;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __controls: boolean;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__controls,
      node.__key
    );
  }

  constructor(
    src: string,
    altText = '',
    width: 'inherit' | number = 'inherit',
    height: 'inherit' | number = 'inherit',
    controls = true,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__controls = controls;
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return $createVideoNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      controls: serializedNode.controls
    });
  }

  exportJSON(): SerializedVideoNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      controls: this.__controls,
      type: 'video',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <VideoComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        controls={this.__controls}
        nodeKey={this.getKey()}
      editor={editor}
    />
  );
  }
}

export function $createVideoNode(payload: VideoPayload): VideoNode {
  return $applyNodeReplacement(
    new VideoNode(
      payload.src,
      payload.altText,
      payload.width,
      payload.height,
      payload.controls
    )
  );
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}