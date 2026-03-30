import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTeams, fetchTeam, selectCurrentTeam, selectTeamsLoading } from '../store/teamsSlice.js';
// ─── Dummy Tasks Data ─────────────────────────────────────────────────────────
const MOCK_TASKS = {
  todo: [
    { id: 1, title: 'Design System v2', priority: 'High', due: 'Tomorrow', assignee: 'Alex', color: '#6c63ff' },
    { id: 2, title: 'API Integration', priority: 'Medium', due: 'In 3 days', assignee: 'Ben', color: '#f59e0b' },
  ],
  inProgress: [
    { id: 3, title: 'User Authentication', priority: 'High', due: 'Today', assignee: 'Chloe', color: '#ec4899' },
  ],
  done: [
    { id: 4, title: 'Database Schema', priority: 'Low', due: 'Completed', assignee: 'Alex', color: '#6c63ff' },
    { id: 5, title: 'Initial Scaffold', priority: 'Medium', due: 'Completed', assignee: 'Ben', color: '#f59e0b' },
  ],
};
function Avatar({ name, color, size = 28 }) {
  const init = name?.slice(0, 2).toUpperCase() || 'U';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color || '#6c63ff',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 'bold'
    }} title={name}>
      {init}
    </div>
  );
}
function TaskCard({ task }) {
  return (
    <div style={{
      background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)', marginBottom: '0.75rem', cursor: 'grab'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{task.title}</h4>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>···</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700,
            background: task.priority === 'High' ? 'rgba(239,68,68,0.15)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
            color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
          }}>{task.priority}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            📅 {task.due}
          </span>
        </div>
        <Avatar name={task.assignee} color={task.color} size={24} />
      </div>
    </div>
  );
}
export default function TeamDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const allTeams  = useSelector(selectTeams);
  const loading   = useSelector(selectTeamsLoading);
  const teamRedux = useSelector(selectCurrentTeam);
  // Fallback to searching allTeams if currentTeam isn't loaded yet (for design purposes)
  const team = teamRedux?.id === Number(id) ? teamRedux : allTeams.find(t => t.id === Number(id)) || allTeams[0];
  const [activeTab, setActiveTab] = useState('tasks');
  useEffect(() => {
    if (!teamRedux && id) {
      // In real app: dispatch(fetchTeam(id))
      // For design demo, we'll just rely on the fallback above
    }
  }, [id, teamRedux]);
  if (loading || !team) return <div className="page"><div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div></div>;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks',    label: 'Tasks Board' },
    { id: 'members',  label: 'Members' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div className="page">
      <div className="page-content" style={{ maxWidth: '1400px', padding: '0 1.5rem 2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => navigate('/teams')}>
            <span>←</span><span>Back to Teams</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #6c63ff, #4a44cc)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800
              }}>
                {team.name.slice(0,1)}
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{team.name}</h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{team.description || 'Collaborative workspace.'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost">Invite Members</button>
              <button className="btn btn-primary">Create Task</button>
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem'
        }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 150ms ease', position: 'relative', top: '1px'
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Project Stats</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>12</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tasks</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>8</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Upcoming Deadlines</h3>
              <div style={{ fontSize: '0.85rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                <span>User Auth Module</span><span style={{ color: 'var(--danger)' }}>Today</span>
              </div>
              <div style={{ fontSize: '0.85rem', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Design System v2</span><span style={{ color: 'var(--warning)' }}>Tomorrow</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Do ({MOCK_TASKS.todo.length})</span>
                <button className="btn btn-ghost btn-icon" style={{ padding: '0.2rem' }}>+</button>
              </div>
              {MOCK_TASKS.todo.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
            <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress ({MOCK_TASKS.inProgress.length})</span>
                <button className="btn btn-ghost btn-icon" style={{ padding: '0.2rem' }}>+</button>
              </div>
              {MOCK_TASKS.inProgress.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
            <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done ({MOCK_TASKS.done.length})</span>
                <button className="btn btn-ghost btn-icon" style={{ padding: '0.2rem' }}>+</button>
              </div>
              {MOCK_TASKS.done.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>
        )}
        {activeTab === 'members' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Team Members</h3>
              <div className="search-bar" style={{ width: '240px' }}><span className="search-icon">🔍</span><input type="text" placeholder="Search members..." /></div>
            </div>
            {team.members?.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <Avatar name={m.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.email}</div>
                </div>
                <span className={`badge ${m.role==='admin' ? 'badge-admin' : 'badge-member'}`}>{m.role === 'admin' ? '★ Admin' : 'Member'}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Team Settings</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Team Name</label>
              <input type="text" className="form-input" defaultValue={team.name} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" defaultValue={team.description} rows={3} style={{ resize: 'vertical' }}></textarea>
            </div>
            <button className="btn btn-primary">Save Changes</button>
            <hr className="divider" style={{ margin: '2rem 0' }} />
            <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Danger Zone</h4>
            <div style={{ padding: '1rem', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Delete this team</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Once deleted, all data is permanently removed.</div>
              </div>
              <button className="btn btn-danger">Delete Team</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
