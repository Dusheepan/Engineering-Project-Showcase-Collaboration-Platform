import React, { useEffect } from 'react';

/**
 * Reusable Confirmation Modal Component
 * Used for confirming destructive actions (e.g. deleting projects or comments)
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} title - Modal heading (e.g. "Delete Project")
 * @param {string} itemName - Name/identifier of item being deleted
 * @param {string} message - Warning text explaining action is permanent
 * @param {string} confirmText - Button text for confirmation (default: "Delete Permanently")
 * @param {string} cancelText - Button text for cancellation (default: "Cancel")
 * @param {boolean} loading - Submitting / in-progress state
 * @param {function} onConfirm - Handler executed when user confirms
 * @param {function} onCancel - Handler executed when user cancels / closes
 */
const ConfirmModal = ({
  isOpen,
  title = 'Confirm Deletion',
  itemName,
  message,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const defaultWarning = `Are you sure you want to delete "${itemName || 'this item'}"? This action is permanent and cannot be undone.`;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="modal-card confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="confirm-modal-header">
          <div className="confirm-icon-wrapper">⚠️</div>
          <div>
            <h3 id="confirm-modal-title" className="confirm-modal-title">
              {title}
            </h3>
            <p className="confirm-modal-subtitle">Permanent Deletion Warning</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="confirm-modal-body">
          {itemName && (
            <div className="confirm-item-preview">
              <span className="confirm-item-label">Target Item:</span>
              <strong className="confirm-item-name">{itemName}</strong>
            </div>
          )}

          <p className="confirm-warning-text">
            {message || defaultWarning}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="confirm-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-sm"></span>
                Deleting...
              </>
            ) : (
              `🗑️ ${confirmText}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
