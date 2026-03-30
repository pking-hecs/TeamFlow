import React from 'react';
const COLORS = ['team-color-0','team-color-1','team-color-2','team-color-3',
                'team-color-4','team-color-5','team-color-6','team-color-7'];
function getColorClass(id) { return COLORS[(id || 0) % COLORS.length]; }
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
export default function TeamCard({ team, onClick, style }) {
  const colorClass = getColorClass(team.id);
  const isAdmin    = team.role === 'admin';
  return (
    <article
      className="card"
      id={`team-card-${team.id}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${team.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', ...style }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
        <div
          className={`avatar avatar-lg ${colorClass}`}
          style={{ color: '#fff', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
        >
          {getInitials(team.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {team.name}
          </h3>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`} style={{ marginTop: '0.2rem' }}>
            {isAdmin ? '★ Admin' : '· Member'}
          </span>
        </div>
      </div>
      <p style={{
        fontSize: '0.875rem', lineHeight: 1.65, minHeight: '2.8rem',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {team.description || 'No description yet.'}
      </p>
      <div className="flex items-center gap-2" style={{ marginTop: '1.25rem' }}>
        <span className="stat-pill">
          <span>👥</span>
          <span>{team.member_count ?? 1} {(team.member_count ?? 1) === 1 ? 'member' : 'members'}</span>
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>View →</span>
      </div>
      <div
        className={colorClass}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', opacity: 0.6 }}
        aria-hidden="true"
      />
    </article>
  );
}
