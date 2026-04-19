
// ─── Color palette (matches CSS team-color-* classes) ─────────────────────────
const PALETTES = [
  { cls: 'team-color-0', glow: 'rgba(108,99,255,0.35)',  hex: '#6c63ff' },
  { cls: 'team-color-1', glow: 'rgba(245,158,11,0.35)',  hex: '#f59e0b' },
  { cls: 'team-color-2', glow: 'rgba(34,197,94,0.35)',   hex: '#22c55e' },
  { cls: 'team-color-3', glow: 'rgba(239,68,68,0.35)',   hex: '#ef4444' },
  { cls: 'team-color-4', glow: 'rgba(56,189,248,0.35)',  hex: '#38bdf8' },
  { cls: 'team-color-5', glow: 'rgba(236,72,153,0.35)',  hex: '#ec4899' },
  { cls: 'team-color-6', glow: 'rgba(167,139,250,0.35)', hex: '#a78bfa' },
  { cls: 'team-color-7', glow: 'rgba(251,146,60,0.35)',  hex: '#fb923c' },
];

function getPalette(id) { return PALETTES[(id || 0) % PALETTES.length]; }

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function TeamCard({ team, onClick, style }) {
  const palette  = getPalette(team.id);
  const isAdmin  = team.role === 'admin';

  return (
    <article
      className="card"
      id={`team-card-${team.id}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${team.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      style={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        padding: '1.5rem',
        border: '1px solid var(--border-subtle)',
        transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${palette.hex}40, 0 0 32px ${palette.glow}`;
        e.currentTarget.style.borderColor = `${palette.hex}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      {/* ── Gradient top-right glow blob ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: palette.glow,
          filter: 'blur(40px)', pointerEvents: 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
        <div
          className={`avatar-lg ${palette.cls}`}
          style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em',
            boxShadow: `0 4px 16px ${palette.glow}`,
          }}
        >
          {getInitials(team.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 700, fontSize: '1rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: 'var(--text-primary)', marginBottom: '0.25rem',
          }}>
            {team.name}
          </h3>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.15rem 0.55rem',
            borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
            background: isAdmin ? `${palette.hex}22` : 'rgba(144,144,184,0.1)',
            color: isAdmin ? palette.hex : 'var(--text-secondary)',
            border: `1px solid ${isAdmin ? palette.hex + '40' : 'var(--border-subtle)'}`,
          }}>
            {isAdmin ? '★ Admin' : '· Member'}
          </span>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <p style={{
        fontSize: '0.855rem', lineHeight: 1.65, minHeight: '2.8rem',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        color: 'var(--text-secondary)',
      }}>
        {team.description || 'No description yet. Click to view this team.'}
      </p>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: '1.25rem', paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.75rem',
          background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
          borderRadius: 999, fontSize: '0.8rem', color: 'var(--text-secondary)',
        }}>
          <span>👥</span>
          <span>{team.member_count ?? 1} {(team.member_count ?? 1) === 1 ? 'member' : 'members'}</span>
        </span>

        <span style={{
          fontSize: '0.8rem', fontWeight: 600, color: palette.hex,
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          View <span>→</span>
        </span>
      </div>

      {/* ── Bottom accent bar ────────────────────────────────────────────── */}
      <div
        className={palette.cls}
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, opacity: 0.7 }}
      />
    </article>
  );
}
