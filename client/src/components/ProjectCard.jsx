import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-success';
      case 'In Progress':
        return 'badge-info';
      case 'Idea':
        return 'badge-warning';
      default:
        return 'badge-default';
    }
  };

  const techs = project.techStack || project.technologies || [];

  return (
    <div className="card project-card">
      <div className="project-card-header">
        <span className="department-tag">{project.category || 'General'}</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {project.lookingForCollaborators && (
            <span
              className="badge-warning"
              style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}
              title="Seeking teammates"
            >
              🤝 Collaborators Wanted
            </span>
          )}
          <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      <h3 className="project-title">
        <Link to={`/projects/${project._id}`}>{project.title}</Link>
      </h3>

      <p className="project-description">
        {project.description.length > 130
          ? `${project.description.substring(0, 130)}...`
          : project.description}
      </p>

      <div className="tech-stack-tags">
        {techs.slice(0, 4).map((tech, idx) => (
          <span key={idx} className="tech-pill">
            {tech}
          </span>
        ))}
        {techs.length > 4 && (
          <span className="tech-pill-more">+{techs.length - 4} more</span>
        )}
      </div>

      <div className="project-card-footer">
        <div className="project-meta">
          <span className="meta-year">
            {project.owner?.name ? `By ${project.owner.name}` : `Owner: Student`}
          </span>
        </div>
        <div className="card-actions">
          <Link to={`/projects/${project._id}`} className="btn btn-outline btn-sm">
            View
          </Link>
          <Link to={`/projects/edit/${project._id}`} className="btn btn-secondary btn-sm">
            Edit
          </Link>
          <button
            onClick={() => onDelete(project._id, project.title)}
            className="btn btn-danger-outline btn-sm"
            title="Delete Project"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
