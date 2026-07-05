import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentPlus,
  HiOutlineDocumentText,
  HiOutlineFunnel,
} from 'react-icons/hi2';
import { noteService, folderService } from '../services/api';
import { useToast } from '../context/ToastContext';
import NoteCard from '../components/NoteCard';
import { NoteCardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const AllNotes = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await folderService.getAll();
      setFolders(res.data || res);
    } catch {
      // Silently fail — folders are optional filter
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedFolder) params.folder = selectedFolder;
      if (sortBy) params.sort = sortBy;
      const res = await noteService.getAll(params);
      setNotes(res.data || res);
    } catch {
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, sortBy, addToast]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  const foldersList = Array.isArray(folders) ? folders : [];
  const notesList = Array.isArray(notes) ? notes : [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <HiOutlineDocumentText className="page-title-icon" />
            All Notes
            {!loading && (
              <span className="count-badge">{notesList.length}</span>
            )}
          </h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/notes/new')}
        >
          <HiOutlineDocumentPlus />
          New Note
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <HiOutlineFunnel className="filter-icon" />
          <select
            className="filter-select"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            <option value="">All Folders</option>
            {foldersList.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
          </select>
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
          <HiOutlineDocumentText className="empty-state-icon" />
          <h2 className="empty-state-title">No notes yet</h2>
          <p className="empty-state-text">
            Create your first note to get started.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/notes/new')}
          >
            <HiOutlineDocumentPlus />
            Create First Note
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

export default AllNotes;
