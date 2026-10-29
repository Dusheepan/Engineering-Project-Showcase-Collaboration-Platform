/**
 * Shared UI formatting and helper functions across client components
 */

/**
 * Returns CSS badge class based on project development status
 * @param {string} status - Project development status ('Completed', 'In Progress', 'Idea', etc.)
 * @returns {string} CSS class name
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
    case 'accepted':
      return 'badge-success';
    case 'In Progress':
    case 'pending':
      return 'badge-info';
    case 'Idea':
      return 'badge-warning';
    case 'rejected':
      return 'badge-error';
    default:
      return 'badge-default';
  }
};

/**
 * Returns CSS badge class based on engineering discipline category
 * @param {string} category - Engineering category ('Web', 'Mobile', 'AI/ML', 'Embedded', 'IoT', etc.)
 * @returns {string} CSS class name
 */
export const getCategoryClass = (category) => {
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

/**
 * Safely formats an ISO date string into a localized date representation
 * @param {string|Date} dateString - Input date
 * @param {string} fallback - Fallback string if date is missing or invalid
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, fallback = 'Recent') => {
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString();
  } catch {
    return fallback;
  }
};

/**
 * Safely truncates a text string to a maximum length with ellipsis
 * @param {string} text - Input text
 * @param {number} maxLength - Character threshold
 * @returns {string} Truncated string
 */
export const truncateText = (text, maxLength = 130) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Validates a web URL string (must start with http:// or https://)
 * @param {string} urlString - URL to validate
 * @returns {boolean} True if valid or empty (for optional fields)
 */
export const isValidUrl = (urlString) => {
  if (!urlString) return true;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
