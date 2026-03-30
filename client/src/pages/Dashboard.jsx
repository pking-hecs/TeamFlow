import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchTeams,
  selectTeams,
  selectTeamsLoading,
  selectTeamsError,
  clearActionError,
} from '../store/teamsSlice.js';

// ─── Dummy Data for Design ────────────────────────────────────────────────────
const DEADLINES = [
  { id: 1, project: 'Project Nova',     due: '2 Days Left',    urgent: true  },
  { id: 2, project: 'Phoenix Review',   due: '5 Days Left',    urgent: false },
  { id: 3, project: 'Team Meeting',     due: 'Tomorrow 10 AM', urgent: false },
  { id: 4, project: 'Design System',    due: 'Next Week',      urgent: false },
];
const MOCK_TASKS = [
  { id: 1, title: 'Design System v2.1',   team: 'Frontend Squad', color: '#6c63ff', done: false },
  { id: 2, title: 'API Integration',      team: 'Backend Team',   color: '#f59e0b', done: false },
  { id: 3, title: 'Marketing Assets',     team: 'Design & QA',    color: '#ec4899', done: true  },
  { id: 4, title: 'Setup DB Schema',      team: 'Backend Team',   color: '#22c55e', done: true  },
];
const MEMBERS_ONLINE = [
  { id: 1, name: 'Alice M.',   color: '#6c63ff', role: 'Frontend' },
  { id: 2, name: 'Ben L.',     color: '#f59e0b', role: 'Backend'  },
  { id: 3, name: 'Chloe P.',   color: '#ec4899', role: 'Design'   },
];
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
function Avatar({ name, color, size = 32 }) {
  const init = name?.slice(0, 2).toUpperCase() || 'U';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color || '#6c63ff',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 'bold', position: 'relative', flexShrink: 0
    }}>
      {init}
      <div style={{
        position: 'absolute', bottom: -2, right: -2, width: 10, height: 10,
        background: '#22c55e', border: '2px solid var(--bg-card)', borderRadius: '50%'
      }} />
    </div>
  );
}
// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const teams    = useSelector(selectTeams);
  const loading  = useSelector(selectTeamsLoading);
  const error    = useSelector(selectTeamsError);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  useEffect(() => { dispatch(fetchTeams()); }, [dispatch]);
  const totalMembers = teams.reduce((sum, t) => sum + (t.member_count || 0), 0);
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: '1600px' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1>
              <span style={{
                background: 'linear-gradient(135deg, #f0f0ff 30%, #6c63ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {getGreeting()}! 👋
              </span>
            </h1>
            <p style={{ marginTop: '0.35rem', fontSize: '1rem' }}>
              Here's an overview of your teams and tasks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/teams')}>+ Team</button>
            <button className="btn btn-primary btn-lg">+ Create Task</button>
          </div>
        </div>
        {!loading && !error && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-light)' }}>{teams.length}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Teams</span>
            </div>
            <div style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{tasks.filter(t => !t.done).length}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Tasks</span>
            </div>
            <div style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{totalMembers}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Members</span>
            </div>
            <div style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem',
              display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--info)' }}>4</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Updates Today</span>
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', gridColumn: '1 / -2' }}>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Active Tasks</h2>
                <button className="btn btn-ghost btn-sm">Filter ▾</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map((t) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)', transition: 'all 150ms ease'
                  }}>
                    <button onClick={() => toggleTask(t.id)} style={{
                      width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                      border: `2px solid ${t.done ? '#22c55e' : 'var(--text-muted)'}`,
                      background: t.done ? '#22c55e' : 'transparent', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', cursor: 'pointer', transition: 'all 150ms ease',
                    }}>
                      {t.done ? '✓' : ''}
                    </button>
                    <div style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</span>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.15rem', color: 'var(--text-muted)' }}><span style={{ color: t.color }}>●</span> {t.team}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '320px' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Upcoming Deadlines</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {DEADLINES.map((d) => (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)',
                    borderLeft: `4px solid ${d.urgent ? 'var(--danger)' : 'var(--accent)'}`
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.project}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.urgent ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {d.due}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Team Members</h2>
                <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>{MEMBERS_ONLINE.length} Online</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MEMBERS_ONLINE.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <Avatar name={m.name} color={m.color} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card-hover)', borderStyle: 'dashed' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workspace Settings</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Manage your notifications, profile, and security preferences.</p>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Open Settings →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
