import { useEffect } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

/**
 * Modal confirmation dialog.
 * Uses modal-overlay and modal-content CSS classes for animations.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel?.();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content card w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            confirmVariant === 'danger'
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <HiOutlineExclamationTriangle className={`w-5 h-5 ${
              confirmVariant === 'danger' ? 'text-red-500' : 'text-primary-500'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn btn-secondary btn-md">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-md ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
