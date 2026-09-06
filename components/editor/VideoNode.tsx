'use client';
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import { useRef, useState, type JSX } from 'react';
import { Trash2 } from 'lucide-react';

export type SerializedVideoNode = Spread<{ src: string; width: number }, SerializedLexicalNode>;

function VideoComponent({
  src,
  width: initWidth,
  nodeKey,
  editor,
}: {
  src: string;
  width: number;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}) {
  const [selected, setSelected] = useState(false);
  const [width] = useState(initWidth || 480);
  const containerRef = useRef<HTMLDivElement>(null);

  function remove() {
    editor.update(() => $getNodeByKey(nodeKey)?.remove());
  }

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      onClick={() => setSelected(true)}
      style={{ display: 'block', width: 'fit-content', margin: '8px auto', position: 'relative' }}
    >
      {selected && (
        <div
          style={{
            position: 'absolute', inset: -2,
            border: '2px solid #C4A24D',
            borderRadius: 10, pointerEvents: 'none', zIndex: 1,
          }}
        />
      )}
      <video
        src={src}
        controls
        style={{ display: 'block', width, maxWidth: '100%', borderRadius: 8 }}
      />
      {selected && (
        <button
          title="حذف ویدیو"
          onClick={remove}
          style={{
            position: 'absolute', top: -14, insetInlineEnd: -14,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '2px solid #111827',
            background: '#111827', color: '#f87171', cursor: 'pointer', zIndex: 2,
          }}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __width: number;

  static getType(): string { return 'video'; }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__width, node.__key);
  }

  constructor(src: string, width = 480, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__width = width;
  }

  static importJSON(data: SerializedVideoNode): VideoNode {
    return $createVideoNode({ src: data.src, width: data.width });
  }

  exportJSON(): SerializedVideoNode {
    return { ...super.exportJSON(), type: 'video', version: 1, src: this.__src, width: this.__width };
  }

  static importDOM(): DOMConversionMap {
    return {
      video: () => ({
        conversion: (node: Node): DOMConversionOutput | null => {
          if (!(node instanceof HTMLVideoElement)) return null;
          const w = node.style.width ? parseInt(node.style.width) : 480;
          return { node: $createVideoNode({ src: node.currentSrc || node.src, width: w }) };
        },
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('video');
    el.src = this.__src;
    el.controls = true;
    el.style.width = `${this.__width}px`;
    el.style.maxWidth = '100%';
    el.style.borderRadius = '8px';
    el.style.display = 'block';
    el.style.margin = '8px auto';
    return { element: el };
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'block';
    return span;
  }

  updateDOM(): false { return false; }
  isInline(): false { return false; }

  decorate(editor: LexicalEditor): JSX.Element {
    return <VideoComponent src={this.__src} width={this.__width} nodeKey={this.__key} editor={editor} />;
  }
}

export function $createVideoNode({ src, width = 480 }: { src: string; width?: number }): VideoNode {
  return $applyNodeReplacement(new VideoNode(src, width));
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}
