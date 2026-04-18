import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatShortDate } from '../data/mockWorkspace.js';

/* ── Stat card ─────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" style={accent ? { color: accent } : {}}>{icon}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ── Animated ring ──────────────────────────────── */
function TaskRing({ completed, total }) {
  const arcRef = useRef(null);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const R   = 68;
  const SW  = 9;
  const r   = R - SW / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.strokeDashoffset = circ;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.strokeDashoffset = offset;
      });
    });
  }, [offset, circ]);

  return (
    <div className="ring-wrap">
      <svg
        className="ring-svg"
        width={R * 2}
        height={R * 2}
        viewBox={`0 0 ${R * 2} ${R * 2}`}
      >
        <defs>
          <linearGradient id="rg" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e11d48" />
            <stop offset="100%" stopColor="#ff5a30" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={R} cy={R} r={r} fill="none"
          stroke="var(--line)" strokeWidth={SW} />

        {/* Arc */}
        <circle
          ref={arcRef}
          cx={R} cy={R} r={r}
          fill="none"
          stroke="url(#rg)"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          transform={`rotate(-90 ${R} ${R})`}
          filter="url(#glow)"
        />
      </svg>

      <div className="ring-centre">
        <strong className="ring-pct">{pct}%</strong>
        <span className="ring-sub">done</span>
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────── */
export default function Dashboard({ teams, workspace, stats }) {
  const topProjects    = workspace.projects.slice(0, 4);
  const completedTasks = workspace.tasks.filter((t) => t.status === 'Done').length;
  const totalTasks     = workspace.tasks.length;

  return (
    <section className="page-stack">

      {/* ── Row 1: KPI stat cards ── */}
      <div className="stats-row">
        <StatCard label="Active Teams"        value={stats.teamCount}          icon="◌" />
        <StatCard label="Total Members"       value={stats.memberCount}        icon="◍" />
        <StatCard label="Projects in Flight"  value={stats.inProgressProjects} icon="▣" />
        <StatCard label="Open Tasks"          value={stats.pendingTasks}       icon="☑" />
      </div>

      {/* ── Row 2: Tasks ring  +  Teams + Deadlines ── */}
      <div className="dash-top-grid">

        {/* Left: Teams + Upcoming Deadlines stacked */}
        <div className="dash-left">

          {/* Teams */}
          <article className="glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Teams</span>
                <h3>Your teams</h3>
              </div>
              <Link to="/teams" className="text-action">View all →</Link>
            </div>
            <div className="team-card-grid">
              {teams.map((team) => (
                <Link key={team.id} to={`/teams/${team.id}`} className="team-overview-card">
                  <div className="team-avatar">{team.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{team.name}</strong>
                    <span>{team.member_count || 0} members</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          {/* Upcoming deadlines */}
          <article className="glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Projects</span>
                <h3>Upcoming deadlines</h3>
              </div>
              <Link to="/projects" className="text-action">Manage →</Link>
            </div>
            <div className="project-deadline-list">
              {topProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="deadline-row">
                  <div className="deadline-icon">{project.name.slice(0, 1)}</div>
                  <div className="deadline-copy">
                    <strong>{project.name}</strong>
                    <span>Due {formatShortDate(project.deadline)}</span>
                  </div>
                  <div className="deadline-progress">
                    <span>{project.progress}%</span>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </div>

        {/* Right: Task completion ring */}
        <article className="glass-card task-ring-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Tasks</span>
              <h3>Completion rate</h3>
            </div>
            <Link to="/tasks" className="text-action">View all →</Link>
          </div>

          <TaskRing completed={completedTasks} total={totalTasks} />

          <div className="ring-legend">
            <div className="ring-legend-item">
              <span className="ring-dot ring-dot--done" />
              <div>
                <strong>{completedTasks}</strong>
                <span>Completed</span>
              </div>
            </div>
            <div className="ring-legend-sep" />
            <div className="ring-legend-item">
              <span className="ring-dot ring-dot--left" />
              <div>
                <strong>{totalTasks - completedTasks}</strong>
                <span>Remaining</span>
              </div>
            </div>
          </div>

          {/* Mini breakdown by status */}
          <div className="ring-breakdown">
            {['To Do', 'In Progress', 'Done'].map((status) => {
              const count = workspace.tasks.filter((t) => t.status === status).length;
              const statusPct = totalTasks ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={status} className="ring-breakdown-row">
                  <span className={`breakdown-dot breakdown-dot--${status.toLowerCase().replace(' ', '-')}`} />
                  <span className="breakdown-label">{status}</span>
                  <div className="breakdown-track">
                    <div className="breakdown-fill" style={{ width: `${statusPct}%` }} />
                  </div>
                  <span className="breakdown-count">{count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </div>

    </section>
  );
}
