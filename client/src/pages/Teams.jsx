import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TeamCard from '../components/TeamCard.jsx';
import {
  fetchTeams, fetchTeam, createTeam, updateTeam, deleteTeam,
  addTeamMember, updateTeamMember, removeTeamMember,
  clearActionError, clearCurrentTeam,
  selectTeams, selectCurrentTeam, selectTeamsLoading,
  selectActionLoading, selectTeamsError, selectActionError,
} from '../store/teamsSlice.js';
// ─── Helpers ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#6c63ff','#f59e0b','#22c55e','#ef4444','#38bdf8','#ec4899','#a78bfa','#fb923c'];
const getAvatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
};
function CloseBtn({ onClick, id }) {
  return (
    <button id={id} className="btn btn-ghost btn-icon" onClick={onClick}
      style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
  );
}
// ─── Create Team Modal ────────────────────────────────────────────────────────
function CreateTeamModal({ onClose }) {
  const dispatch    = useDispatch();
  const isLoading   = useSelector(selectActionLoading);
  const actionError = useSelector(selectActionError);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await dispatch(createTeam({ name: name.trim(), description: desc.trim() }));
    if (!result.error) onClose();
  };
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" id="create-team-title">Create New Team</h2>
          <CloseBtn onClick={onClose} id="create-team-close" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <div className="form-group">
              <label htmlFor="team-name-input" className="form-label">
                Team Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input id="team-name-input" className="form-input" type="text"
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Frontend Squad" maxLength={100} required autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="team-desc-input" className="form-label">Description</label>
              <textarea id="team-desc-input" className="form-input"
                value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="What does this team work on?" rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="create-team-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" id="create-team-submit"
              disabled={isLoading || !name.trim()}>
              {isLoading ? <><div className="spinner" /> Creating…</> : '✦ Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Invite Member Modal ──────────────────────────────────────────────────────
function InviteModal({ teamId, onClose }) {
  const dispatch    = useDispatch();
  const isLoading   = useSelector(selectActionLoading);
  const actionError = useSelector(selectActionError);
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('member');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const result = await dispatch(addTeamMember({ teamId, email: email.trim(), role }));
    if (!result.error) onClose();
  };
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Invite a Member</h2>
          <CloseBtn onClick={onClose} id="invite-close" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <div className="form-group">
              <label htmlFor="invite-email" className="form-label">
                Email address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input id="invite-email" className="form-input" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com" required autoFocus />
              <span className="form-hint">They must already have an account.</span>
            </div>
            <div className="form-group">
              <label htmlFor="invite-role" className="form-label">Role</label>
              <select id="invite-role" className="form-input form-select"
                value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="member">Member — can view and create tasks</option>
                <option value="admin">Admin — full control including invites</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="invite-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" id="invite-submit"
              disabled={isLoading || !email.trim()}>
              {isLoading ? <><div className="spinner" /> Inviting…</> : '✉ Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Edit Team Modal ──────────────────────────────────────────────────────────
function EditTeamModal({ team, onClose }) {
  const dispatch    = useDispatch();
  const isLoading   = useSelector(selectActionLoading);
  const actionError = useSelector(selectActionError);
  const [name, setName] = useState(team.name);
  const [desc, setDesc] = useState(team.description || '');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateTeam({ id: team.id, data: { name: name.trim(), description: desc.trim() } }));
    if (!result.error) onClose();
  };
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Team</h2>
          <CloseBtn onClick={onClose} id="edit-team-close" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <div className="form-group">
              <label htmlFor="edit-team-name" className="form-label">Team Name</label>
              <input id="edit-team-name" className="form-input" type="text"
                value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-team-desc" className="form-label">Description</label>
              <textarea id="edit-team-desc" className="form-input"
                value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="edit-team-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" id="edit-team-submit" disabled={isLoading}>
              {isLoading ? <><div className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ team, onClose }) {
  const dispatch  = useDispatch();
  const isLoading = useSelector(selectActionLoading);
  const handleDelete = async () => {
    const result = await dispatch(deleteTeam(team.id));
    if (!result.error) onClose();
  };
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Delete Team</h2>
          <CloseBtn onClick={onClose} id="delete-team-close" />
        </div>
        <div className="modal-body">
          <p style={{ lineHeight: 1.7 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{team.name}</strong>?
            This cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} id="delete-team-cancel">Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} id="delete-team-confirm" disabled={isLoading}>
            {isLoading ? <><div className="spinner" /> Deleting…</> : '🗑 Delete Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ member, isMe, isCurrentUserAdmin, teamId }) {
  const dispatch  = useDispatch();
  const isLoading = useSelector(selectActionLoading);
  const [confirm, setConfirm] = useState(false);
  const handleRoleChange = (e) => {
    dispatch(updateTeamMember({ teamId, userId: member.id, role: e.target.value }));
  };
  const handleRemove = async () => {
    if (!confirm) { setConfirm(true); return; }
    dispatch(removeTeamMember({ teamId, userId: member.id }));
  };
  return (
    <div className="member-item" id={`member-row-${member.id}`}>
      <div className="avatar" style={{ background: getAvatarColor(member.id), color: '#fff' }}>
        {getInitials(member.name)}
      </div>
      <div className="member-info">
        <div className="member-name">
          {member.name}
          {isMe && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: '0.4rem' }}>(you)</span>}
        </div>
        <div className="member-email">{member.email}</div>
      </div>
      {isCurrentUserAdmin && !isMe ? (
        <select id={`member-role-${member.id}`}
          className="form-input form-select" value={member.role} onChange={handleRoleChange}
          disabled={isLoading}
          style={{ width: 'auto', padding: '0.3rem 2rem 0.3rem 0.625rem', fontSize: '0.8rem' }}>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      ) : (
        <span className={`badge ${member.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
          {member.role === 'admin' ? '★ Admin' : '· Member'}
        </span>
      )}
      {(isCurrentUserAdmin && !isMe) && (
        <button id={`member-remove-${member.id}`}
          className={`btn btn-sm ${confirm ? 'btn-danger' : 'btn-ghost'}`}
          onClick={handleRemove} onBlur={() => setConfirm(false)}
          disabled={isLoading} title={confirm ? 'Click again to confirm' : 'Remove'}>
          {confirm ? 'Confirm' : '✕'}
        </button>
      )}
      {isMe && (
        <button id={`member-leave-${member.id}`}
          className={`btn btn-sm ${confirm ? 'btn-danger' : 'btn-ghost'}`}
          onClick={handleRemove} onBlur={() => setConfirm(false)} disabled={isLoading}>
          {confirm ? 'Confirm' : 'Leave'}
        </button>
      )}
    </div>
  );
}
// ─── Team Detail Side Panel ───────────────────────────────────────────────────
function TeamDetailPanel({ onClose }) {
  const dispatch   = useDispatch();
  const team       = useSelector(selectCurrentTeam);
  const loading    = useSelector(selectTeamsLoading);
  const [showInvite, setShowInvite]   = useState(false);
  const [showEdit,   setShowEdit]     = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const isAdmin = team?.requesting_user_role === 'admin';
  const sortedMembers = useMemo(() => {
    if (!team?.members) return [];
    return [...team.members].sort((a, b) => {
      if (a.role === b.role) return a.id - b.id;
      return a.role === 'admin' ? -1 : 1;
    });
  }, [team?.members]);
  const handleClose = () => {
    dispatch(clearCurrentTeam());
    onClose();
  };
  return (
    <>
      <div className="panel-overlay" onClick={handleClose} />
      <aside className="panel" id="team-detail-panel" aria-label="Team details">
        <div className="panel-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading
              ? <div className="skeleton" style={{ height: '1.5rem', width: '60%' }} />
              : <>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team?.name}
                  </h2>
                  {isAdmin && <span className="badge badge-admin" style={{ marginTop: '0.25rem' }}>★ You're an admin</span>}
                </>
            }
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {!loading && isAdmin && (
              <>
                <button id="panel-edit-btn" className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>✏️ Edit</button>
                <button id="panel-delete-btn" className="btn btn-sm btn-danger" onClick={() => setShowDelete(true)}>🗑</button>
              </>
            )}
            <CloseBtn onClick={handleClose} id="panel-close-btn" />
          </div>
        </div>
        <div className="panel-body">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '60px' }} />
            ))
          ) : team ? (
            <>
              {team.description && (
                <div>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>About</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{team.description}</p>
                </div>
              )}
              <hr className="divider" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Members ({sortedMembers.length})
                </h3>
                {isAdmin && (
                  <button id="panel-invite-btn" className="btn btn-primary btn-sm"
                    onClick={() => { dispatch(clearActionError()); setShowInvite(true); }}>
                    + Invite
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '-0.5rem' }}>
                {sortedMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isMe={false}
                    isCurrentUserAdmin={isAdmin}
                    teamId={team.id}
                  />
                ))}
              </div>
              <hr className="divider" />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Created {new Date(team.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </>
          ) : null}
        </div>
      </aside>
      {showInvite && <InviteModal teamId={team?.id} onClose={() => { setShowInvite(false); dispatch(clearActionError()); }} />}
      {showEdit   && <EditTeamModal team={team} onClose={() => { setShowEdit(false); dispatch(clearActionError()); }} />}
      {showDelete && <DeleteConfirmModal team={team} onClose={() => { setShowDelete(false); handleClose(); }} />}
    </>
  );
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const dispatch  = useDispatch();
  const teams     = useSelector(selectTeams);
  const loading   = useSelector(selectTeamsLoading);
  const error     = useSelector(selectTeamsError);
  const [search,     setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate      = useNavigate();
  useEffect(() => { dispatch(fetchTeams()); }, [dispatch]);
  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams;
    const q = search.toLowerCase();
    return teams.filter((t) =>
      t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    );
  }, [teams, search]);
  const handleOpenTeam = (id) => navigate(`/teams/${id}`);
  return (
    <div className="page">
      <div className="page-content">
        <div className="section-header">
          <div>
            <h1>
              <span style={{ background: 'linear-gradient(135deg, #f0f0ff, #6c63ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Your Teams
              </span>
            </h1>
            <p style={{ marginTop: '0.35rem', fontSize: '1rem' }}>
              Collaborate and manage your projects across teams.
            </p>
          </div>
          <button id="create-team-btn" className="btn btn-primary btn-lg"
            onClick={() => { dispatch(clearActionError()); setShowCreate(true); }}>
            + New Team
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input id="teams-search" type="search" placeholder="Search teams…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {!loading && <span className="stat-pill">{filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}</span>}
        </div>
        {error && !loading && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
        )}
        {loading && (
          <div className="teams-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}
        {!loading && !error && filteredTeams.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            {search ? (
              <>
                <h3>No teams match "{search}"</h3>
                <p>Try a different search term.</p>
              </>
            ) : (
              <>
                <h3>You're not in any teams yet</h3>
                <p>Create your first team to start collaborating.</p>
                <button id="empty-create-btn" className="btn btn-primary"
                  onClick={() => { dispatch(clearActionError()); setShowCreate(true); }}>
                  + Create your first team
                </button>
              </>
            )}
          </div>
        )}
        {!loading && filteredTeams.length > 0 && (
          <div className="teams-grid">
            {filteredTeams.map((team, idx) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => handleOpenTeam(team.id)}
                style={{
                  animationName: 'cardIn',
                  animationDuration: 'var(--transition-slow)',
                  animationFillMode: 'both',
                  animationDelay: `${idx * 60}ms`,
                  animationTimingFunction: 'ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
      {showCreate && (
        <CreateTeamModal onClose={() => { setShowCreate(false); dispatch(clearActionError()); }} />
      )}
    </div>
  );
}
