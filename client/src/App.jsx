import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Dashboard from './pages/Dashboard.jsx';
import TeamsPage from './pages/Teams.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
import ProjectPage from './pages/Project.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import { projectsApi, tasksApi } from './services/api.js';
import { selectTeams, fetchTeams } from './store/teamsSlice.js';
import { fetchMe, logout } from './store/authSlice.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/teams',     label: 'Teams' },
  { to: '/projects',  label: 'Projects' },
  { to: '/tasks',     label: 'Tasks' },
  { to: '/kanban',    label: 'Kanban' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="ghost-block theme-toggle-btn" onClick={onToggle} aria-label="Toggle light and dark mode">
      {theme === 'light' ? '☾ Dark Mode' : '☀ Light Mode'}
    </button>
  );
}

function Navbar({ theme, onToggleTheme, profile }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <NavLink to="/dashboard" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <strong>TeamFlow</strong>
        </NavLink>
      </div>

      <nav className="topnav-links middle-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            <span className="topnav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="topnav-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        {profile && (
          <div className="nav-profile-container">
            <button 
              className="user-avatar-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {(profile.username || profile.name || 'U').slice(0, 1).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className="nav-profile-dropdown">
                <div className="nav-profile-info">
                  <strong>{profile.username || profile.name}</strong>
                </div>
                <div className="dropdown-divider"></div>
                <button className="ghost-block nav-logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Topbar({ stats }) {
  return (
    <section className="topbar">
      <div>
        <h1>Workspace Overview</h1>
        <p>Teams, projects, and delivery activity at a glance.</p>
      </div>
    </section>
  );
}

function getWorkspaceStats(teams, workspace) {
  return {
    teamCount: teams.length,
    pendingTasks: workspace.tasks.filter((task) => task.status !== 'Done').length,
    inProgressProjects: workspace.projects.filter((project) => project.progress < 100).length,
    memberCount: teams.reduce((sum, team) => sum + (team.member_count || 0), 0),
  };
}

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function Shell() {
  const location = useLocation();
  const dispatch = useDispatch();
  const teams = useSelector(selectTeams) || [];
  const { user, isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const [theme, setTheme] = useState(() => localStorage.getItem('dbs-theme') || 'light');
  const [dashboardWorkspace, setDashboardWorkspace] = useState({ projects: [], tasks: [] });
  const [dashboardStats, setDashboardStats] = useState({
    teamCount: 0,
    pendingTasks: 0,
    inProgressProjects: 0,
    memberCount: 0,
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    dispatch(fetchTeams());
  }, [dispatch, authLoading, isAuthenticated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dbs-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;

    const loadDashboardData = async () => {
      if (!teams.length) {
        if (!active) return;
        setDashboardWorkspace({ projects: [], tasks: [] });
        setDashboardStats({
          teamCount: 0,
          pendingTasks: 0,
          inProgressProjects: 0,
          memberCount: 0,
        });
        return;
      }

      try {
        const projectGroups = await Promise.all(
          teams.map((team) => projectsApi.getAll(team.id).then((res) => res.data))
        );
        const projects = projectGroups.flat();

        const taskGroups = await Promise.all(
          projects.map((project) => tasksApi.getAll({ projectId: project.id }).then((res) => res.data))
        );
        const tasks = taskGroups.flat();

        const progressByProjectId = tasks.reduce((acc, task) => {
          const key = String(task.project_id);
          if (!acc[key]) {
            acc[key] = { total: 0, done: 0 };
          }
          acc[key].total += 1;
          if (task.status === 'Done') {
            acc[key].done += 1;
          }
          return acc;
        }, {});

        const normalizedProjects = projects.map((project) => {
          const progress = progressByProjectId[String(project.id)] || { total: 0, done: 0 };
          const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

          return {
            ...project,
            teamId: project.team_id,
            progress: percent,
          };
        });

        const normalizedTasks = tasks.map((task) => ({
          ...task,
          projectId: task.project_id,
          teamId: task.team_id,
          assignee: task.assignee_name || 'Unassigned',
          comments: [],
        }));

        if (!active) return;

        const workspace = {
          projects: normalizedProjects,
          tasks: normalizedTasks,
        };

        setDashboardWorkspace(workspace);
        setDashboardStats(getWorkspaceStats(teams, workspace));
      } catch (_error) {
        if (!active) return;
        const emptyWorkspace = { projects: [], tasks: [] };
        setDashboardWorkspace(emptyWorkspace);
        setDashboardStats(getWorkspaceStats(teams, emptyWorkspace));
      }
    };

    loadDashboardData();

    return () => {
      active = false;
    };
  }, [teams, authLoading, isAuthenticated]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');

  const userProfile = user || null;

  return (
    <div className="app-frame">
      <Navbar theme={theme} onToggleTheme={toggleTheme} profile={userProfile} />
      <main className="app-main">
        <div className="app-surface">
          {location.pathname === '/dashboard' ? <Topbar stats={dashboardStats} /> : null}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard teams={teams} workspace={dashboardWorkspace} stats={dashboardStats} />} />
            <Route path="/teams" element={<TeamsPage teams={teams} workspace={dashboardWorkspace} />} />
            <Route path="/teams/:id" element={<TeamDetail teams={teams} workspace={dashboardWorkspace} mode="detail" />} />
            <Route path="/teams/:id/settings" element={<TeamDetail teams={teams} workspace={dashboardWorkspace} mode="settings" />} />
            <Route path="/projects" element={<ProjectPage teams={teams} view="projects" />} />
            <Route path="/projects/new" element={<ProjectPage teams={teams} view="create-project" />} />
            <Route path="/projects/:projectId" element={<ProjectPage teams={teams} view="project-detail" />} />
            <Route path="/tasks" element={<ProjectPage teams={teams} view="tasks" />} />
            <Route path="/tasks/:taskId" element={<ProjectPage teams={teams} view="task-detail" />} />
            <Route path="/kanban" element={<ProjectPage teams={teams} view="kanban" />} />
            <Route path="*" element={<Navigate to={`/dashboard`} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <PrivateRoute>
            <Shell />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
