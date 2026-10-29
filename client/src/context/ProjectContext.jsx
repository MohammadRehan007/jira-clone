import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();

  // In-memory cache for ultra-fast, zero-lag project switching
  const projectCacheRef = useRef({});

  // Initialize projects list from localStorage if available
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('jira_projects');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Initialize active project from localStorage if available
  const [activeProject, setActiveProjectState] = useState(() => {
    try {
      const cached = localStorage.getItem('jira_active_project');
      if (cached) return JSON.parse(cached);
      const cachedList = localStorage.getItem('jira_projects');
      if (cachedList) {
        const list = JSON.parse(cachedList);
        if (list && list.length > 0) return list[0];
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch users for member lists, assignees, etc.
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosClient.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Fetch projects list (stable callback, NO activeProject dependency!)
  const fetchProjects = useCallback(async () => {
    try {
      setProjectsLoading(true);
      const res = await axiosClient.get('/projects');
      const list = res.data || [];
      setProjects(list);
      localStorage.setItem('jira_projects', JSON.stringify(list));

      setActiveProjectState((prev) => {
        if (!prev && list.length > 0) {
          localStorage.setItem('jira_active_project', JSON.stringify(list[0]));
          return list[0];
        }
        if (prev) {
          const match = list.find((p) => p._id === prev._id);
          if (match) {
            localStorage.setItem('jira_active_project', JSON.stringify(match));
            return match;
          } else if (list.length > 0) {
            localStorage.setItem('jira_active_project', JSON.stringify(list[0]));
            return list[0];
          }
        }
        return prev;
      });
      return list;
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Coordinated parallel loading of sprints and tickets with instant-switch cache
  const loadProjectData = useCallback(async (projectId, force = false) => {
    if (!projectId) return;

    // 1. If cached data exists and not forced, immediately apply it (0ms instant response)
    const cached = projectCacheRef.current[projectId];
    if (cached && !force) {
      setSprints(cached.sprints);
      setActiveSprint(cached.activeSprint);
      setTickets(cached.tickets);
      setDataLoading(false);
    } else {
      setDataLoading(true);
    }

    try {
      // 2. Fetch both endpoints concurrently in parallel
      const [sprintsRes, ticketsRes] = await Promise.all([
        axiosClient.get(`/sprints?project=${projectId}`),
        axiosClient.get(`/tickets?project=${projectId}`)
      ]);

      const fetchedSprints = sprintsRes.data || [];
      const fetchedTickets = ticketsRes.data || [];
      const currentActive = fetchedSprints.find((s) => s.status === 'Active') || null;

      setSprints(fetchedSprints);
      setActiveSprint(currentActive);
      setTickets(fetchedTickets);

      // 3. Update memory cache
      projectCacheRef.current[projectId] = {
        sprints: fetchedSprints,
        activeSprint: currentActive,
        tickets: fetchedTickets,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error loading project data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Switch active project
  const setActiveProject = useCallback((project) => {
    if (!project) return;
    setActiveProjectState(project);
    localStorage.setItem('jira_active_project', JSON.stringify(project));

    // Immediately display cached project data if available
    const cached = projectCacheRef.current[project._id];
    if (cached) {
      setSprints(cached.sprints);
      setActiveSprint(cached.activeSprint);
      setTickets(cached.tickets);
      setDataLoading(false);
    } else {
      // Clear old tickets to avoid mismatch while loading
      setTickets([]);
      setActiveSprint(null);
      setSprints([]);
      setDataLoading(true);
    }
  }, []);

  // Refresh current active project data from server
  const refreshProjectData = useCallback(async () => {
    if (activeProject?._id) {
      return await loadProjectData(activeProject._id, true);
    }
  }, [activeProject?._id, loadProjectData]);

  // Backward-compatible fetchSprints
  const fetchSprints = useCallback(async (projectId) => {
    const pId = projectId || activeProject?._id;
    if (!pId) return;
    try {
      const res = await axiosClient.get(`/sprints?project=${pId}`);
      const list = res.data || [];
      setSprints(list);
      const currentActive = list.find((s) => s.status === 'Active') || null;
      setActiveSprint(currentActive);
      if (projectCacheRef.current[pId]) {
        projectCacheRef.current[pId].sprints = list;
        projectCacheRef.current[pId].activeSprint = currentActive;
      }
      return list;
    } catch (err) {
      console.error('Error fetching sprints:', err);
    }
  }, [activeProject?._id]);

  // Backward-compatible fetchTickets
  const fetchTickets = useCallback(async (projectId, sprintId) => {
    const pId = projectId || activeProject?._id;
    if (!pId) return;
    try {
      let url = `/tickets?project=${pId}`;
      if (sprintId) {
        url += `&sprint=${sprintId}`;
      }
      const res = await axiosClient.get(url);
      const list = res.data || [];
      if (!sprintId) {
        setTickets(list);
        if (projectCacheRef.current[pId]) {
          projectCacheRef.current[pId].tickets = list;
        }
      }
      return list;
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  }, [activeProject?._id]);

  // Optimistic setter for tickets
  const updateTickets = useCallback((newTickets) => {
    setTickets(newTickets);
    if (activeProject?._id && projectCacheRef.current[activeProject._id]) {
      projectCacheRef.current[activeProject._id].tickets = newTickets;
    }
  }, [activeProject?._id]);

  // Authenticated user hook: only re-runs on login/logout
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProjectState(null);
      setSprints([]);
      setActiveSprint(null);
      setTickets([]);
      projectCacheRef.current = {};
    }
  }, [user, fetchUsers, fetchProjects]);

  // Project change hook: loads project data whenever activeProject._id changes
  useEffect(() => {
    if (activeProject?._id) {
      loadProjectData(activeProject._id);
    }
  }, [activeProject?._id, loadProjectData]);

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
        loading: projectsLoading || dataLoading,
        projectsLoading,
        dataLoading,
        fetchProjects,
        fetchSprints,
        fetchTickets,
        fetchUsers,
        refreshProjectData,
        setTickets: updateTickets
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
