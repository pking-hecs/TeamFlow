import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Dashboard from './pages/Dashboard.jsx';
import TeamsPage from './pages/Teams.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
import ProjectPage from './pages/Project.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import {
  buildWorkspaceData,
  getProfileSummary,
  getWorkspaceStats,
  selectPrimaryTeamId,
} from './data/mockWorkspace.js';
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
              {(profile.name || profile.username || 'U').slice(0, 1).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className="nav-profile-dropdown">
                <div className="nav-profile-info">
                  <strong>{profile.name || profile.username}</strong>
                  <span>{profile.title || 'User'}</span>
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
      <div className="topbar-actions">
        <div className="search-shell">
          <span>⌕</span>
          <input type="search" placeholder="Search teams, tasks, or projects" />
        </div>
      </div>
    </section>
  );
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
  const workspace = useMemo(() => buildWorkspaceData(teams), [teams]);
  const stats = useMemo(() => getWorkspaceStats(teams, workspace), [teams, workspace]);
  const profile = useMemo(() => getProfileSummary(teams, workspace), [teams, workspace]);
  const [theme, setTheme] = useState(() => localStorage.getItem('dbs-theme') || 'light');
  
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dbs-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');

  const userProfile = { ...profile, ...user };

  return (
    <div className="app-frame">
      <Navbar theme={theme} onToggleTheme={toggleTheme} profile={userProfile} />
      <main className="app-main">
        <div className="app-surface">
          {location.pathname === '/dashboard' ? <Topbar stats={stats} /> : null}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard teams={teams} workspace={workspace} stats={stats} />} />
            <Route path="/teams" element={<TeamsPage teams={teams} workspace={workspace} />} />
            <Route path="/teams/:id" element={<TeamDetail teams={teams} workspace={workspace} mode="detail" />} />
            <Route path="/teams/:id/settings" element={<TeamDetail teams={teams} workspace={workspace} mode="settings" />} />
            <Route path="/projects" element={<ProjectPage teams={teams} workspace={workspace} view="projects" />} />
            <Route path="/projects/new" element={<ProjectPage teams={teams} workspace={workspace} view="create-project" />} />
            <Route path="/projects/:projectId" element={<ProjectPage teams={teams} workspace={workspace} view="project-detail" />} />
            <Route path="/tasks" element={<ProjectPage teams={teams} workspace={workspace} view="tasks" />} />
            <Route path="/tasks/:taskId" element={<ProjectPage teams={teams} workspace={workspace} view="task-detail" />} />
            <Route path="/kanban" element={<ProjectPage teams={teams} workspace={workspace} view="kanban" />} />
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
