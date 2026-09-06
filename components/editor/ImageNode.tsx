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
import { useEffect, useRef, useState, type JSX } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

type Alignment = 'left' | 'center' | 'right';

export type SerializedImageNode = Spread<
  { src: string; altText: string; width: number; alignment: Alignment },
  SerializedLexicalNode
>;

// ── React component rendered inside the editor ───────────────────────────────

function ImageComponent({
  src,
  altText,
  width: initWidth,
  alignment: initAlignment,
  nodeKey,
  editor,
}: {
  src: string;
  altText: string;
  width: number;
  alignment: Alignment;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}) {
  const [selected, setSelected] = useState(false);
  const [width, setWidth] = useState(initWidth || 400);
  const [alignment, setAlignment] = useState<Alignment>(initAlignment || 'center');
  const widthRef = useRef(initWidth || 400); // tracks latest during drag
  const containerRef = useRef<HTMLDivElement>(null);

  // Deselect on outside click
  useEffect(() => {
    if (!selected) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setSelected(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [selected]);

  function persist(w: number, a: Alignment) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        const writable = node.getWritable();
        writable.__width = w;
        writable.__alignment = a;
      }
    });
  }

  // Drag-to-resize from the right or bottom-right handle
  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = widthRef.current;

    function onMove(ev: MouseEvent) {
      const next = Math.max(80, startW + (ev.clientX - startX));
      widthRef.current = next;
      setWidth(next);
    }
    function onUp() {
      persist(widthRef.current, alignment);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function setAlign(a: Alignment) {
    setAlignment(a);
    persist(widthRef.current, a);
  }

  function handleWidthInput(v: number) {
    if (v < 80 || isNaN(v)) return;
    widthRef.current = v;
    setWidth(v);
    persist(v, alignment);
  }

  function remove() {
    editor.update(() => $getNodeByKey(nodeKey)?.remove());
  }

  const marginStyle =
    alignment === 'center'
      ? '8px auto'
      : alignment === 'right'
      ? '8px 0 8px auto'
      : '8px auto 8px 0';

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      onClick={() => setSelected(true)}
      style={{
        display: 'block',
        width: 'fit-content',
        margin: marginStyle,
        position: 'relative',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Gold selection border */}
      {selected && (
        <div
          style={{
            position: 'absolute', inset: -2,
            border: '2px solid #C4A24D',
            borderRadius: 10, pointerEvents: 'none', zIndex: 1,
          }}
        />
      )}

      <img
        src={src}
        alt={altText}
        draggable={false}
        style={{ display: 'block', width, maxWidth: '100%', borderRadius: 8 }}
      />

      {/* Floating toolbar */}
      {selected && (
        <div
          style={{
            position: 'absolute', top: -44, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 2,
            background: '#111827',
            border: '1px solid rgba(196,162,77,0.35)',
            borderRadius: 10, padding: '4px 8px', zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Alignment */}
          {([
            { a: 'left' as Alignment, Icon: AlignLeft },
            { a: 'center' as Alignment, Icon: AlignCenter },
            { a: 'right' as Alignment, Icon: AlignRight },
          ]).map(({ a, Icon }) => (
            <button
              key={a}
              title={a}
              onClick={() => setAlign(a)}
              style={{
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, border: 'none', cursor: 'pointer',
                background: alignment === a ? 'rgba(196,162,77,0.25)' : 'transparent',
                color: alignment === a ? '#C4A24D' : '#9ca3af',
              }}
            >
              <Icon size={13} />
            </button>
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

          {/* Width input */}
          <input
            type="number"
            value={width}
            min={80} max={1600}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleWidthInput(Number(e.target.value))}
            style={{
              width: 64, height: 28, padding: '0 6px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#e5e7eb', fontSize: 12, textAlign: 'center',
            }}
          />
          <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 2 }}>px</span>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

          {/* Delete */}
          <button
            title="حذف عکس"
            onClick={remove}
            style={{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#f87171',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Right-edge resize handle */}
      {selected && (
        <div
          onMouseDown={startResize}
          title="تغییر اندازه"
          style={{
            position: 'absolute', right: -6, top: '50%',
            transform: 'translateY(-50%)',
            width: 12, height: 12,
            background: '#C4A24D', border: '2px solid #111827',
            borderRadius: '50%', cursor: 'ew-resize', zIndex: 2,
          }}
        />
      )}

      {/* Bottom-right corner resize handle */}
      {selected && (
        <div
          onMouseDown={startResize}
          title="تغییر اندازه"
          style={{
            position: 'absolute', right: -6, bottom: -6,
            width: 12, height: 12,
            background: '#C4A24D', border: '2px solid #111827',
            borderRadius: '50%', cursor: 'nwse-resize', zIndex: 2,
          }}
        />
      )}
    </div>
  );
}

// ── Lexical node ─────────────────────────────────────────────────────────────

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number;
  __alignment: Alignment;

  static getType(): string { return 'image'; }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__alignment, node.__key);
  }

  constructor(src: string, altText: string, width = 400, alignment: Alignment = 'center', key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__alignment = alignment;
  }

  static importJSON(data: SerializedImageNode): ImageNode {
    return $createImageNode({ src: data.src, altText: data.altText, width: data.width, alignment: data.alignment });
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: 'image', version: 1,
      src: this.__src, altText: this.__altText,
      width: this.__width, alignment: this.__alignment,
    };
  }

  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: (node: Node): DOMConversionOutput | null => {
          if (!(node instanceof HTMLImageElement)) return null;
          const w = node.style.width ? parseInt(node.style.width) : 400;
          const a = (node.dataset.align as Alignment) || 'center';
          return { node: $createImageNode({ src: node.src, altText: node.alt, width: w, alignment: a }) };
        },
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('img');
    el.src = this.__src;
    el.alt = this.__altText;
    el.dataset.align = this.__alignment;
    el.style.width = `${this.__width}px`;
    el.style.maxWidth = '100%';
    el.style.borderRadius = '8px';
    el.style.display = 'block';
    const margin =
      this.__alignment === 'center' ? '8px auto'
      : this.__alignment === 'right' ? '8px 0 8px auto'
      : '8px auto 8px 0';
    el.style.margin = margin;
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
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        alignment={this.__alignment}
        nodeKey={this.__key}
        editor={editor}
      />
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function $createImageNode({
  src,
  altText = '',
  width = 400,
  alignment = 'center',
}: {
  src: string;
  altText?: string;
  width?: number;
  alignment?: Alignment;
}): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, alignment));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
