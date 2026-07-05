import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBookmarkSquare,
  HiOutlineDocumentPlus,
} from 'react-icons/hi2';
import { noteService } from '../services/api';
import { useToast } from '../context/ToastContext';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const PinnedNotes = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noteService.getAll({ isPinned: 'true' });
      setNotes(res.data || res);
    } catch {
      addToast('Failed to load pinned notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handlePin = async (id) => {
    try {
      await noteService.pin(id);
      addToast('Note unpinned', 'success');
      fetchNotes();
    } catch {
      addToast('Failed to unpin note', 'error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await noteService.archive(id);
      addToast('Note archived', 'success');
      fetchNotes();
    } catch {
      addToast('Failed to archive note', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await noteService.delete(deleteTarget);
      addToast('Note deleted', 'success');
      setDeleteTarget(null);
      fetchNotes();
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await noteService.duplicate(id);
      addToast('Note duplicated', 'success');
      fetchNotes();
    } catch {
      addToast('Failed to duplicate note', 'error');
    }
  };

  const notesList = Array.isArray(notes) ? notes : [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <HiOutlineBookmarkSquare className="page-title-icon" />
            Pinned Notes
            {!loading && (
              <span className="count-badge">{notesList.length}</span>
            )}
          </h1>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="notes-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notesList.length === 0 ? (
        <div className="empty-state">
          <HiOutlineBookmarkSquare className="empty-state-icon" />
          <h2 className="empty-state-title">No pinned notes</h2>
          <p className="empty-state-text">
            Pin your important notes for quick access.
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {notesList.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => navigate(`/notes/${note._id}`)}
              onPin={() => handlePin(note._id)}
              onArchive={() => handleArchive(note._id)}
              onDelete={() => setDeleteTarget(note._id)}
              onDuplicate={() => handleDuplicate(note._id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PinnedNotes;
