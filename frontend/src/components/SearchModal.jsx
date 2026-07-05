import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { noteService } from '../services/api';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineFolderOpen,
} from 'react-icons/hi2';

const RECENT_KEY = 'brainspace_recent_searches';

/**
 * Full-screen search modal with real-time search and recent searches.
 */
export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      setRecentSearches(saved);
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Debounced search
  const doSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await noteService.getAll({ search: searchQuery });
      setResults(res.data.notes || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Save to recent searches and navigate
  const handleSelect = (noteId, title) => {
    // Save search to recents
    if (query.trim()) {
      const recents = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const updated = [query.trim(), ...recents.filter((r) => r !== query.trim())].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
    onClose();
    navigate(`/notes/${noteId}`);
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    doSearch(term);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            placeholder="Search notes by title, content, or tags..."
            className="flex-1 bg-transparent text-slate-800 dark:text-white text-base outline-none placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <HiOutlineXMark className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-600">
            ESC
          </kbd>
        </div>

        {/* Results / Recent */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              <p className="px-5 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((note) => (
                <button
                  key={note._id}
                  onClick={() => handleSelect(note._id, note.title)}
                  className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <HiOutlineDocumentText className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {note.title || 'Untitled Note'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {stripHtml(note.content).substring(0, 100)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {note.folder?.name && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <HiOutlineFolderOpen className="w-3 h-3" /> {note.folder.name}
                        </span>
                      )}
                      {note.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="tag text-[10px] py-0">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !query && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-5 py-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Recent Searches</p>
                <button onClick={clearRecent} className="text-xs text-primary-500 hover:text-primary-600">Clear</button>
              </div>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(term)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                  <HiOutlineClock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{term}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && !query && recentSearches.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <HiOutlineMagnifyingGlass className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start typing to search your notes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
