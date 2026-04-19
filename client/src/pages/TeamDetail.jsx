import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addTeamMember, removeTeamMember, updateTeamMember, updateTeam, selectCurrentTeam, selectTeams } from '../store/teamsSlice.js';
import { getTeamMembers, getTeamProjects } from '../data/mockWorkspace.js';

function TeamMembersPanel({ team }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentTeam = useSelector(selectCurrentTeam);
  const allTeams = useSelector(selectTeams);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  // Find the richest version of this team: prefer the Redux teams list entry
  // (which now embeds members[]) over the prop passed from the parent.
  const richTeam = useMemo(
    () => allTeams.find((t) => String(t.id) === String(team?.id)) || team,
    [allTeams, team]
  );

  // Use the embedded members array if available; otherwise fall back to mock generator.
  const members = useMemo(() => {
    if (richTeam?.members?.length) return richTeam.members;
    if (currentTeam?.id === team?.id && currentTeam?.members?.length) return currentTeam.members;
    return getTeamMembers(richTeam);
  }, [richTeam, currentTeam, team]);

  // Viewer is admin when the team object says so.
  const isAdmin =
    richTeam?.requesting_user_role === 'admin' ||
    currentTeam?.requesting_user_role === 'admin';

  // For the demo the "current user" is the first member (id: 1).
  // When real auth is wired up, replace this with the auth slice user id.
  const CURRENT_USER_ID = members[0]?.id ?? 1;
  const currentUserMember = members.find((m) => String(m.id) === String(CURRENT_USER_ID));
  const isLastAdmin =
    currentUserMember?.role?.toLowerCase() === 'admin' &&
    members.filter((m) => m.role?.toLowerCase() === 'admin').length <= 1;

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    await dispatch(addTeamMember({ teamId: team.id, email: email.trim(), role }));
    setEmail('');
  };

  const handleLeave = async () => {
    await dispatch(removeTeamMember({ teamId: team.id, userId: CURRENT_USER_ID }));
    navigate('/teams');
  };

  return (
    <div className="page-stack">
      <article className="glass-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Team detail page</span>
            <h2>{team.name}</h2>
            <p className="subtle-copy">{team.description || 'This team currently has no description.'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAdmin && (
              <span className="role-badge admin-badge" title="You are an admin of this team">
                ★ Admin
              </span>
            )}
            <Link className="secondary-button" to={`/teams/${team.id}/settings`}>Team settings</Link>
          </div>
        </div>

        <div className="member-table">
          <div className="member-row header">
            <span>Member</span>
            <span>Role</span>
            <span>Join date</span>
            {isAdmin && <span>Action</span>}
          </div>
          {members.map((member) => {
            const memberIsAdmin    = member.role?.toLowerCase() === 'admin';
            const adminCount       = members.filter((m) => m.role?.toLowerCase() === 'admin').length;
            const isOnlyAdmin      = memberIsAdmin && adminCount <= 1;
            const newRole          = memberIsAdmin ? 'member' : 'admin';
            const roleLabel        = memberIsAdmin ? 'Demote to Member' : 'Promote to Admin';

            return (
              <div key={member.id} className="member-row">
                <div className="member-id">
                  <div className="team-avatar tiny">{member.name.slice(0, 2).toUpperCase()}</div>
                  <div className="member-copy">
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                  </div>
                </div>
                <span>
                  {memberIsAdmin
                    ? <span className="role-badge admin-badge">★ Admin</span>
                    : <span className="role-badge member-badge">Member</span>
                  }
                </span>
                <span>{member.joinedAt || member.joined_at
                  ? new Date(member.joinedAt || member.joined_at).toLocaleDateString()
                  : '—'}
                </span>
                {isAdmin && (
                  <div className="member-actions">
                    <button
                      className={memberIsAdmin ? 'role-toggle-btn demote' : 'role-toggle-btn promote'}
                      disabled={isOnlyAdmin && memberIsAdmin}
                      title={isOnlyAdmin ? 'Cannot demote the only admin' : roleLabel}
                      onClick={() => dispatch(updateTeamMember({ teamId: team.id, userId: member.id, role: newRole }))}
                    >
                      {memberIsAdmin ? '↓ Demote' : '↑ Promote'}
                    </button>
                    <button
                      className="text-action danger"
                      disabled={isOnlyAdmin}
                      title={isOnlyAdmin ? 'Cannot remove the only admin' : 'Remove member'}
                      onClick={() => dispatch(removeTeamMember({ teamId: team.id, userId: member.id }))}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>

      {/* Only admins can add new members */}
      {isAdmin && (
        <article className="glass-card form-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Admin action</span>
              <h3>Add a team member</h3>
              <p className="subtle-copy">Only admins can invite new members to this team.</p>
            </div>
          </div>
          <form className="inline-form" onSubmit={handleAdd}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="primary-button">Add member</button>
          </form>
        </article>
      )}

      {/* Leave Team — visible to every member */}
      <article className="glass-card danger-zone-card">
        <div className="danger-zone-header">
          <div>
            <span className="eyebrow danger-eyebrow">Danger zone</span>
            <h3>Leave this team</h3>
            <p className="subtle-copy">
              {isLastAdmin
                ? 'You are the only admin. Promote another member to admin before leaving.'
                : 'Once you leave, you will lose access to all projects and tasks in this team.'}
            </p>
          </div>
          {!leaveConfirm && (
            <button
              className="leave-team-btn"
              disabled={isLastAdmin}
              onClick={() => setLeaveConfirm(true)}
            >
              Leave team
            </button>
          )}
        </div>

        {leaveConfirm && (
          <div className="leave-confirm-box">
            <p className="leave-confirm-text">
              ⚠ Are you sure you want to leave <strong>{team.name}</strong>? This action cannot be undone.
            </p>
            <div className="leave-confirm-actions">
              <button className="primary-button danger-btn" onClick={handleLeave}>
                Yes, leave team
              </button>
              <button className="secondary-button" onClick={() => setLeaveConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function TeamSettingsPanel({ team }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');
  const [iconName, setIconName] = useState('No file chosen');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(updateTeam({ id: team.id, data: { name: name.trim(), description: description.trim() } }));
  };

  return (
    <article className="glass-card form-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Team settings page</span>
          <h2>Edit team profile</h2>
          <p className="subtle-copy">Update the team name, description, and icon placeholder from one place.</p>
        </div>
        <Link className="secondary-button" to={`/teams/${team.id}`}>Back to detail</Link>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Team name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Description
          <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Team icon
          <input
            type="file"
            onChange={(e) => setIconName(e.target.files?.[0]?.name || 'No file chosen')}
          />
          <small>{iconName}</small>
        </label>
        <button type="submit" className="primary-button">Save settings</button>
      </form>
    </article>
  );
}

export default function TeamDetail({ teams, workspace, mode = 'detail' }) {
  const { id } = useParams();
  const team = teams.find((item) => String(item.id) === String(id)) || teams[0];
  const projects = getTeamProjects(workspace, team?.id);

  if (!team) {
    return (
      <section className="page-stack">
        <article className="glass-card">
          <h2>No team available</h2>
        </article>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <span className="eyebrow">Workspace snapshot</span>
          <h2>{team.name}</h2>
          <p>{team.description || 'A dedicated team workspace for projects, tasks, and collaboration.'}</p>
        </div>
        <div className="hero-metrics">
          <div><strong>{`${team.member_count || 0} Members`}</strong><span>Team size</span></div>
          <div><strong>{`${projects.length} Projects`}</strong><span>Active work</span></div>
        </div>
      </div>

      {mode === 'settings' ? <TeamSettingsPanel team={team} /> : <TeamMembersPanel team={team} />}
    </section>
  );
}
