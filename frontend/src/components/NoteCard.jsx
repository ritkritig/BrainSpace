import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  HiOutlineBookmarkSquare,
  HiBookmarkSquare,
  HiOutlineEllipsisVertical,
  HiOutlinePencilSquare,
  HiOutlineArchiveBox,
  HiOutlineDocumentDuplicate,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineFolderOpen,
} from 'react-icons/hi2';

/**
 * Strips HTML tags from TipTap content for preview display.
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export default function NoteCard({ note, onPin, onArchive, onDelete, onDuplicate, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const contentPreview = stripHtml(note.content);

  return (
    <div
      className="card-hover group relative p-5 cursor-pointer flex flex-col gap-3 animate-fade-in"
      onClick={() => onClick?.(note._id)}
    >
      {/* ─── Pin Button (top right) ─────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onPin?.(note._id); }}
        className="absolute top-4 right-12 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
        title={note.isPinned ? 'Unpin' : 'Pin'}
      >
        {note.isPinned ? (
          <HiBookmarkSquare className="w-4.5 h-4.5 text-primary-500" />
        ) : (
          <HiOutlineBookmarkSquare className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
        )}
      </button>

      {/* ─── Menu Button (top right) ────────────────────── */}
      <div ref={menuRef} className="absolute top-4 right-4">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          <HiOutlineEllipsisVertical className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 py-1 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 animate-fade-in">
            <button
              onClick={(e) => { e.stopPropagation(); onClick?.(note._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <HiOutlinePencilSquare className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPin?.(note._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <HiOutlineBookmarkSquare className="w-4 h-4" /> {note.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onArchive?.(note._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              {note.isArchived ? (
                <><HiOutlineArrowUturnLeft className="w-4 h-4" /> Restore</>
              ) : (
                <><HiOutlineArchiveBox className="w-4 h-4" /> Archive</>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(note._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <HiOutlineDocumentDuplicate className="w-4 h-4" /> Duplicate
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(note._id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <HiOutlineTrash className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ─── Title ──────────────────────────────────────── */}
      <h3 className="text-base font-semibold text-slate-800 dark:text-white pr-16 line-clamp-1">
        {note.title || 'Untitled Note'}
      </h3>

      {/* ─── Content Preview ────────────────────────────── */}
      {contentPreview && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {contentPreview}
        </p>
      )}

      {/* ─── Tags ───────────────────────────────────────── */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="tag text-[11px]">{tag}</span>
          ))}
          {note.tags.length > 4 && (
            <span className="text-xs text-slate-400">+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* ─── Footer: Folder + Date ──────────────────────── */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/40">
        {note.folder?.name ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <HiOutlineFolderOpen className="w-3.5 h-3.5" />
            {note.folder.name}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">Uncategorized</span>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatDistanceToNow(new Date(note.updatedAt || note.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
