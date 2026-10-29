import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import projectService from '../services/projectService';
import { useProjects } from '../context/ProjectContext';

const CATEGORIES = ['Web', 'Mobile', 'AI/ML', 'Embedded', 'IoT', 'Other'];
const STATUSES = ['Idea', 'In Progress', 'Completed'];

/**
 * Validates a web URL string (must start with http:// or https://)
 */
const isValidUrl = (urlString) => {
  if (!urlString) return true; // Optional field
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const ProjectForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { fetchProjects } = useProjects();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web',
    status: 'Idea',
    techStack: '',
    githubUrl: '',
    demoUrl: '',
    lookingForCollaborators: false,
  });

  // UI & Feedback States
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [toast, setToast] = useState(null);

  // In Edit Mode: Pre-fill form from the API
  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;
    const fetchExistingProject = async () => {
      try {
        setLoadingInitial(true);
        setServerError(null);

        const response = await projectService.getProjectById(id);
        const project = response.data;

        if (isMounted && project) {
          const techs = project.techStack || project.technologies || [];
          setFormData({
            title: project.title || '',
            description: project.description || '',
            category: project.category || 'Web',
            status: project.status || 'Idea',
            techStack: Array.isArray(techs) ? techs.join(', ') : '',
            githubUrl: project.githubUrl || '',
            demoUrl: project.demoUrl || project.liveDemoUrl || '',
            lookingForCollaborators: Boolean(project.lookingForCollaborators),
          });
        }
      } catch (err) {
        if (isMounted) {
          setServerError(
            err.message || 'Failed to load project details for editing.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    fetchExistingProject();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  /**
   * Client-side validation matching server rules:
   * - title: required, 3-100 characters
   * - description: required, minimum 20 characters
   * - category: required, valid enum
   * - status: valid enum
   * - techStack: at least 1 technology
   * - githubUrl: valid URL (http/https) if provided
   * - demoUrl: valid URL (http/https) if provided
   */
  const validate = () => {
    const errs = {};

    // 1. Title
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      errs.title = 'Project title is required';
    } else if (trimmedTitle.length < 3) {
      errs.title = 'Title must be at least 3 characters long';
    } else if (trimmedTitle.length > 100) {
      errs.title = 'Title cannot exceed 100 characters';
    }

    // 2. Description
    const trimmedDesc = formData.description.trim();
    if (!trimmedDesc) {
      errs.description = 'Project description is required';
    } else if (trimmedDesc.length < 20) {
      errs.description = 'Description must be at least 20 characters long';
    }

    // 3. Category
    if (!formData.category || !CATEGORIES.includes(formData.category)) {
      errs.category = `Please select a valid category (${CATEGORIES.join(', ')})`;
    }

    // 4. Status
    if (!formData.status || !STATUSES.includes(formData.status)) {
      errs.status = `Please select a valid status (${STATUSES.join(', ')})`;
    }

    // 5. Tech Stack (at least one technology)
    const techArray = formData.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (techArray.length === 0) {
      errs.techStack = 'Please list at least one technology (comma-separated)';
    }

    // 6. GitHub URL
    if (formData.githubUrl.trim() && !isValidUrl(formData.githubUrl.trim())) {
      errs.githubUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    // 7. Demo URL
    if (formData.demoUrl.trim() && !isValidUrl(formData.demoUrl.trim())) {
      errs.demoUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /**
   * Handle input changes and clear inline errors on type
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error as soon as user modifies it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    // Format payload
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      status: formData.status,
      techStack: formData.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      githubUrl: formData.githubUrl.trim(),
      demoUrl: formData.demoUrl.trim(),
      lookingForCollaborators: Boolean(formData.lookingForCollaborators),
    };

    try {
      let targetProjectId = id;

      if (isEditing) {
        await projectService.updateProject(id, payload);
      } else {
        const result = await projectService.createProject(payload);
        targetProjectId = result.data?._id;
      }

      // Refresh global projects list
      fetchProjects();

      // Show success toast notification
      const successMessage = isEditing
        ? 'Project updated successfully!'
        : 'Project published successfully!';

      setToast({
        type: 'success',
        message: successMessage,
      });

      // Redirect after showing the toast
      setTimeout(() => {
        if (targetProjectId) {
          navigate(`/projects/${targetProjectId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1400);
    } catch (err) {
      // Map server-returned errors to inline fields and top banner
      const backendErrors = err.errors || [];
      const inlineServerErrors = {};

      if (backendErrors.length > 0) {
        backendErrors.forEach((bErr) => {
          if (bErr.field) {
            inlineServerErrors[bErr.field] = bErr.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...inlineServerErrors }));
      }

      setServerError(
        err.message || 'Operation failed. Please review the form and try again.'
      );
      setSubmitting(false);
    }
  };

  // Preview tags from comma-separated input
  const previewTags = formData.techStack
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (loadingInitial) {
    return (
      <div className="container page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project specifications from server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container project-form-page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">✓</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="breadcrumb">
        <Link to={isEditing ? `/projects/${id}` : '/projects'}>
          ← Back to {isEditing ? 'Project Details' : 'Showcase'}
        </Link>
      </div>

      <div className="card form-card">
        {/* Form Title & Subtitle */}
        <div className="form-header">
          <h1 className="page-title">
            {isEditing ? '✏️ Edit Engineering Project' : '🚀 Submit New Project'}
          </h1>
          <p className="page-subtitle">
            {isEditing
              ? 'Update specifications, technology stack, and public repository links.'
              : 'Showcase your engineering capstone, research, or innovative prototype.'}
          </p>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="alert alert-error mt-3">
            <strong>Server Error:</strong> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="form-stack mt-4">
          {/* Field 1: Title */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="title">
                Project Title <span className="required">*</span>
              </label>
              <span className="char-counter">
                {formData.title.length}/100 chars (min 3)
              </span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Autonomous Solar-Powered Crop Monitoring Quadcopter"
              value={formData.title}
              onChange={handleChange}
              disabled={submitting}
              maxLength={100}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          {/* Field 2 & 3: Category & Status */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                value={formData.category}
                onChange={handleChange}
                disabled={submitting}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="invalid-feedback">{errors.category}</div>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="status">
                Development Status <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                value={formData.status}
                onChange={handleChange}
                disabled={submitting}
              >
                {STATUSES.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
              {errors.status && (
                <div className="invalid-feedback">{errors.status}</div>
              )}
            </div>
          </div>

          {/* Field 4: Looking for Collaborators */}
          <div className="form-group checkbox-group-card">
            <input
              id="lookingForCollaborators"
              name="lookingForCollaborators"
              type="checkbox"
              className="custom-checkbox"
              checked={formData.lookingForCollaborators}
              onChange={handleChange}
              disabled={submitting}
            />
            <label htmlFor="lookingForCollaborators" className="checkbox-label">
              <strong>🤝 Looking for Collaborators</strong>
              <span className="checkbox-description">
                Check this if you want peers to discover and request to join your project team.
              </span>
            </label>
          </div>

          {/* Field 5: Description */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="description">
                Project Description <span className="required">*</span>
              </label>
              <span className="char-counter">
                {formData.description.trim().length} chars (min 20)
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              rows={5}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Detail the engineering problem statement, technical methodology, hardware/software architecture, and expected outcomes..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          {/* Field 6: Tech Stack */}
          <div className="form-group">
            <label htmlFor="techStack">
              Tech Stack <span className="required">*</span> (Comma-separated)
            </label>
            <input
              id="techStack"
              name="techStack"
              type="text"
              className={`form-control ${errors.techStack ? 'is-invalid' : ''}`}
              placeholder="e.g. React, Node.js, ROS2, PyTorch, C++, Arduino"
              value={formData.techStack}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.techStack && (
              <div className="invalid-feedback">{errors.techStack}</div>
            )}

            {/* Live Tag Badges Preview */}
            {previewTags.length > 0 && (
              <div className="tags-preview-container mt-2">
                <span className="tags-preview-label">Tags Preview:</span>
                <div className="tech-stack-tags">
                  {previewTags.map((tag, idx) => (
                    <span key={idx} className="tech-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Field 7 & 8: GitHub URL & Live Demo URL */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="githubUrl">GitHub Repository URL</label>
              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                className={`form-control ${errors.githubUrl ? 'is-invalid' : ''}`}
                placeholder="https://github.com/username/project"
                value={formData.githubUrl}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.githubUrl && (
                <div className="invalid-feedback">{errors.githubUrl}</div>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="demoUrl">Live Demo URL</label>
              <input
                id="demoUrl"
                name="demoUrl"
                type="url"
                className={`form-control ${errors.demoUrl ? 'is-invalid' : ''}`}
                placeholder="https://project-demo.example.edu"
                value={formData.demoUrl}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.demoUrl && (
                <div className="invalid-feedback">{errors.demoUrl}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
            >
              {submitting ? (
                <>
                  <span className="spinner-sm"></span>
                  {isEditing ? 'Saving Changes...' : 'Publishing Project...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Publish Project'
              )}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                navigate(isEditing ? `/projects/${id}` : '/projects')
              }
              className="btn btn-outline btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
