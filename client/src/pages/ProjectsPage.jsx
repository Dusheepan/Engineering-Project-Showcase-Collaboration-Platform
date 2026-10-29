import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';

const DEPARTMENTS = [
  'All',
  'Computer Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mechatronics Engineering',
  'Chemical Engineering',
  'Other',
];

const STATUSES = ['All', 'In Progress', 'Completed', 'Planning', 'Under Review'];

const ProjectsPage = () => {
  const { projects, loading, error, fetchProjects, deleteProject } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [notification, setNotification] = useState(null);

  // Trigger fetch with current filter state
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects({
        search: searchTerm,
        department: selectedDept,
        status: selectedStatus,
        sortBy,
        order,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedDept, selectedStatus, sortBy, order, fetchProjects]);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete the project "${title}"?`);
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
              placeholder="Search by title, description, or tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
