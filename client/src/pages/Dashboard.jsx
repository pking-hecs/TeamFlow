import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatShortDate } from '../data/mockWorkspace.js';
import { getStoredLogo } from '../utils/logoStorage.js';

/* ── Stat card ─────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card">
      <strong className="stat-value">{value}</strong>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ── Animated ring ──────────────────────────────── */
function TaskRing({ completed, total }) {
  const arcRef = useRef(null);
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const R   = 112;
  const SW  = 14;
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


        {/* Track */}
        <circle cx={R} cy={R} r={r} fill="none"
          stroke="var(--line)" strokeWidth={SW} />

        {/* Arc */}
        <circle
          ref={arcRef}
          cx={R} cy={R} r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          transform={`rotate(-90 ${R} ${R})`}
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
  const topProjects = workspace.projects.slice(0, 4);
  const completedTasks = workspace.tasks.filter((t) => t.status === 'Done').length;
  const totalTasks = workspace.tasks.length;

  return (
    <section className="page-stack">

      <div className="dash-top-grid">
        <div className="dash-left">
          <div className="stats-row stats-row--stacked">
            <StatCard label="Active Teams"        value={stats.teamCount}          icon="◌" />
            <StatCard label="Total Members"       value={stats.memberCount}        icon="◍" />
            <StatCard label="Projects in Flight"  value={stats.inProgressProjects} icon="▣" />
            <StatCard label="Open Tasks"          value={stats.pendingTasks}       icon="☑" />
          </div>

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
                  <div className="team-avatar">
                    {getStoredLogo('team', team.id) ? <img src={getStoredLogo('team', team.id)} alt={`${team.name} logo`} /> : team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{team.name}</strong>
                    <span>{team.member_count || 0} members</span>
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

      <article className="glass-card project-group-full">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Projects</span>
            <h3>Upcoming deadlines</h3>
          </div>
          <Link to="/projects" className="text-action">Manage →</Link>
        </div>
        <div className="project-deadline-list project-deadline-list--wide">
          {topProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="deadline-row">
              <div className="deadline-icon">
                {getStoredLogo('project', project.id) ? <img src={getStoredLogo('project', project.id)} alt={`${project.name} logo`} /> : project.name.slice(0, 1)}
              </div>
              <div className="deadline-copy">
                <strong>{project.name}</strong>
                <span>{project.deadline ? `Due ${formatShortDate(project.deadline)}` : 'No deadline'}</span>
              </div>
            </Link>
          ))}
          {!topProjects.length ? <p>No projects yet.</p> : null}
        </div>
      </article>

    </section>
  );
}
