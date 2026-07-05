import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentPlus,
  HiOutlineFolder,
} from 'react-icons/hi2';
import { noteService, folderService } from '../services/api';
import { useToast } from '../context/ToastContext';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const FolderNotes = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFolder = useCallback(async () => {
    try {
      const res = await folderService.getAll();
      const allFolders = res.data || res;
      const found = Array.isArray(allFolders)
        ? allFolders.find((f) => f._id === folderId)
        : null;
      setFolder(found || null);
    } catch {
      // Folder info is supplementary
    }
  }, [folderId]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await noteService.getAll({ folder: folderId });
      setNotes(res.data || res);
    } catch {
      addToast('Failed to load folder notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [folderId, addToast]);

  useEffect(() => {
    fetchFolder();
    fetchNotes();
  }, [fetchFolder, fetchNotes]);

  const handlePin = async (id) => {
    try {
      await noteService.pin(id);
      addToast('Note pin toggled', 'success');
      fetchNotes();
    } catch {
      addToast('Failed to pin note', 'error');
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
  const folderName = folder?.name || 'Folder';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('/folders')}
            aria-label="Back to folders"
          >
            <HiOutlineArrowLeft />
          </button>
          <h1 className="page-title">
            <HiOutlineFolder
              className="page-title-icon"
              style={{ color: folder?.color || 'var(--color-primary)' }}
            />
            {folderName}
            {!loading && (
              <span className="count-badge">{notesList.length}</span>
            )}
          </h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/notes/new?folder=${folderId}`)}
        >
          <HiOutlineDocumentPlus />
          Add Note
        </button>
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
          <HiOutlineFolder className="empty-state-icon" />
          <h2 className="empty-state-title">No notes in this folder</h2>
          <p className="empty-state-text">
            Add your first note to &ldquo;{folderName}&rdquo;.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/notes/new?folder=${folderId}`)}
          >
            <HiOutlineDocumentPlus />
            Add First Note
          </button>
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

export default FolderNotes;
