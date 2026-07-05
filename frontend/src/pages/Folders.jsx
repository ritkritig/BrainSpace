import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineFolderPlus,
  HiOutlineFolder,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { folderService } from '../services/api';
import { useToast } from '../context/ToastContext';
import FolderCard from '../components/FolderCard';
import { FolderCardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const PRESET_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

const Folders = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'rename'
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await folderService.getAll();
      setFolders(res.data || res);
    } catch {
      addToast('Failed to load folders', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingFolder(null);
    setFolderName('');
    setFolderColor(PRESET_COLORS[0]);
    setModalOpen(true);
  };

  const openRenameModal = (folder) => {
    setModalMode('rename');
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color || PRESET_COLORS[0]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFolder(null);
    setFolderName('');
    setFolderColor(PRESET_COLORS[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      addToast('Folder name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await folderService.create({ name: folderName.trim(), color: folderColor });
        addToast('Folder created', 'success');
      } else {
        await folderService.update(editingFolder._id, { name: folderName.trim(), color: folderColor });
        addToast('Folder renamed', 'success');
      }
      closeModal();
      fetchFolders();
    } catch {
      addToast(
        modalMode === 'create' ? 'Failed to create folder' : 'Failed to rename folder',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await folderService.delete(deleteTarget);
      addToast('Folder deleted', 'success');
      setDeleteTarget(null);
      fetchFolders();
    } catch {
      addToast('Failed to delete folder', 'error');
    }
  };

  const foldersList = Array.isArray(folders) ? folders : [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            <HiOutlineFolder className="page-title-icon" />
            Folders
            {!loading && (
              <span className="count-badge">{foldersList.length}</span>
            )}
          </h1>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <HiOutlineFolderPlus />
          New Folder
        </button>
      </div>

      {/* Folders Grid */}
      {loading ? (
        <div className="notes-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <FolderCardSkeleton key={i} />
          ))}
        </div>
      ) : foldersList.length === 0 ? (
        <div className="empty-state">
          <HiOutlineFolder className="empty-state-icon" />
          <h2 className="empty-state-title">No folders yet</h2>
          <p className="empty-state-text">
            Organize your notes by creating folders.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlineFolderPlus />
            Create First Folder
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {foldersList.map((folder) => (
            <FolderCard
              key={folder._id}
              folder={folder}
              onClick={() => navigate('/folders/' + folder._id)}
              onRename={() => openRenameModal(folder)}
              onDelete={() => setDeleteTarget(folder._id)}
            />
          ))}
        </div>
      )}

      {/* Folder Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'New Folder' : 'Rename Folder'}
              </h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={closeModal}
                aria-label="Close"
              >
                <HiOutlineXMark />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="folder-name">
                  Folder Name
                </label>
                <input
                  id="folder-name"
                  type="text"
                  className="form-input"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${folderColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFolderColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !folderName.trim()}
                >
                  {submitting
                    ? modalMode === 'create'
                      ? 'Creating...'
                      : 'Saving...'
                    : modalMode === 'create'
                      ? 'Create'
                      : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? Notes inside will not be deleted but will become uncategorized."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Folders;
