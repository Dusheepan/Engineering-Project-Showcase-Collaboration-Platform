import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import commentService from '../services/commentService';
import ConfirmModal from '../components/ConfirmModal';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjectById, deleteProject } = useProjects();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Project state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // Collaboration Modal state
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabMessage, setCollabMessage] = useState('');
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [collabError, setCollabError] = useState(null);
  const [toast, setToast] = useState(null);

  // Confirmation Modals for Project and Comment Deletion
  const [projectDeleteModal, setProjectDeleteModal] = useState({
    isOpen: false,
    loading: false,
  });

  const [commentDeleteModal, setCommentDeleteModal] = useState({
    isOpen: false,
    commentId: null,
    commentSnippet: '',
    loading: false,
  });

  // Load project details
  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err.message || 'Project not found');
    } finally {
      setLoading(false);
    }
  }, [id, fetchProjectById]);

  // Load comments
  const loadComments = useCallback(async () => {
    try {
      const res = await projectService.getComments(id);
      setComments(res.data || []);
    } catch (err) {
      console.warn('Failed to load comments:', err.message);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    loadComments();
  }, [loadProject, loadComments]);

  // Ownership & Permission Logic
  const currentUserId = user?._id || user?.id;
  const projectOwnerId = project?.owner?._id || project?.owner;
  const isOwner = Boolean(
    currentUserId &&
      projectOwnerId &&
      currentUserId.toString() === projectOwnerId.toString()
  );
  const canModify = isOwner || isAdmin;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // --------------------------------------------------------------------------
  // Project Deletion Handlers with ConfirmModal
  // --------------------------------------------------------------------------
  const handleOpenProjectDeleteModal = () => {
    setProjectDeleteModal({ isOpen: true, loading: false });
  };

  const handleCloseProjectDeleteModal = () => {
    if (!projectDeleteModal.loading) {
      setProjectDeleteModal({ isOpen: false, loading: false });
    }
  };

  const handleConfirmDeleteProject = async () => {
    setProjectDeleteModal({ isOpen: true, loading: true });
    try {
      await deleteProject(id);
      showToast('success', 'Project was permanently deleted.');
      setProjectDeleteModal({ isOpen: false, loading: false });
      setTimeout(() => navigate('/projects'), 1200);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete project');
      setProjectDeleteModal({ isOpen: false, loading: false });
    }
  };

  // --------------------------------------------------------------------------
  // Comment Handlers with ConfirmModal
  // --------------------------------------------------------------------------
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const res = await projectService.addComment(id, newComment.trim());
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
      showToast('success', 'Comment posted successfully!');
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenCommentDeleteModal = (comment) => {
    const snippet =
      comment.text.length > 50
        ? `"${comment.text.substring(0, 50)}..."`
        : `"${comment.text}"`;

    setCommentDeleteModal({
      isOpen: true,
      commentId: comment._id,
      commentSnippet: `${snippet} by ${comment.author?.name || 'User'}`,
      loading: false,
    });
  };

  const handleCloseCommentDeleteModal = () => {
    if (!commentDeleteModal.loading) {
      setCommentDeleteModal({
        isOpen: false,
        commentId: null,
        commentSnippet: '',
        loading: false,
      });
    }
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentDeleteModal.commentId) return;

    setCommentDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await commentService.deleteComment(commentDeleteModal.commentId);
      showToast('success', 'Comment was deleted successfully.');
      handleCloseCommentDeleteModal();
      // Refresh comments list
      loadComments();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete comment');
      setCommentDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // --------------------------------------------------------------------------
  // Collaboration Request Handlers
  // --------------------------------------------------------------------------
  const handleSendCollaboration = async (e) => {
    e.preventDefault();
    if (!collabMessage.trim() || collabMessage.trim().length < 5) {
      setCollabError('Please provide a message with at least 5 characters.');
      return;
    }

    setSubmittingCollab(true);
    setCollabError(null);
    try {
      await projectService.requestCollaboration(id, collabMessage.trim());
      showToast(
        'success',
        'Collaboration request sent successfully to project owner!'
      );
      setIsCollabModalOpen(false);
      setCollabMessage('');
    } catch (err) {
      setCollabError(err.message || 'Failed to submit collaboration request.');
    } finally {
      setSubmittingCollab(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-success';
      case 'In Progress':
        return 'badge-info';
      case 'Idea':
        return 'badge-warning';
      default:
        return 'badge-default';
    }
  };

  if (loading) {
    return (
      <div className="container page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container page-container">
        <div className="alert alert-error">
          <p>⚠️ {error || 'Project not found'}</p>
          <Link to="/projects" className="btn btn-outline btn-sm mt-2">
            Back to Showcase
          </Link>
        </div>
      </div>
    );
  }

  const techs = project.techStack || project.technologies || [];

  return (
    <div className="container page-container project-detail-page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ConfirmModal for Project Deletion */}
      <ConfirmModal
        isOpen={projectDeleteModal.isOpen}
        title="Delete Project Permanently"
        itemName={project.title}
        message={`Are you sure you want to delete "${project.title}"? This action is permanent and will cascade-delete all peer reviews and collaboration requests associated with this project.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        loading={projectDeleteModal.loading}
        onConfirm={handleConfirmDeleteProject}
        onCancel={handleCloseProjectDeleteModal}
      />

      {/* ConfirmModal for Comment Deletion */}
      <ConfirmModal
        isOpen={commentDeleteModal.isOpen}
        title="Delete Comment"
        itemName={commentDeleteModal.commentSnippet}
        message="Are you sure you want to delete this comment? This action is permanent and cannot be undone."
        confirmText="Delete Comment"
        cancelText="Cancel"
        loading={commentDeleteModal.loading}
        onConfirm={handleConfirmDeleteComment}
        onCancel={handleCloseCommentDeleteModal}
      />

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/projects">← Back to Showcase</Link>
      </div>

      <div className="card project-detail-card">
        {/* Detail Header */}
        <div className="detail-header">
          <div>
            <span className="department-tag">{project.category || 'Other'}</span>
            <span className={`status-badge ml-2 ${getStatusBadgeClass(project.status)}`}>
              Status: {project.status}
            </span>
            {project.lookingForCollaborators && (
              <span className="collab-wanted-pill ml-2">
                🤝 Seeking Collaborators
              </span>
            )}
            <h1 className="detail-title">{project.title}</h1>
            <p className="detail-meta">
              Published on: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Edit/Delete Buttons: Visible ONLY to Owner or Admin */}
          {canModify && (
            <div className="detail-actions">
              <Link
                to={`/projects/edit/${project._id}`}
                className="btn btn-secondary"
                title="Edit Project"
              >
                ✏️ Edit Project
              </Link>
              <button
                type="button"
                onClick={handleOpenProjectDeleteModal}
                className="btn btn-danger-outline"
                title="Delete Project"
              >
                🗑️ Delete Project
              </button>
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Detail Body */}
        <div className="detail-body">
          {/* Full Project Description */}
          <div className="detail-section">
            <h3>Project Overview</h3>
            <p className="description-text">{project.description}</p>
          </div>

          {/* Tech Stack Chips */}
          <div className="detail-section">
            <h3>Tech Stack & Tools</h3>
            <div className="tech-stack-tags">
              {techs.map((tech, idx) => (
                <span key={idx} className="tech-pill large">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Owner & Collaboration Grid */}
          <div className="detail-grid-info">
            {/* Owner Info Box */}
            <div className="info-block">
              <h4>👤 Project Owner</h4>
              <p className="owner-title-large">
                <strong>{project.owner?.name || 'Student Creator'}</strong>
              </p>
              {project.owner?.department && (
                <p className="text-muted">🏛️ {project.owner.department}</p>
              )}
              {project.owner?.email && (
                <p className="text-muted">📧 {project.owner.email}</p>
              )}
              {project.owner?.role && (
                <span className="user-role-tag mt-1">Role: {project.owner.role}</span>
              )}
            </div>

            {/* Collaboration Status & Action */}
            <div className="info-block">
              <h4>🎯 Collaboration Status</h4>
              <p>
                {project.lookingForCollaborators
                  ? 'This project is actively welcoming new student collaborators and contributors.'
                  : 'This project is not currently seeking new collaborators.'}
              </p>

              {/* Collaborate Action Button */}
              {project.lookingForCollaborators && (
                <div className="mt-3">
                  {isOwner ? (
                    <div className="owner-status-note">
                      👑 You are the owner of this project. Check your{' '}
                      <Link to="/dashboard">Dashboard</Link> to view incoming requests.
                    </div>
                  ) : isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCollabError(null);
                        setIsCollabModalOpen(true);
                      }}
                      className="btn btn-primary"
                    >
                      🤝 Request to Collaborate
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-outline btn-sm">
                      Log In to Request Collaboration
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Public Repository & Live Demo Links */}
          {(project.githubUrl || project.demoUrl) && (
            <div className="detail-links">
              <h3>Project Links</h3>
              <div className="link-buttons">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    📦 View Source Code (GitHub)
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    🌐 Open Live Demo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Comments Section */}
        <div className="comments-section">
          <h3>💬 Peer Discussion & Reviews ({comments.length})</h3>

          {/* Add-Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form mt-3 mb-4">
              {commentError && <div className="alert alert-error">{commentError}</div>}
              <div className="form-group">
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Share constructive feedback, engineering insights, or ask technical questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="btn btn-primary btn-sm"
              >
                {submittingComment ? 'Posting Comment...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="comment-login-prompt card text-center mt-3 mb-4">
              <p>
                Have questions or feedback for this engineering project?{' '}
                <Link to="/login" className="auth-link">
                  Log in to join the peer discussion
                </Link>
                .
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-muted mt-2">
              No comments yet. Be the first to share your review or question!
            </p>
          ) : (
            <div className="comments-list">
              {comments.map((c) => {
                const commentAuthorId = c.author?._id || c.author;
                const canDeleteComment =
                  isAdmin ||
                  (currentUserId &&
                    commentAuthorId &&
                    currentUserId.toString() === commentAuthorId.toString());

                return (
                  <div key={c._id} className="comment-item card">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <span className="author-avatar-small">
                          {c.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <div>
                          <strong>{c.author?.name || 'Anonymous User'}</strong>
                          <span className="comment-meta-sub">
                            {c.author?.department ? ` (${c.author.department})` : ''} •{' '}
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {canDeleteComment && (
                        <button
                          type="button"
                          onClick={() => handleOpenCommentDeleteModal(c)}
                          className="btn btn-danger-outline btn-xs"
                          title="Delete comment"
                        >
                          ✕ Delete
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Collaboration Request Message Modal */}
      {isCollabModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCollabModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🤝 Request to Collaborate</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCollabModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="modal-project-name">
              Project: <strong>{project.title}</strong>
            </p>
            <p className="modal-subtitle">
              Send a pitch to the project owner explaining your skills, experience, and what you'd like to contribute.
            </p>

            {collabError && (
              <div className="alert alert-error mt-2">{collabError}</div>
            )}

            <form onSubmit={handleSendCollaboration} className="modal-form mt-3">
              <div className="form-group">
                <label htmlFor="modalMessage">Your Pitch / Contribution Message</label>
                <textarea
                  id="modalMessage"
                  rows={4}
                  className="form-control"
                  placeholder="e.g. I have 2 years of experience with ROS2 and embedded Linux and would like to build the obstacle avoidance waypoint module..."
                  value={collabMessage}
                  onChange={(e) => setCollabMessage(e.target.value)}
                  required
                  autoFocus
                />
                <span className="char-counter">
                  {collabMessage.trim().length} chars (minimum 5)
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={submittingCollab}
                  className="btn btn-primary"
                >
                  {submittingCollab ? (
                    <>
                      <span className="spinner-sm"></span>
                      Sending Request...
                    </>
                  ) : (
                    'Send Collaboration Request'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCollabModalOpen(false)}
                  className="btn btn-outline"
                  disabled={submittingCollab}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
