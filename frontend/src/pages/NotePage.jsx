import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { noteService, folderService } from '../services/api';
import { useToast } from '../context/ToastContext';
import NoteEditor from '../components/NoteEditor';
import AISidePanel from '../components/AISidePanel';
import ConfirmDialog from '../components/ConfirmDialog';
import { EditorSkeleton } from '../components/LoadingSkeleton';
import {
  HiOutlineArrowLeft,
  HiOutlineBookmarkSquare,
  HiBookmarkSquare,
  HiOutlineArchiveBox,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineFolderOpen,
  HiOutlineXMark,
} from 'react-icons/hi2';

export default function NotePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const saveTimerRef = useRef(null);
  const noteIdRef = useRef(null); // Track the actual note ID after creation

  const isNew = !id || id === 'new';

  // Fetch folders
  useEffect(() => {
    folderService.getAll().then((res) => {
      setFolders(res.data.folders || []);
    }).catch(() => {});
  }, []);

  // Fetch or create note
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (isNew) {
          // Create a new note
          const preselectedFolder = searchParams.get('folder') || null;
          const res = await noteService.create({
            title: 'Untitled Note',
            content: '',
            folder: preselectedFolder,
          });
          const created = res.data.note;
          noteIdRef.current = created._id;
          setNote(created);
          setTitle(created.title);
          setContent(created.content);
          setTags(created.tags || []);
          setFolderId(created.folder?._id || created.folder || null);
          // Replace URL without pushing to history
          navigate(`/notes/${created._id}`, { replace: true });
        } else {
          const res = await noteService.getById(id);
          const fetched = res.data.note;
          noteIdRef.current = fetched._id;
          setNote(fetched);
          setTitle(fetched.title);
          setContent(fetched.content);
          setTags(fetched.tags || []);
          setFolderId(fetched.folder?._id || fetched.folder || null);
        }
      } catch (err) {
        addToast('Failed to load note.', 'error');
        navigate('/notes', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // Autosave with debounce
  const doSave = useCallback(async (data) => {
    const noteId = noteIdRef.current;
    if (!noteId) return;

    setSaving(true);
    try {
      const res = await noteService.update(noteId, data);
      setNote(res.data.note);
      setSaved(true);
    } catch {
      // Silent fail for autosave — user sees the saving indicator
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleAutosave = useCallback((data) => {
    setSaved(false);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => doSave(data), 3000);
  }, [doSave]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    scheduleAutosave({ title: val, content, tags, folder: folderId });
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    scheduleAutosave({ title, content: newContent, tags, folder: folderId });
  };

  const handleFolderChange = (e) => {
    const val = e.target.value || null;
    setFolderId(val);
    scheduleAutosave({ title, content, tags, folder: val });
  };

  // Tag management
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setTagInput('');
      scheduleAutosave({ title, content, tags: newTags, folder: folderId });
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    scheduleAutosave({ title, content, tags: newTags, folder: folderId });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Actions
  const handlePin = async () => {
    try {
      const res = await noteService.pin(noteIdRef.current);
      setNote(res.data.note);
      addToast(res.data.note.isPinned ? 'Note pinned.' : 'Note unpinned.', 'success');
    } catch { addToast('Failed to update pin.', 'error'); }
  };

  const handleArchive = async () => {
    try {
      await noteService.archive(noteIdRef.current);
      addToast('Note archived.', 'success');
      navigate('/notes');
    } catch { addToast('Failed to archive.', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await noteService.delete(noteIdRef.current);
      addToast('Note deleted.', 'success');
      navigate('/notes');
    } catch { addToast('Failed to delete.', 'error'); }
  };

  if (loading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* ─── Top Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {/* Save indicator */}
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
            {saving ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <HiOutlineCheck className="w-3.5 h-3.5" /> Saved
              </span>
            ) : (
              'Unsaved changes'
            )}
          </span>

          <button onClick={handlePin} className="btn btn-ghost btn-sm" title={note?.isPinned ? 'Unpin' : 'Pin'}>
            {note?.isPinned ? (
              <HiBookmarkSquare className="w-4 h-4 text-primary-500" />
            ) : (
              <HiOutlineBookmarkSquare className="w-4 h-4" />
            )}
          </button>
          <button onClick={handleArchive} className="btn btn-ghost btn-sm" title="Archive">
            <HiOutlineArchiveBox className="w-4 h-4" />
          </button>
          <button onClick={() => setAiPanelOpen(true)} className="btn btn-ghost btn-sm text-violet-500 hover:text-violet-600" title="AI Summarize">
            <HiOutlineSparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Summarize</span>
          </button>
          <button onClick={() => setDeleteConfirm(true)} className="btn btn-ghost btn-sm text-red-500 hover:text-red-600" title="Delete">
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Title ────────────────────────────────────── */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        className="w-full text-3xl font-bold text-slate-800 dark:text-white bg-transparent outline-none border-none placeholder-slate-300 dark:placeholder-slate-600 font-display"
      />

      {/* ─── Meta Row: Tags + Folder ──────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Folder selector */}
        <div className="flex items-center gap-2">
          <HiOutlineFolderOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={folderId || ''}
            onChange={handleFolderChange}
            className="input py-1.5 text-sm w-44"
          >
            <option value="">No Folder</option>
            {folders.map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="tag flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <HiOutlineXMark className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length < 10 ? 'Add tag...' : ''}
            disabled={tags.length >= 10}
            className="bg-transparent outline-none text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 flex-1 min-w-[100px]"
          />
        </div>
      </div>

      {/* ─── Editor ───────────────────────────────────── */}
      <NoteEditor content={content} onUpdate={handleContentChange} />

      {/* ─── AI Panel ─────────────────────────────────── */}
      <AISidePanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        noteId={noteIdRef.current}
        existingSummary={note?.aiSummary}
      />

      {/* ─── Delete Confirmation ──────────────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Note"
        message="This note will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  );
}
