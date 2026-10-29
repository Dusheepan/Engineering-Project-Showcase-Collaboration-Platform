import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const DEPARTMENTS = [
  'Computer Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mechatronics Engineering',
  'Chemical Engineering',
  'Other',
];

const STATUSES = ['Planning', 'In Progress', 'Completed', 'Under Review'];

const ProjectFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addProject, updateProject, fetchProjectById } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Computer Engineering',
    technologies: '',
    teamMembers: '',
    supervisor: '',
    githubUrl: '',
    liveDemoUrl: '',
    status: 'In Progress',
    year: new Date().getFullYear(),
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
          setFormData({
            title: data.title || '',
            description: data.description || '',
            department: data.department || 'Computer Engineering',
            technologies: Array.isArray(data.technologies)
              ? data.technologies.join(', ')
              : '',
            teamMembers: Array.isArray(data.teamMembers)
              ? data.teamMembers.join(', ')
              : '',
            supervisor: data.supervisor || '',
            githubUrl: data.githubUrl || '',
            liveDemoUrl: data.liveDemoUrl || '',
            status: data.status || 'In Progress',
            year: data.year || new Date().getFullYear(),
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
    } else if (formData.title.length > 120) {
      errs.title = 'Title must be 120 characters or fewer';
    }

    if (!formData.description.trim()) {
      errs.description = 'Project description is required';
    }

    if (!formData.technologies.trim()) {
      errs.technologies = 'Please list at least one technology (comma-separated)';
    }

    if (formData.githubUrl && !formData.githubUrl.startsWith('http')) {
      errs.githubUrl = 'GitHub link must begin with http:// or https://';
    }

    if (formData.liveDemoUrl && !formData.liveDemoUrl.startsWith('http')) {
      errs.liveDemoUrl = 'Live demo link must begin with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        teamMembers: formData.teamMembers
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        year: Number(formData.year),
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
            ? 'Update the project specifications and documentation.'
            : 'Fill in the details below to add your project to the showcase.'}
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

          {/* Department & Status */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="department">
                Department <span className="required">*</span>
              </label>
              <select
                id="department"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
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

            <div className="form-group flex-small">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                name="year"
                type="number"
                className="form-control"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
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
              placeholder="Describe the problem, proposed solution, system architecture, and outcomes..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          {/* Technologies */}
          <div className="form-group">
            <label htmlFor="technologies">
              Technologies Used <span className="required">*</span> (Comma-separated)
            </label>
            <input
              id="technologies"
              name="technologies"
              type="text"
              className={`form-control ${errors.technologies ? 'is-invalid' : ''}`}
              placeholder="e.g. React, Node.js, ROS, Arduino, Python, TensorFlow"
              value={formData.technologies}
              onChange={handleChange}
            />
            {errors.technologies && (
              <div className="invalid-feedback">{errors.technologies}</div>
            )}
          </div>

          {/* Team Members & Supervisor */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="teamMembers">
                Team Members (Comma-separated)
              </label>
              <input
                id="teamMembers"
                name="teamMembers"
                type="text"
                className="form-control"
                placeholder="e.g. John Doe (EG/2021/001), Jane Smith (EG/2021/002)"
                value={formData.teamMembers}
                onChange={handleChange}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="supervisor">Supervisor / Mentor</label>
              <input
                id="supervisor"
                name="supervisor"
                type="text"
                className="form-control"
                placeholder="e.g. Dr. A. Fernando"
                value={formData.supervisor}
                onChange={handleChange}
              />
            </div>
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
              <label htmlFor="liveDemoUrl">Live Demo URL</label>
              <input
                id="liveDemoUrl"
                name="liveDemoUrl"
                type="url"
                className={`form-control ${errors.liveDemoUrl ? 'is-invalid' : ''}`}
                placeholder="https://demo.example.com"
                value={formData.liveDemoUrl}
                onChange={handleChange}
              />
              {errors.liveDemoUrl && (
                <div className="invalid-feedback">{errors.liveDemoUrl}</div>
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
