import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import collaborationService from '../services/collaborationService';
import ConfirmModal from '../components/ConfirmModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, fetchProjects, deleteProject } = useProjects();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'incoming' | 'sent'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [collabError, setCollabError] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: '',
    loading: false,
  });

  // Fetch all projects to filter by current user
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects owned by current user
  const currentUserId = user?._id || user?.id;
  const myProjects = projects.filter((p) => {
    const ownerId = p.owner?._id || p.owner;
    return ownerId?.toString() === currentUserId?.toString();
  });

  // Fetch collaboration requests
  const loadCollaborations = useCallback(async () => {
    setLoadingCollabs(true);
    setCollabError(null);
    try {
      const [incomingData, mineData] = await Promise.all([
        collaborationService.getIncoming(),
        collaborationService.getMine(),
      ]);
      setIncomingRequests(incomingData.data || []);
      setMyRequests(mineData.data || []);
    } catch (err) {
      setCollabError(err.message || 'Failed to load collaboration requests');
    } finally {
      setLoadingCollabs(false);
    }
  }, []);

  useEffect(() => {
    loadCollaborations();
  }, [loadCollaborations]);

  // Show Toast helper
  const showToast = (type, message) => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 3500);
  };

  // Open Delete Modal for a Project
  const handleOpenDeleteModal = (projectId, projectTitle) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectTitle,
      loading: false,
    });
  };

  // Close Delete Modal
  const handleCloseDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectTitle: '',
        loading: false,
      });
    }
  };

  // Confirm and execute project deletion
  const handleConfirmDeleteProject = async () => {
    if (!deleteModal.projectId) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteProject(deleteModal.projectId);
      showToast('success', `Project "${deleteModal.projectTitle}" was deleted permanently.`);
      handleCloseDeleteModal();
      // Refresh list
      fetchProjects();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete project');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle Accept/Reject collaboration request
  const handleStatusUpdate = async (requestId, newStatus, requesterName) => {
    try {
      await collaborationService.updateStatus(requestId, newStatus);
      showToast(
        'success',
        `Collaboration request from ${requesterName || 'student'} marked as ${newStatus}!`
      );
      // Refresh collaboration lists
      loadCollaborations();
    } catch (err) {
      showToast('error', err.message || `Failed to ${newStatus} request`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'Completed':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      case 'pending':
      case 'In Progress':
        return 'badge-info';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="container page-container dashboard-page">
      {/* Toast Notification */}
      {actionToast && (
        <div className="toast-container">
          <div className={`toast toast-${actionToast.type}`}>
            <span className="toast-icon">
              {actionToast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{actionToast.message}</span>
          </div>
        </div>
      )}

      {/* Reusable ConfirmModal for Project Deletion */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Engineering Project"
        itemName={deleteModal.projectTitle}
        message={`Are you sure you want to permanently delete "${deleteModal.projectTitle}"? This will also remove all associated peer comments and collaboration requests.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        loading={deleteModal.loading}
        onConfirm={handleConfirmDeleteProject}
        onCancel={handleCloseDeleteModal}
      />

      {/* Dashboard Top Header Hero */}
      <div className="dashboard-hero card">
        <div className="dashboard-hero-content">
          <div className="user-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="dashboard-greeting">Student Portal: {user?.name}</h1>
            <p className="dashboard-user-meta">
              <span>🏛️ {user?.department || 'Engineering'}</span>
              <span className="dot-separator">•</span>
              <span className="user-role-badge">{user?.role}</span>
              <span className="dot-separator">•</span>
              <span>📧 {user?.email}</span>
            </p>
          </div>
        </div>
        <div className="dashboard-actions">
          <Link to="/projects/new" className="btn btn-primary">
            + Submit New Project
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📁 My Projects ({myProjects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          📬 Incoming Requests ({incomingRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 My Sent Requests ({myRequests.length})
        </button>
      </div>

      {/* TAB 1: MY PROJECTS TABLE */}
      {activeTab === 'projects' && (
        <div className="dashboard-tab-content">
          {projectsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your projects...</p>
            </div>
          ) : projectsError ? (
            <div className="alert alert-error">
              <p>⚠️ Error: {projectsError}</p>
              <button
                type="button"
                onClick={() => fetchProjects()}
                className="btn btn-outline btn-sm mt-2"
              >
                Retry Fetch
              </button>
            </div>
          ) : myProjects.length === 0 ? (
            <div className="card empty-state text-center">
              <div className="empty-icon">📁</div>
              <h3>You haven't submitted any projects yet</h3>
              <p className="text-muted">
                Publish your engineering capstone, research paper, hardware prototype, or software system to receive peer feedback.
              </p>
              <Link to="/projects/new" className="btn btn-primary mt-3">
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="my-projects-table-wrapper card">
              <div className="table-header-bar">
                <h3>My Submitted Projects ({myProjects.length})</h3>
                <Link to="/projects/new" className="btn btn-primary btn-sm">
                  + Add Project
                </Link>
              </div>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Seeking Teammates</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>
                          <Link to={`/projects/${p._id}`} className="table-project-link">
                            {p.title || 'Untitled Project'}
                          </Link>
                        </strong>
                      </td>
                      <td>
                        <span className="department-tag">{p.category || 'Other'}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(p.status)}`}>
                          {p.status || 'Idea'}
                        </span>
                      </td>
                      <td>
                        {p.lookingForCollaborators ? (
                          <span className="collab-wanted-pill">🤝 Seeking</span>
                        ) : (
                          <span className="text-muted">No</span>
                        )}
                      </td>
                      <td className="text-muted">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/projects/${p._id}`}
                            className="btn btn-outline btn-sm"
                            title="View project details"
                          >
                            View
                          </Link>
                          <Link
                            to={`/projects/edit/${p._id}`}
                            className="btn btn-secondary btn-sm"
                            title="Edit project"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(p._id, p.title)}
                            className="btn btn-danger-outline btn-sm"
                            title="Delete project"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING COLLABORATION REQUESTS */}
      {activeTab === 'incoming' && (
        <div className="dashboard-tab-content">
          {loadingCollabs ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading incoming collaboration requests...</p>
            </div>
          ) : collabError ? (
            <div className="alert alert-error">{collabError}</div>
          ) : incomingRequests.length === 0 ? (
            <div className="card empty-state text-center">
              <div className="empty-icon">📬</div>
              <h3>No incoming collaboration requests</h3>
              <p className="text-muted">
                When other students discover your projects and request to join your team, their pitches will appear here.
              </p>
            </div>
          ) : (
            <div className="requests-grid">
              {incomingRequests.map((req) => (
                <div key={req._id} className="card request-card">
                  <div className="request-card-header">
                    <div>
                      <span className="project-badge">
                        Project:{' '}
                        <strong>
                          {req.project ? (
                            <Link to={`/projects/${req.project._id}`}>
                              {req.project.title || 'Untitled Project'}
                            </Link>
                          ) : (
                            <span className="text-muted italic">Archived Project</span>
                          )}
                        </strong>
                      </span>
                      <h4 className="requester-name">
                        From: {req.requester?.name || 'Anonymous Requester'}
                      </h4>
                      <p className="requester-email">
                        🏛️ {req.requester?.department || 'Engineering'} • 📧{' '}
                        {req.requester?.email || 'No email provided'}
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="request-message-text">
                    "{req.message}"
                  </p>

                  <div className="request-card-footer">
                    <span className="request-date">
                      Received on: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                    </span>

                    {req.status === 'pending' ? (
                      <div className="request-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              req._id,
                              'accepted',
                              req.requester?.name
                            )
                          }
                          className="btn btn-primary btn-sm btn-accept"
                        >
                          ✓ Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              req._id,
                              'rejected',
                              req.requester?.name
                            )
                          }
                          className="btn btn-danger-outline btn-sm btn-reject"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="status-settled">
                        Status:{' '}
                        <strong
                          className={
                            req.status === 'accepted'
                              ? 'text-success'
                              : 'text-danger'
                          }
                        >
                          {req.status.toUpperCase()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY SENT COLLABORATION REQUESTS */}
      {activeTab === 'sent' && (
        <div className="dashboard-tab-content">
          {loadingCollabs ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your sent requests...</p>
            </div>
          ) : collabError ? (
            <div className="alert alert-error">{collabError}</div>
          ) : myRequests.length === 0 ? (
            <div className="card empty-state text-center">
              <div className="empty-icon">📤</div>
              <h3>You haven't requested to join any projects yet</h3>
              <p className="text-muted">
                Explore student projects seeking teammates and send a collaboration pitch.
              </p>
              <Link to="/projects" className="btn btn-primary mt-3">
                Browse Showcase
              </Link>
            </div>
          ) : (
            <div className="requests-grid">
              {myRequests.map((req) => (
                <div key={req._id} className="card request-card">
                  <div className="request-card-header">
                    <div>
                      <h4 className="project-title-link">
                        {req.project ? (
                          <Link to={`/projects/${req.project._id}`}>
                            {req.project.title || 'Engineering Project'}
                          </Link>
                        ) : (
                          <span className="text-muted italic">Archived Project</span>
                        )}
                      </h4>
                      <p className="owner-meta">
                        Owner: {req.project?.owner?.name || 'Student Creator'} (
                        {req.project?.owner?.department || 'Faculty of Engineering'})
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusBadge(req.status)}`}>
                      {req.status === 'accepted'
                        ? 'Accepted 🎉'
                        : req.status === 'rejected'
                        ? 'Declined ✕'
                        : 'Pending Review ⏳'}
                    </span>
                  </div>

                  <p className="request-message-text">
                    My Pitch: "{req.message}"
                  </p>

                  <div className="request-card-footer">
                    <span className="request-date">
                      Submitted on: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    {req.project && (
                      <Link
                        to={`/projects/${req.project._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Project Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
