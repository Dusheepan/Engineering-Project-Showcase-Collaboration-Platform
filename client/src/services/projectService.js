import api from './api';

/**
 * Project API Service
 * Handles all CRUD operations, nested comments, and collaboration requests
 */
export const projectService = {
  /**
   * Fetch projects with optional query params (search, category, status, sort, page, limit)
   */
  async getAllProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  /**
   * Fetch a single project by ID with owner populated
   */
  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project (requires authentication)
   */
  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  /**
   * Update an existing project (owner or admin only)
   */
  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  /**
   * Delete a project (owner or admin only)
   */
  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Fetch comments for a project
   */
  async getComments(projectId) {
    const response = await api.get(`/projects/${projectId}/comments`);
    return response.data;
  },

  /**
   * Add a comment to a project
   */
  async addComment(projectId, text) {
    const response = await api.post(`/projects/${projectId}/comments`, { text });
    return response.data;
  },

  /**
   * Submit a collaboration request on a project
   */
  async requestCollaboration(projectId, message) {
    const response = await api.post(`/projects/${projectId}/collaborate`, {
      message,
    });
    return response.data;
  },
};

export default projectService;
