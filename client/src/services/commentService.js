import api from './api';

export const commentService = {
  /**
   * Delete a comment (author or admin only)
   */
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
