import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Dashboard from './pages/Dashboard.jsx';
import TeamsPage from './pages/Teams.jsx';
import TeamDetail from './pages/TeamDetail.jsx';
import ProjectPage from './pages/Project.jsx';
import {
  buildWorkspaceData,
  getProfileSummary,
  getWorkspaceStats,
  selectPrimaryTeamId,
} from './data/mockWorkspace.js';
import { selectTeams } from './store/teamsSlice.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '◫' },
  { to: '/teams',     label: 'Teams',     icon: '◌' },
  { to: '/projects',  label: 'Projects',  icon: '▣' },
  { to: '/tasks',     label: 'Tasks',     icon: '☑' },
  { to: '/kanban',    label: 'Kanban',    icon: '⋮' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle light and dark mode">
      <span className={theme === 'light' ? 'active' : ''}>Light</span>
      <span className={theme === 'dark' ? 'active' : ''}>Dark</span>
    </button>
  );
}

function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="top-navbar">
      <div className="brand-lockup">
        <div className="brand-mark">B</div>
        <div>
          <strong>Be.Run</strong>
          <p>Workspace OS</p>
        </div>
      </div>

      <nav className="topnav-links" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `topnav-link${isActive ? ' active' : ''}`}
          >
            <span className="topnav-icon">{item.icon}</span>
            <span className="topnav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="topnav-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button className="ghost-block">Logout</button>
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

function ProfilePage({ profile }) {
  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <span className="eyebrow">User profile</span>
          <h2>{profile.name}</h2>
          <p>{profile.title}</p>
        </div>
        <div className="profile-chip">
          <strong>{profile.focusHours}</strong>
          <span>focus hours this week</span>
        </div>
      </div>

      <div className="content-grid two-up">
        <article className="glass-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Overview</span>
              <h3>Personal details</h3>
            </div>
          </div>
          <div className="detail-list">
            <div><span>Email</span><strong>{profile.email}</strong></div>
            <div><span>Role</span><strong>{profile.title}</strong></div>
            <div><span>Timezone</span><strong>{profile.timezone}</strong></div>
            <div><span>Primary team</span><strong>{profile.primaryTeam}</strong></div>
          </div>
        </article>

        <article className="glass-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Preferences</span>
              <h3>Work preferences</h3>
            </div>
          </div>
          <div className="pill-grid">
            {profile.preferences.map((item) => (
              <span key={item} className="soft-pill">{item}</span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function AccountPage() {
  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account settings</span>
          <h2>Security and notifications</h2>
        </div>
      </div>

      <div className="content-grid two-up">
        <article className="glass-card">
          <h3>Notifications</h3>
          <div className="settings-list">
            <label><input type="checkbox" defaultChecked /> Daily project summary</label>
            <label><input type="checkbox" defaultChecked /> Comments on assigned tasks</label>
            <label><input type="checkbox" /> Weekly digest email</label>
          </div>
        </article>

        <article className="glass-card">
          <h3>Security</h3>
          <div className="settings-list">
            <label><input type="checkbox" defaultChecked /> Two-factor authentication</label>
            <label><input type="checkbox" defaultChecked /> Session alerts</label>
            <button className="primary-button" style={{ marginTop: '0.5rem' }}>Update password</button>
          </div>
        </article>
      </div>
    </section>
  );
}

function Shell() {
  const teams = useSelector(selectTeams);
  const workspace = useMemo(() => buildWorkspaceData(teams), [teams]);
  const stats = useMemo(() => getWorkspaceStats(teams, workspace), [teams, workspace]);
  const profile = useMemo(() => getProfileSummary(teams, workspace), [teams, workspace]);
  const [theme, setTheme] = useState(() => localStorage.getItem('dbs-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dbs-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');
  const primaryTeamId = selectPrimaryTeamId(teams);

  return (
    <div className="app-frame">
      <main className="app-main">
        <div className="app-surface">
          <Navbar theme={theme} onToggleTheme={toggleTheme} />
          <Topbar stats={stats} />

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
            <Route path="/profile" element={<ProfilePage profile={profile} />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to={`/teams/${primaryTeamId}`} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
