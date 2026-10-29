import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onDelete }) => {
  const { user, isAdmin } = useAuth();

  // Status styling
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

  // Category chip styling
  const getCategoryClass = (category) => {
    switch (category) {
      case 'AI/ML':
        return 'cat-badge-ai';
      case 'IoT':
        return 'cat-badge-iot';
      case 'Web':
        return 'cat-badge-web';
      case 'Mobile':
        return 'cat-badge-mobile';
      case 'Embedded':
        return 'cat-badge-embedded';
      default:
        return 'cat-badge-other';
    }
  };

  const techs = project.techStack || project.technologies || [];

  // Determine if current user can edit/delete this card
  const currentUserId = user?._id || user?.id;
  const projectOwnerId = project.owner?._id || project.owner;
  const isOwner = Boolean(
    currentUserId &&
      projectOwnerId &&
      currentUserId.toString() === projectOwnerId.toString()
  );
  const canModify = isOwner || isAdmin;

  return (
    <div className="card project-card">
      {/* Card Header: Category & Status Badges */}
      <div className="project-card-header">
        <span className={`category-badge ${getCategoryClass(project.category)}`}>
          {project.category || 'Other'}
        </span>

        <div className="header-badges-right">
          {project.lookingForCollaborators && (
            <span
              className="collab-wanted-pill"
              title="This project is seeking teammates and collaborators"
            >
              🤝 Collab Wanted
            </span>
          )}
          <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="project-title">
        <Link to={`/projects/${project._id}`}>{project.title}</Link>
      </h3>

      {/* Description Snippet */}
      <p className="project-description">
        {project.description.length > 130
          ? `${project.description.substring(0, 130)}...`
          : project.description}
      </p>

      {/* Tech Stack Chips */}
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

      {/* Card Footer: Owner Name & Actions */}
      <div className="project-card-footer">
        <div className="project-meta-owner">
          <span className="owner-icon">👤</span>
          <span className="owner-name" title={project.owner?.email || ''}>
            {project.owner?.name || 'Engineering Student'}
          </span>
        </div>

        <div className="card-actions">
          <Link
            to={`/projects/${project._id}`}
            className="btn btn-outline btn-sm"
          >
            View Details
          </Link>
          {canModify && (
            <>
              <Link
                to={`/projects/edit/${project._id}`}
                className="btn btn-secondary btn-sm"
                title="Edit Project"
              >
                ✏️
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(project._id, project.title)}
                  className="btn btn-danger-outline btn-sm"
                  title="Delete Project"
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
