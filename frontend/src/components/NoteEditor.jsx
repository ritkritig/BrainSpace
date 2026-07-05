import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiCode,
  FiLink, FiImage, FiCornerUpLeft, FiCornerUpRight,
  FiMinus,
} from 'react-icons/fi';
import {
  HiOutlineListBullet, HiOutlineNumberedList,
  HiOutlineH1, HiOutlineH2, HiOutlineH3,
  HiOutlineTableCells, HiOutlineChatBubbleBottomCenterText,
  HiOutlineStrikethrough,
} from 'react-icons/hi2';

/**
 * Toolbar button component with active state and tooltip.
 */
function ToolbarBtn({ onClick, isActive, icon: Icon, title, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all duration-150 ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />;
}

export default function NoteEditor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-500 underline' } }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Start writing your thoughts...' }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  // Sync content from parent when it changes (e.g., on note load)
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="card overflow-hidden">
      {/* ─── Toolbar ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center gap-0.5 px-3 py-2 bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-slate-700/50 flex-wrap">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={HiOutlineH1} title="Heading 1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={HiOutlineH2} title="Heading 2" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={HiOutlineH3} title="Heading 3" />

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={FiBold} title="Bold (Ctrl+B)" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={FiItalic} title="Italic (Ctrl+I)" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={FiUnderline} title="Underline (Ctrl+U)" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={HiOutlineStrikethrough} title="Strikethrough" />

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={HiOutlineListBullet} title="Bullet List" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={HiOutlineNumberedList} title="Numbered List" />

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={FiCode} title="Code Block" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={HiOutlineChatBubbleBottomCenterText} title="Blockquote" />
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={FiMinus} title="Horizontal Rule" />

        <ToolbarDivider />

        <ToolbarBtn onClick={addLink} isActive={editor.isActive('link')} icon={FiLink} title="Insert Link" />
        <ToolbarBtn onClick={addImage} icon={FiImage} title="Insert Image" />
        <ToolbarBtn onClick={insertTable} icon={HiOutlineTableCells} title="Insert Table" />

        <ToolbarDivider />

        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={FiCornerUpLeft} title="Undo (Ctrl+Z)" />
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={FiCornerUpRight} title="Redo (Ctrl+Y)" />
      </div>

      {/* ─── Editor Content ──────────────────────────── */}
      <EditorContent editor={editor} />
    </div>
  );
}
