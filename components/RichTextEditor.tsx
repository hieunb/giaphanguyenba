'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Eraser,
  Table as TableIcon,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';

interface Props {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const FONTS = [
  { label: 'Mặc định', value: '' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
];

export default function RichTextEditor({ value = '', onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-wrapper',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  // Sync external value when it changes (e.g. edit mode)
  useEffect(() => {
    if (editor && value !== undefined) {
      const current = editor.getHTML();
      if (current !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-amber-100 text-amber-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5 self-center flex-shrink-0" />;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">

        {/* Heading level */}
        <select
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: v as 1 | 2 | 3 }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : '0'
          }
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700 h-7"
          title="Kiểu đoạn văn"
        >
          <option value="0">Bình thường</option>
          <option value="1">Tiêu đề 1</option>
          <option value="2">Tiêu đề 2</option>
          <option value="3">Tiêu đề 3</option>
        </select>

        <Sep />

        {/* Font family */}
        <select
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          defaultValue=""
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700 h-7 max-w-[130px]"
          title="Font chữ"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <Sep />

        {/* Bold / Italic / Underline / Strikethrough */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
          <Bold size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
          <Italic size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch dưới (Ctrl+U)">
          <UnderlineIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough size={14} />
        </Btn>

        <Sep />

        {/* Text color */}
        <label className="relative flex items-center p-1.5 rounded hover:bg-gray-100 cursor-pointer" title="Màu chữ">
          <Type size={14} className="text-gray-600" />
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded"
            style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
          />
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onInput={(e) =>
              editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
            }
            value={editor.getAttributes('textStyle').color || '#000000'}
          />
        </label>

        {/* Highlight / background color */}
        <label
          className="relative flex items-center justify-center p-1.5 rounded hover:bg-gray-100 cursor-pointer"
          title="Màu nền chữ"
          style={{ backgroundColor: editor.getAttributes('highlight').color
            ? editor.getAttributes('highlight').color + '40'
            : undefined }}
        >
          <span className="text-xs font-bold text-gray-700">A</span>
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded"
            style={{ backgroundColor: editor.getAttributes('highlight').color || '#fef08a' }}
          />
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onInput={(e) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: (e.target as HTMLInputElement).value })
                .run()
            }
            value={editor.getAttributes('highlight').color || '#fef08a'}
          />
        </label>

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Xóa định dạng">
          <Eraser size={14} />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách điểm">
          <List size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
          <ListOrdered size={14} />
        </Btn>

        <Sep />

        {/* Text alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
          <AlignLeft size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
          <AlignCenter size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
          <AlignRight size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Căn đều hai bên">
          <AlignJustify size={14} />
        </Btn>

        <Sep />

        {/* Table */}
        <Btn
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          active={false}
          title="Chèn bảng 3×3"
        >
          <TableIcon size={14} />
        </Btn>

        {/* Table context buttons — only visible when cursor is inside a table */}
        {editor.isActive('table') && (
          <>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Thêm hàng bên dưới">
              <span className="text-[10px] font-bold">H</span><Plus size={10} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="Xóa hàng hiện tại">
              <span className="text-[10px] font-bold">H</span><Minus size={10} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Thêm cột bên phải">
              <span className="text-[10px] font-bold">C</span><Plus size={10} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="Xóa cột hiện tại">
              <span className="text-[10px] font-bold">C</span><Minus size={10} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Xóa bảng">
              <Trash2 size={14} className="text-red-500" />
            </Btn>
          </>
        )}
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} className="tiptap-editor-wrapper" />
    </div>
  );
}
