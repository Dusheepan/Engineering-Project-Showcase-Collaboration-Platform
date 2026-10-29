import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import ConfirmModal from '../components/ConfirmModal';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../utils/constants';

const CATEGORIES = ['All', ...PROJECT_CATEGORIES];
const STATUSES = ['All', ...PROJECT_STATUSES];

/**
 * ProjectsPage Component
 * Public showcase directory displaying project cards in a responsive grid.
 * Equipped with debounced keyword search, category & status dropdown filters,
 * sort order selection, per-page limit controls, and pagination.
 */
const ProjectsPage = () => {
  const { projects, pagination, loading, error, fetchProjects, deleteProject } = useProjects();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6); // 6 projects per page looks ideal in 3-column grid
  const [notification, setNotification] = useState(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search term
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page to 1 on category, status, or sort change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // Clear all filters helper
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('newest');
    setPage(1);
  };

  // Execute API call whenever query parameters change
  useEffect(() => {
    fetchProjects({
      search: debouncedSearch.trim(),
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      status: selectedStatus === 'All' ? undefined : selectedStatus,
      sort: sortBy,
      page,
      limit,
    });
  }, [debouncedSearch, selectedCategory, selectedStatus, sortBy, page, limit, fetchProjects]);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: '',
    loading: false,
  });

  const handleOpenDeleteModal = (id, title) => {
    setDeleteModal({
      isOpen: true,
      projectId: id,
      projectTitle: title,
      loading: false,
    });
  };

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

  const handleConfirmDelete = async () => {
    if (!deleteModal.projectId) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteProject(deleteModal.projectId);
      setNotification({
        type: 'success',
        message: `Project "${deleteModal.projectTitle}" was successfully deleted.`,
      });
      handleCloseDeleteModal();
      // Refresh current page
      fetchProjects({
        search: debouncedSearch.trim(),
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        sort: sortBy,
        page,
        limit,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete project.',
      });
      setDeleteModal((prev) => ({ ...prev, loading: false }));
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const totalPages = pagination?.pages || 1;
  const totalCount = pagination?.total || 0;
  const hasActiveFilters =
    Boolean(debouncedSearch.trim()) ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    sortBy !== 'newest';

  return (
    <div className="container page-container projects-showcase-page">
      {/* Reusable ConfirmModal for Project Deletion */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Showcase Project"
        itemName={deleteModal.projectTitle}
        message={`Are you sure you want to permanently delete "${deleteModal.projectTitle}"? This will delete the project, all comments, and collaboration requests permanently.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        loading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Engineering Projects Showcase</h1>
          <p className="page-subtitle">
            Explore capstone innovations, research systems, and student hardware designs.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          + Submit Project
        </Link>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Search & Filter Controls Panel */}
      <div className="filter-panel card">
        <div className="filter-grid">
          {/* 1. Search Box */}
          <div className="form-group search-group">
            <label htmlFor="search">🔍 Search Keywords</label>
            <div className="search-input-wrapper">
              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Search by title, description, or tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 2. Category Filter */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-control"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Status Filter */}
          <div className="form-group">
            <label htmlFor="status">Development Status</label>
            <select
              id="status"
              className="form-control"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              {STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  {stat === 'All' ? 'All Statuses' : stat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sort Dropdown */}
          <div className="form-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              className="form-control"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Meta Bar (Active filters summary + Clear CTA) */}
        <div className="filter-meta-bar">
          <div className="results-counter">
            {loading ? (
              <span>Searching projects...</span>
            ) : (
              <span>
                Showing <strong>{projects.length}</strong> of{' '}
                <strong>{totalCount}</strong> total projects
              </span>
            )}
          </div>

          <div className="filter-actions-right">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-outline btn-xs btn-clear-filters"
              >
                ✕ Reset Filters
              </button>
            )}

            <div className="per-page-selector">
              <label htmlFor="perPage">Per page:</label>
              <select
                id="perPage"
                value={limit}
                onChange={handleLimitChange}
                className="form-control-xs"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering: Loading Spinner / Error / Empty State / Projects Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading showcase projects...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>⚠️ Error: {error}</p>
          <button
            onClick={() =>
              fetchProjects({
                search: debouncedSearch,
                category: selectedCategory === 'All' ? undefined : selectedCategory,
                status: selectedStatus === 'All' ? undefined : selectedStatus,
                sort: sortBy,
                page,
                limit,
              })
            }
            className="btn btn-outline btn-sm mt-2"
          >
            Retry Fetch
          </button>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="empty-state card text-center">
          <div className="empty-icon">🔍</div>
          <h3>No Projects Found</h3>
          <p className="text-muted">
            We couldn't find any engineering projects matching your current search or filter criteria.
          </p>
          <div className="empty-state-actions mt-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn btn-outline btn-sm"
              >
                Clear All Filters
              </button>
            )}
            <Link to="/projects/new" className="btn btn-primary btn-sm ml-2">
              + Submit a Project
            </Link>
          </div>
        </div>
      ) : (
        /* Projects Grid */
        <>
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bar mt-4">
              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`pagination-number-btn ${pageNum === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
