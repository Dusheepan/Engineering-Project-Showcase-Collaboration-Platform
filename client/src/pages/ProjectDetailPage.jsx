import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import commentService from '../services/commentService';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjectById, deleteProject } = useProjects();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // Collaboration request state
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [collabMessage, setCollabMessage] = useState('');
  const [submittingCollab, setSubmittingCollab] = useState(false);
  const [collabFeedback, setCollabFeedback] = useState(null);

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

  // Check if current user is the owner
  const currentUserId = user?._id || user?.id;
  const projectOwnerId = project?.owner?._id || project?.owner;
  const isOwner = Boolean(
    currentUserId && projectOwnerId && currentUserId.toString() === projectOwnerId.toString()
  );
  const canModify = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.title}" permanently?`)) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    try {
      const res = await projectService.addComment(id, newComment.trim());
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Comment Deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  // Handle Collaboration Request Submission
  const handleSendCollaboration = async (e) => {
    e.preventDefault();
    if (!collabMessage.trim() || collabMessage.trim().length < 5) {
      setCollabFeedback({
        type: 'error',
        message: 'Message must be at least 5 characters long.',
      });
      return;
    }

    setSubmittingCollab(true);
    setCollabFeedback(null);
    try {
      await projectService.requestCollaboration(id, collabMessage.trim());
      setCollabFeedback({
        type: 'success',
        message: 'Collaboration request sent successfully to the project owner!',
      });
      setCollabMessage('');
      setTimeout(() => setShowCollabForm(false), 2500);
    } catch (err) {
      setCollabFeedback({
        type: 'error',
        message: err.message || 'Failed to submit collaboration request.',
      });
    } finally {
      setSubmittingCollab(false);
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
          <p>{error || 'Project not found'}</p>
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
      <div className="breadcrumb">
        <Link to="/projects">← Back to Showcase</Link>
      </div>

      <div className="card project-detail-card">
        {/* Detail Header */}
        <div className="detail-header">
          <div>
            <span className="department-tag">{project.category || 'General'}</span>
            <span className="badge-default ml-2">Status: {project.status}</span>
            {project.lookingForCollaborators && (
              <span className="badge-warning ml-2">🤝 Seeking Collaborators</span>
            )}
            <h1 className="detail-title">{project.title}</h1>
            <p className="detail-meta">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          {canModify && (
            <div className="detail-actions">
              <Link to={`/projects/edit/${project._id}`} className="btn btn-secondary">
                ✏️ Edit Project
              </Link>
              <button onClick={handleDelete} className="btn btn-danger-outline">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Detail Body */}
        <div className="detail-body">
          <div className="detail-section">
            <h3>Project Overview</h3>
            <p className="description-text">{project.description}</p>
          </div>

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

          <div className="detail-grid-info">
            <div className="info-block">
              <h4>👤 Project Owner</h4>
              <p>
                <strong>{project.owner?.name || 'Student Creator'}</strong>
              </p>
              {project.owner?.department && (
                <p className="text-muted">{project.owner.department}</p>
              )}
              {project.owner?.email && (
                <p className="text-muted">{project.owner.email}</p>
              )}
            </div>

            <div className="info-block">
              <h4>🎯 Collaboration Status</h4>
              <p>
                {project.lookingForCollaborators
                  ? ' Open for collaboration! Interested students are encouraged to connect.'
                  : ' Not currently seeking new collaborators.'}
              </p>

              {/* Collaboration CTA button */}
              {project.lookingForCollaborators && !isOwner && (
                <div className="mt-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowCollabForm((prev) => !prev)}
                      className="btn btn-primary btn-sm"
                    >
                      {showCollabForm ? '✕ Close Request Form' : '🤝 Request to Join Project'}
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

          {/* Collaboration Request Form Box */}
          {showCollabForm && (
            <div className="card collab-form-box mt-3 mb-3">
              <h4>Send Collaboration Request</h4>
              <p className="text-muted">
                Describe your skills and what you'd like to contribute to this project.
              </p>

              {collabFeedback && (
                <div className={`alert alert-${collabFeedback.type}`}>
                  {collabFeedback.message}
                </div>
              )}

              <form onSubmit={handleSendCollaboration} className="mt-2">
                <div className="form-group">
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="e.g. I have experience with ROS2 and computer vision and would love to help optimize the drone inference model..."
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={submittingCollab}
                    className="btn btn-primary btn-sm"
                  >
                    {submittingCollab ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCollabForm(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Links: GitHub & Demo */}
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

        {/* COMMENTS SECTION */}
        <div className="comments-section">
          <h3>💬 Peer Discussion & Reviews ({comments.length})</h3>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="comment-form mt-3 mb-4">
              {commentError && <div className="alert alert-error">{commentError}</div>}
              <div className="form-group">
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Leave constructive feedback, technical questions, or peer review notes..."
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
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="comment-login-prompt card text-center mt-3 mb-4">
              <p>
                Have questions or feedback on this project?{' '}
                <Link to="/login" className="auth-link">
                  Log in to join the discussion
                </Link>
                .
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-muted mt-2">
              No comments yet. Be the first to share your thoughts on this engineering project!
            </p>
          ) : (
            <div className="comments-list">
              {comments.map((c) => {
                const commentAuthorId = c.author?._id || c.author;
                const canDeleteComment =
                  isAdmin || (currentUserId && currentUserId.toString() === commentAuthorId?.toString());

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
                          onClick={() => handleDeleteComment(c._id)}
                          className="btn btn-danger-outline btn-xs"
                          title="Delete comment"
                        >
                          ✕
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
    </div>
  );
};

export default ProjectDetailPage;
