import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjectById, deleteProject } = useProjects();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectById(id);
        setProject(data);
      } catch (err) {
        setError(err.message || 'Project not found');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, fetchProjectById]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.title}" permanently?`)) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
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
    <div className="container page-container">
      <div className="breadcrumb">
        <Link to="/projects">← Back to Showcase</Link>
      </div>

      <div className="card project-detail-card">
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

          <div className="detail-actions">
            <Link to={`/projects/edit/${project._id}`} className="btn btn-secondary">
              ✏️ Edit Project
            </Link>
            <button onClick={handleDelete} className="btn btn-danger-outline">
              🗑️ Delete
            </button>
          </div>
        </div>

        <hr className="divider" />

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
                  ? ' Open for collaboration! Interested students are encouraged to reach out.'
                  : ' Not currently seeking new collaborators.'}
              </p>
            </div>
          </div>

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
      </div>
    </div>
  );
};

export default ProjectDetailPage;
