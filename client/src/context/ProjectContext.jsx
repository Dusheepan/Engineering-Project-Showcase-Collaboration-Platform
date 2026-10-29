import React, { createContext, useContext, useState, useCallback } from 'react';
import projectService from '../services/projectService';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  });
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all projects matching filter, sort, search, and pagination query criteria
   */
  const fetchProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.getAllProjects(filters);
      setProjects(result.data || []);
      setPagination({
        page: result.page || 1,
        pages: result.pages || 1,
        total: result.total ?? (result.data?.length || 0),
        count: result.count ?? (result.data?.length || 0),
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single project by ID
   */
  const fetchProjectById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.getProjectById(id);
      setCurrentProject(result.data);
      return result.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new project
   */
  const addProject = async (projectData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.createProject(projectData);
      setProjects((prev) => [result.data, ...prev]);
      return result.data;
    } catch (err) {
      setError(err.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing project
   */
  const updateProject = async (id, projectData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectService.updateProject(id, projectData);
      setProjects((prev) =>
        prev.map((proj) => (proj._id === id ? result.data : proj))
      );
      if (currentProject?._id === id) {
        setCurrentProject(result.data);
      }
      return result.data;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a project
   */
  const deleteProject = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
      if (currentProject?._id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    projects,
    pagination,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    deleteProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

/**
 * Custom hook to use the ProjectContext
 */
export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
