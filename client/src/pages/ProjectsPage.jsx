import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';

const CATEGORIES = ['All', 'Web', 'Mobile', 'AI/ML', 'Embedded', 'IoT', 'Other'];
const STATUSES = ['All', 'Idea', 'In Progress', 'Completed'];

const ProjectsPage = () => {
  const { projects, loading, error, fetchProjects, deleteProject } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [onlyCollaborators, setOnlyCollaborators] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [notification, setNotification] = useState(null);

  // Trigger fetch with current filter state
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        lookingForCollaborators: onlyCollaborators ? 'true' : '',
        sortBy,
        order,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    onlyCollaborators,
    sortBy,
    order,
    fetchProjects,
  ]);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the project "${title}"?`
    );
    if (!confirmed) return;

    try {
      await deleteProject(id);
      setNotification({
        type: 'success',
        message: `Project "${title}" was successfully deleted.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete project.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Engineering Projects Showcase</h1>
          <p className="page-subtitle">
            Explore innovative projects designed and built by engineering students.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          + Add New Project
        </Link>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="filter-panel card">
        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="search">Search Keywords</label>
            <input
              id="search"
              type="text"
              className="form-control"
              placeholder="Search title, description, tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              className="form-control"
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A - Z)</option>
              <option value="title-desc">Title (Z - A)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="onlyCollaborators"
            type="checkbox"
            checked={onlyCollaborators}
            onChange={(e) => setOnlyCollaborators(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="onlyCollaborators" style={{ cursor: 'pointer', fontSize: '0.9rem', userSelect: 'none' }}>
            🤝 Show only projects looking for collaborators
          </label>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading showcase projects...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>⚠️ Error: {error}</p>
          <button
            onClick={() => fetchProjects()}
            className="btn btn-outline btn-sm mt-2"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state card text-center">
          <h3>No Projects Found</h3>
          <p>There are no engineering projects matching your filter criteria.</p>
          <Link to="/projects/new" className="btn btn-primary mt-3">
            Be the First to Add One
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
