import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread, $applyNodeReplacement, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { ButtonIcon } from '../../ButtonIcon';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';

type AudioPayload = {
  src: string;
  altText?: string;
  controls?: boolean;
  loop?: boolean;
  key?: NodeKey; // Added key to payload
};

function AudioComponent({
  src,
  altText,
  controls = true,
  loop = false,
  nodeKey,
  editor
}: AudioPayload & { nodeKey: NodeKey; editor: LexicalEditor }) {
  const { accentColor: contextAccentColor } = useAppContext();
  const effectiveAccentColor = contextAccentColor || 'indigo-500';
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const registerAudioPlayer = () => {
      audioRef.current?.load();
    };
    
    return () => {
      audioRef.current?.pause();
      audioRef.current?.removeAttribute('src');
      audioRef.current?.load();
    };
  }, [src]);
  
  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src={src}
        controls={controls}
        loop={loop}
        aria-label={altText}
        className={`w-full border-0 ${effectiveAccentColor}/10 dark:${effectiveAccentColor}/20 p-1 border ${effectiveAccentColor}/30 dark:${effectiveAccentColor}/30`}
        onPlay={() => audioRef.current?.play()}
        onPause={() => audioRef.current?.pause()}
      />
      <div className="absolute top-1 right-1">
        <ButtonIcon
          icon={Trash2}
          onClick={() => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if (node) node.remove();
            });
          }}
          ariaLabel="Delete audio"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900/50"
        />
      </div>
    </div>
  );
}

export type SerializedAudioNode = Spread<
  {
    src: string;
    altText?: string;
    controls?: boolean;
    loop?: boolean;
    type: 'audio';
    version: 1;
  },
  SerializedLexicalNode
>;

export class AudioNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __controls: boolean;
  __loop: boolean;

  static getType(): string {
    return 'audio';
  }

  static clone(node: AudioNode): AudioNode {
    return new AudioNode(
      node.__src,
      node.__altText,
      node.__controls,
      node.__loop,
      node.__key
    );
  }

  constructor(
    src: string,
    altText = '',
    controls = true,
    loop = false,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__controls = controls;
    this.__loop = loop;
  }

  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    return $createAudioNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      controls: serializedNode.controls,
      loop: serializedNode.loop
    });
  }

  exportJSON(): SerializedAudioNode {
    return {
      src: this.__src,
      altText: this.__altText,
      controls: this.__controls,
      loop: this.__loop,
      type: 'audio',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    return div;
  }

  updateDOM(prevNode: AudioNode, dom: HTMLElement, config: EditorConfig): boolean {
    // If the source changes, we may need to re-render.
    if (prevNode.__src !== this.__src) {
        return true;
    }
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.JSX.Element {
    return (
      <AudioComponent
        src={this.__src}
        altText={this.__altText}
        controls={this.__controls}
        loop={this.__loop}
      nodeKey={this.getKey()}
      editor={editor}
    />
  );
  }
}

export function $createAudioNode(payload: AudioPayload): AudioNode {
  return $applyNodeReplacement(
    new AudioNode(
      payload.src,
      payload.altText,
      payload.controls,
      payload.loop,
      payload.key
    )
  );
}

export function $isAudioNode(node: LexicalNode | null | undefined): node is AudioNode {
  return node instanceof AudioNode;
}
