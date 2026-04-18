import React from 'react';
import { Link } from 'react-router-dom';
import { formatShortDate } from '../data/mockWorkspace.js';

function StatBubble({ label, value, tone }) {
  return (
    <div className={`metric-bubble tone-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Dashboard({ teams, workspace, stats }) {
  const topProjects = workspace.projects.slice(0, 3);
  const trainingDays = [1, 5, 9, 14, 18, 23, 29];

  return (
    <section className="page-stack">
      <div className="dashboard-grid">
        <article className="feature-panel warm-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h2>Your team workspace results for today</h2>
            </div>
            <div className="tiny-badge">Live</div>
          </div>

          <div className="bubble-board">
            <StatBubble label="Teams" value={stats.teamCount} tone="gold" />
            <StatBubble label="Members" value={stats.memberCount} tone="coral" />
            <StatBubble label="Projects" value={stats.inProgressProjects} tone="ink" />
          </div>

          <div className="legend-row">
            <span><i className="tone-gold" /> Team cards</span>
            <span><i className="tone-coral" /> Active members</span>
            <span><i className="tone-ink" /> Delivery focus</span>
          </div>
        </article>

        <article className="feature-panel dark-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Schedule</span>
              <h2>Training days</h2>
            </div>
            <span className="tiny-badge">June</span>
          </div>

          <div className="calendar-grid">
            {Array.from({ length: 30 }, (_, index) => {
              const day = index + 1;
              const active = trainingDays.includes(day);
              return (
                <span key={day} className={`calendar-day${active ? ' active' : ''}`}>{day}</span>
              );
            })}
          </div>

          <div className="calendar-legend">
            <span><i className="legend-dot current" /> Current</span>
            <span><i className="legend-dot done" /> Done</span>
            <span><i className="legend-dot scheduled" /> Scheduled</span>
          </div>
        </article>
      </div>

      <div className="content-grid main-layout">
        <div className="stack">
          <article className="glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Teams</span>
                <h3>Dashboard team cards</h3>
              </div>
              <Link to="/teams" className="text-action">View all</Link>
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

          <div className="content-grid split-cards">
            <article className="glass-card">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">Progress</span>
                  <h3>Steps for today</h3>
                </div>
                <strong>8,500</strong>
              </div>
              <p className="subtle-copy">Keep your delivery streak moving by closing one project action and one task review.</p>
              <div className="progress-ring">
                <div className="ring-center">
                  <strong>68%</strong>
                  <span>Completed</span>
                </div>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">Plan</span>
                  <h3>Weight loss plan</h3>
                </div>
                <strong>68%</strong>
              </div>
              <div className="range-strip">
                <span>56 kg</span>
                <div><i /></div>
                <span>50 kg</span>
              </div>
            </article>
          </div>
        </div>

        <article className="glass-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Projects</span>
              <h3>Projects with deadlines</h3>
            </div>
            <Link to="/projects" className="text-action">Manage</Link>
          </div>
          <div className="habit-list">
            {topProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="habit-row">
                <div className="habit-icon">{project.name.slice(0, 1)}</div>
                <div className="habit-copy">
                  <strong>{project.name}</strong>
                  <span>Deadline {formatShortDate(project.deadline)}</span>
                </div>
                <div className="habit-meta">
                  <span>{project.progress}%</span>
                  <div className="mini-bars">
                    {Array.from({ length: 8 }, (_, index) => (
                      <i key={index} className={index < Math.round(project.progress / 13) ? 'filled' : ''} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
