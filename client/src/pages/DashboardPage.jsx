import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import collaborationService from '../services/collaborationService';

const DashboardPage = () => {
  const { user } = useAuth();
  const { projects, fetchProjects, deleteProject } = useProjects();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'incoming' | 'sent'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [collabError, setCollabError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch all projects to filter by current user
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects owned by current user
  const myProjects = projects.filter((p) => {
    const ownerId = p.owner?._id || p.owner;
    const currentUserId = user?._id || user?.id;
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

  // Handle Accept/Reject collaboration request
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await collaborationService.updateStatus(requestId, newStatus);
      setActionMessage({
        type: 'success',
        text: `Request successfully marked as ${newStatus}!`,
      });
      // Refresh list
      loadCollaborations();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || `Failed to ${newStatus} request`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Handle Project Delete
  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProject(id);
      setActionMessage({
        type: 'success',
        text: `Project "${title}" was deleted.`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to delete project',
      });
      setTimeout(() => setActionMessage(null), 4000);
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
      {/* Dashboard Top Header */}
      <div className="dashboard-hero card">
        <div className="dashboard-hero-content">
          <div className="user-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="dashboard-greeting">Hello, {user?.name}!</h1>
            <p className="dashboard-user-meta">
              <span>🏛️ {user?.department}</span>
              <span className="dot-separator">•</span>
              <span className="user-role-badge">{user?.role}</span>
              <span className="dot-separator">•</span>
              <span>📧 {user?.email}</span>
            </p>
          </div>
        </div>
        <div className="dashboard-actions">
          <Link to="/projects/new" className="btn btn-primary">
            + New Project
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type} mt-3`}>
          {actionMessage.text}
        </div>
      )}

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

      {/* TAB 1: MY PROJECTS */}
      {activeTab === 'projects' && (
        <div className="dashboard-tab-content">
          {myProjects.length === 0 ? (
            <div className="card empty-state text-center">
              <h3>You haven't submitted any projects yet</h3>
              <p>Showcase your engineering capstone, research, or hardware design.</p>
              <Link to="/projects/new" className="btn btn-primary mt-3">
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="my-projects-table-wrapper card">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Collaborators Wanted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>
                          <Link to={`/projects/${p._id}`}>{p.title}</Link>
                        </strong>
                      </td>
                      <td>
                        <span className="department-tag">{p.category}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.lookingForCollaborators ? (
                          <span className="badge-warning">Yes</span>
                        ) : (
                          <span className="text-muted">No</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/projects/${p._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </Link>
                          <Link
                            to={`/projects/edit/${p._id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(p._id, p.title)}
                            className="btn btn-danger-outline btn-sm"
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

      {/* TAB 2: INCOMING REQUESTS */}
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
              <h3>No incoming collaboration requests</h3>
              <p>When other students request to join your projects, they will appear here.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {incomingRequests.map((req) => (
                <div key={req._id} className="card request-card">
                  <div className="request-card-header">
                    <div>
                      <span className="project-badge">
                        Project: <strong>{req.project?.title || 'Unknown Project'}</strong>
                      </span>
                      <h4 className="requester-name">
                        From: {req.requester?.name} ({req.requester?.department})
                      </h4>
                      <p className="requester-email">{req.requester?.email}</p>
                    </div>
                    <span className={`status-badge ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="request-message-text">"{req.message}"</p>

                  <div className="request-card-footer">
                    <span className="request-date">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {req.status === 'pending' ? (
                      <div className="request-actions">
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'accepted')}
                          className="btn btn-primary btn-sm"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'rejected')}
                          className="btn btn-danger-outline btn-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted status-settled">
                        Status: <strong>{req.status}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY SENT REQUESTS */}
      {activeTab === 'sent' && (
        <div className="dashboard-tab-content">
          {loadingCollabs ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading sent requests...</p>
            </div>
          ) : collabError ? (
            <div className="alert alert-error">{collabError}</div>
          ) : myRequests.length === 0 ? (
            <div className="card empty-state text-center">
              <h3>You haven't requested to collaborate on any projects</h3>
              <p>Browse the showcase and request to join projects that spark your interest.</p>
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
                        <Link to={`/projects/${req.project?._id}`}>
                          {req.project?.title}
                        </Link>
                      </h4>
                      <p className="owner-meta">
                        Owner: {req.project?.owner?.name} ({req.project?.owner?.department})
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="request-message-text">My Note: "{req.message}"</p>

                  <div className="request-card-footer">
                    <span className="request-date">
                      Sent on: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/projects/${req.project?._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View Project
                    </Link>
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
