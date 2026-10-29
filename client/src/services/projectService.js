import api from './api';

/**
 * Project API Service
 * Handles all CRUD operations talking to /api/projects
 */
export const projectService = {
  /**
   * Fetch all projects with optional query params for search, filtering, and sorting
   */
  async getAllProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  /**
   * Fetch a single project by ID
   */
  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  /**
   * Update an existing project
   */
  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  /**
   * Delete a project
   */
  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
