import api from './api';

export const collaborationService = {
  /**
   * Get incoming requests for projects owned by the logged-in user
   */
  async getIncoming() {
    const response = await api.get('/collaborations/incoming');
    return response.data;
  },

  /**
   * Get collaboration requests sent by the logged-in user
   */
  async getMine() {
    const response = await api.get('/collaborations/mine');
    return response.data;
  },

  /**
   * Accept or reject a collaboration request (status: 'accepted' | 'rejected')
   */
  async updateStatus(id, status) {
    const response = await api.patch(`/collaborations/${id}`, { status });
    return response.data;
  },
};

export default collaborationService;
