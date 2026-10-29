import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStatusBadgeClass, getCategoryClass, truncateText } from '../utils/formatters';

/**
 * ProjectCard Component
 * Displays a summary card for an engineering showcase project including
 * category, status, title, truncated description, tech chips, and authorized action buttons.
 *
 * @param {Object} project - The project data object
 * @param {Function} onDelete - Optional callback invoked when the owner/admin clicks delete
 */
const ProjectCard = ({ project, onDelete }) => {
  const { user, isAdmin } = useAuth();

  // Guard against undefined project data
  if (!project) return null;

  const techs = Array.isArray(project.techStack)
    ? project.techStack
    : Array.isArray(project.technologies)
    ? project.technologies
    : [];

  const desc = project.description || '';

  // Determine if current user can edit/delete this card (owner or admin)
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
            {project.status || 'Idea'}
          </span>
        </div>
      </div>

      {/* Project Title */}
      <h3 className="project-title">
        <Link to={`/projects/${project._id}`}>{project.title || 'Untitled Project'}</Link>
      </h3>

      {/* Description Snippet */}
      <p className="project-description">
        {truncateText(desc, 130) || 'No description provided.'}
      </p>

      {/* Tech Stack Chips (Show first 4) */}
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

      {/* Card Footer: Owner Metadata & Actions */}
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
