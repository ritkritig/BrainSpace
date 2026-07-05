import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineFolderOpen,
  HiOutlineEllipsisVertical,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineDocumentText,
} from 'react-icons/hi2';

export default function FolderCard({ folder, onRename, onDelete, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className="card-hover group relative p-5 cursor-pointer flex items-start gap-4 animate-fade-in"
      onClick={() => onClick?.(folder._id)}
    >
      {/* Folder icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ backgroundColor: `${folder.color || '#3B82F6'}18` }}
      >
        <HiOutlineFolderOpen
          className="w-6 h-6"
          style={{ color: folder.color || '#3B82F6' }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate pr-8">
          {folder.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
          <HiOutlineDocumentText className="w-3.5 h-3.5" />
          {folder.noteCount ?? 0} {(folder.noteCount ?? 0) === 1 ? 'note' : 'notes'}
        </p>
      </div>

      {/* Action menu */}
      <div ref={menuRef} className="absolute top-4 right-4">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          <HiOutlineEllipsisVertical className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 animate-fade-in">
            <button
              onClick={(e) => { e.stopPropagation(); onRename?.(folder); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <HiOutlinePencilSquare className="w-4 h-4" /> Rename
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(folder); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <HiOutlineTrash className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
