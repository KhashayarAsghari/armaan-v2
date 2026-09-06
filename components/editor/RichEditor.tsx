'use client';
import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, type LexicalEditor } from 'lexical';
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { ImageNode, $createImageNode } from './ImageNode';
import { VideoNode, $createVideoNode } from './VideoNode';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered,
  AlignRight, AlignLeft, AlignCenter,
  Undo, Redo, Image as ImageIcon, Video as VideoIcon, Code,
} from 'lucide-react';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB — keep in sync with app/api/upload/route.ts
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB — keep in sync with app/api/upload/route.ts
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

// ── Toolbar ────────────────────────────────────────────────────────────────────
function Toolbar() {
  const [editor] = useLexicalComposerContext();

  // TextFormatType union — spelled out to avoid import-type inference issues
  const fmt = (f: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'subscript' | 'superscript') =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, f);

  const insertHeading = (tag: 'h1' | 'h2' | 'h3') =>
    editor.update(() => {
      const heading = $createHeadingNode(tag);
      $getRoot().append(heading);
    });

  async function uploadFile(file: File): Promise<{ url: string; type: 'image' | 'video' } | null> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      window.alert(body.error ?? 'آپلود فایل با خطا مواجه شد.');
      return null;
    }
    return (await res.json()) as { url: string; type: 'image' | 'video' };
  }

  function handleImageInsert() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > MAX_IMAGE_SIZE) {
        window.alert('حجم تصویر نباید بیشتر از ۸ مگابایت باشد.');
        return;
      }
      const result = await uploadFile(file);
      if (!result) return;
      editor.update(() => {
        const imageNode = $createImageNode({ src: result.url, altText: file.name });
        $getRoot().append(imageNode);
      });
    };
    input.click();
  }

  function handleVideoInsert() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/quicktime,video/x-matroska';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > MAX_VIDEO_SIZE) {
        window.alert('حجم ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد.');
        return;
      }
      if (file.type && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        window.alert('فرمت ویدیو باید MP4، WebM، MOV یا MKV باشد.');
        return;
      }
      const result = await uploadFile(file);
      if (!result) return;
      editor.update(() => {
        const videoNode = $createVideoNode({ src: result.url });
        $getRoot().append(videoNode);
      });
    };
    input.click();
  }

  const btn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-foreground/70 hover:bg-[#C4A24D]/12 hover:text-[#C4A24D] transition-all duration-150';
  const sep = <div className="w-px h-5 bg-border mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/40">
      <button className={btn} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo"><Undo size={14} /></button>
      <button className={btn} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo"><Redo size={14} /></button>
      {sep}
      <button className={`${btn} text-xs font-bold`} onClick={() => insertHeading('h1')} title="H1">H1</button>
      <button className={`${btn} text-xs font-bold`} onClick={() => insertHeading('h2')} title="H2">H2</button>
      <button className={`${btn} text-xs font-bold`} onClick={() => insertHeading('h3')} title="H3">H3</button>
      {sep}
      <button className={btn} onClick={() => fmt('bold')} title="Bold"><Bold size={14} /></button>
      <button className={btn} onClick={() => fmt('italic')} title="Italic"><Italic size={14} /></button>
      <button className={btn} onClick={() => fmt('underline')} title="Underline"><Underline size={14} /></button>
      <button className={btn} onClick={() => fmt('strikethrough')} title="Strikethrough"><Strikethrough size={14} /></button>
      <button className={btn} onClick={() => fmt('code')} title="Inline code"><Code size={14} /></button>
      {sep}
      <button className={btn} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Bullet list"><List size={14} /></button>
      <button className={btn} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Ordered list"><ListOrdered size={14} /></button>
      {sep}
      <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="RTL / Align right"><AlignRight size={14} /></button>
      <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Center"><AlignCenter size={14} /></button>
      <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="LTR / Align left"><AlignLeft size={14} /></button>
      {sep}
      <button className={btn} onClick={handleImageInsert} title="Insert image"><ImageIcon size={14} /></button>
      <button className={btn} onClick={handleVideoInsert} title="Insert video"><VideoIcon size={14} /></button>
    </div>
  );
}

// ── HTML serialiser ────────────────────────────────────────────────────────────
function HtmlSerializer({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => onChange($generateHtmlFromNodes(editor)),
          { editor }
        );
      }),
    [editor, onChange]
  );
  return null;
}

// ── Public component ───────────────────────────────────────────────────────────
export interface RichEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
  dir?: 'rtl' | 'ltr';
  placeholder?: string;
}

export function RichEditor({
  onChange,
  initialHtml,
  dir = 'rtl',
  placeholder = 'محتوای خود را اینجا بنویسید...',
}: RichEditorProps) {
  const initialConfig = {
    namespace: 'ArmaanEditor',
    editorState: initialHtml
      ? (editor: LexicalEditor) => {
          const dom = new DOMParser().parseFromString(initialHtml, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $getRoot().select();
          $insertNodes(nodes);
        }
      : undefined,
    theme: {
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'font-mono bg-muted/60 px-1 py-0.5 rounded text-sm',
      },
      heading: {
        h1: 'text-3xl font-bold mb-4 mt-6',
        h2: 'text-2xl font-bold mb-3 mt-5',
        h3: 'text-xl font-semibold mb-2 mt-4',
      },
      list: {
        ul: 'list-disc ps-6 mb-3',
        ol: 'list-decimal ps-6 mb-3',
        listitem: 'mb-1',
      },
      link: 'text-[#C4A24D] underline hover:opacity-80',
      table: 'border-collapse w-full my-4',
      tableCell: 'border border-border px-3 py-2 text-sm',
      tableRow: 'border-b border-border',
      code: 'block bg-muted rounded-xl p-4 font-mono text-sm my-4 overflow-x-auto',
    },
    nodes: [
      HeadingNode, QuoteNode,
      ListNode, ListItemNode,
      LinkNode, AutoLinkNode,
      TableNode, TableCellNode, TableRowNode,
      CodeNode, CodeHighlightNode,
      ImageNode,
      VideoNode,
    ],
    onError: (err: Error) => console.error('[Lexical]', err),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Toolbar />
        <div dir={dir}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[320px] px-5 py-4 focus:outline-none text-foreground text-base leading-loose"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="absolute top-4 inset-s-5 text-muted-foreground text-base pointer-events-none select-none">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={({ children }) => <>{children}</>}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <TablePlugin />
      <HtmlSerializer onChange={onChange} />
    </LexicalComposer>
  );
}
