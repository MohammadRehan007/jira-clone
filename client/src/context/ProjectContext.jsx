import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !activeProject) {
        setActiveProject(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  const fetchSprints = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const res = await axiosClient.get(`/sprints?project=${projectId}`);
      setSprints(res.data);
      const currentActive = res.data.find(s => s.status === 'Active');
      setActiveSprint(currentActive || null);
    } catch (err) {
      console.error('Error fetching sprints:', err);
    }
  }, []);

  const fetchTickets = useCallback(async (projectId, sprintId) => {
    if (!projectId) return;
    try {
      let url = `/tickets?project=${projectId}`;
      if (sprintId) {
        url += `&sprint=${sprintId}`;
      }
      const res = await axiosClient.get(url);
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProjects();
    }
  }, [user, fetchUsers, fetchProjects]);

  useEffect(() => {
    if (activeProject) {
      fetchSprints(activeProject._id);
    }
  }, [activeProject, fetchSprints]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        sprints,
        activeSprint,
        tickets,
        users,
        loading,
        fetchProjects,
        fetchSprints,
        fetchTickets,
        fetchUsers,
        setTickets
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
