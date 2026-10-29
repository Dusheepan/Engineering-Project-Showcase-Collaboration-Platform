import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const CATEGORIES = ['Web', 'Mobile', 'AI/ML', 'Embedded', 'IoT', 'Other'];
const STATUSES = ['Idea', 'In Progress', 'Completed'];

const ProjectFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addProject, updateProject, fetchProjectById } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web',
    techStack: '',
    githubUrl: '',
    demoUrl: '',
    status: 'Idea',
    lookingForCollaborators: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditing);

  // If editing, load project data
  useEffect(() => {
    if (isEditing) {
      const load = async () => {
        try {
          const data = await fetchProjectById(id);
          const techs = data.techStack || data.technologies || [];
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || 'Web',
            techStack: Array.isArray(techs) ? techs.join(', ') : '',
            githubUrl: data.githubUrl || '',
            demoUrl: data.demoUrl || data.liveDemoUrl || '',
            status: data.status || 'Idea',
            lookingForCollaborators: Boolean(data.lookingForCollaborators),
          });
        } catch (err) {
          setErrors({ form: 'Failed to load project details for editing.' });
        } finally {
          setLoadingInitial(false);
        }
      };
      load();
    }
  }, [id, isEditing, fetchProjectById]);

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Project title is required';
    } else if (formData.title.length < 3 || formData.title.length > 100) {
      errs.title = 'Title must be between 3 and 100 characters long';
    }

    if (!formData.description.trim()) {
      errs.description = 'Project description is required';
    } else if (formData.description.length < 20) {
      errs.description = 'Description must be at least 20 characters long';
    }

    if (!formData.techStack.trim()) {
      errs.techStack = 'Please list at least one technology (comma-separated)';
    }

    if (formData.githubUrl && !formData.githubUrl.startsWith('http')) {
      errs.githubUrl = 'GitHub link must begin with http:// or https://';
    }

    if (formData.demoUrl && !formData.demoUrl.startsWith('http')) {
      errs.demoUrl = 'Demo link must begin with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        techStack: formData.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        githubUrl: formData.githubUrl,
        demoUrl: formData.demoUrl,
        status: formData.status,
        lookingForCollaborators: formData.lookingForCollaborators,
      };

      if (isEditing) {
        await updateProject(id, payload);
        navigate(`/projects/${id}`);
      } else {
        const created = await addProject(payload);
        navigate(`/projects/${created._id}`);
      }
    } catch (err) {
      setErrors({
        form: err.message || 'Operation failed. Please verify input data.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="container page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container">
      <div className="breadcrumb">
        <Link to="/projects">← Back to Showcase</Link>
      </div>

      <div className="card form-card">
        <h1 className="page-title">
          {isEditing ? 'Edit Engineering Project' : 'Submit New Project'}
        </h1>
        <p className="page-subtitle">
          {isEditing
            ? 'Update the project specifications and links.'
            : 'Fill in the details below to publish your project in the showcase.'}
        </p>

        {errors.form && <div className="alert alert-error">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              Project Title <span className="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Autonomous Solar-Powered Quadcopter"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Category & Status */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="status">Development Status</label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                {STATUSES.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Looking For Collaborators Checkbox */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              id="lookingForCollaborators"
              name="lookingForCollaborators"
              type="checkbox"
              checked={formData.lookingForCollaborators}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="lookingForCollaborators" style={{ margin: 0, cursor: 'pointer' }}>
              🤝 Looking for Collaborators / Teammates
            </label>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Project Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Describe problem statement, proposed engineering solution, and outcomes..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          {/* Tech Stack */}
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
            />
            {errors.techStack && (
              <div className="invalid-feedback">{errors.techStack}</div>
            )}
          </div>

          {/* Links: GitHub & Demo */}
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
                placeholder="https://demo.example.edu"
                value={formData.demoUrl}
                onChange={handleChange}
              />
              {errors.demoUrl && (
                <div className="invalid-feedback">{errors.demoUrl}</div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Publish Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}
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

export default ProjectFormPage;
